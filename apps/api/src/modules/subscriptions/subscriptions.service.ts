import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import {
  calculateSubscriptionAmount,
  includedModulesForPlan,
  isModuleSupportedForBusiness,
  moduleFeatureFlags,
  moduleCatalog,
  planLimits,
  planCatalog,
  roundMoney,
  type BillingInterval,
  type BusinessType,
  type ModuleId,
  type PlanCode,
} from "@businessos/domain";
import type { AuthUser } from "../../common/auth/auth-user";
import { PrismaService } from "../../common/prisma/prisma.service";
import { ManualBillingProvider } from "./billing-provider";
import { CheckoutSubscriptionDto } from "./checkout-subscription.dto";
import { CreateSubscriptionPaymentDto } from "./create-subscription-payment.dto";
import { UpdateSubscriptionDto } from "./update-subscription.dto";

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly billingProvider: ManualBillingProvider,
  ) {}

  async get(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        modules: { orderBy: { moduleId: "asc" } },
        subscription: {
          include: {
            items: { orderBy: [{ type: "asc" }, { code: "asc" }] },
            entitlements: { orderBy: { key: "asc" } },
            usageRecords: { orderBy: { recordedAt: "desc" }, take: 20 },
            invoices: { include: { lines: true, payments: true }, orderBy: { issuedAt: "desc" }, take: 12 },
            trials: { orderBy: { startedAt: "desc" }, take: 3 },
            payments: { orderBy: { createdAt: "desc" } },
          },
        },
      },
    });
    if (!tenant) throw new NotFoundException("Tenant not found.");
    if (!tenant.subscription) throw new NotFoundException("Subscription is not configured.");
    return {
      subscription: tenant.subscription,
      plans: planCatalog,
      modules: this.modulesForTenant(tenant.businessType, tenant.modules),
      pricing: this.pricingForTenant(tenant.businessType),
      usage: await this.currentUsage(tenantId, tenant.subscription.id),
    };
  }

  async listModules(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { modules: true },
    });
    if (!tenant) throw new NotFoundException("Tenant not found.");
    return this.modulesForTenant(tenant.businessType, tenant.modules);
  }

  async setModule(tenantId: string, user: AuthUser, moduleId: ModuleId, enabled: boolean, featureFlags?: Record<string, boolean>) {
    return this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.findUnique({
        where: { id: tenantId },
        include: { modules: true, subscription: true },
      });
      if (!tenant) throw new NotFoundException("Tenant not found.");
      if (!tenant.subscription) throw new NotFoundException("Subscription is not configured.");
      const definition = moduleCatalog.find((module) => module.id === moduleId);
      if (!definition || !isModuleSupportedForBusiness(tenant.businessType, moduleId) || !definition.available) {
        throw new BadRequestException("This module is not available for the tenant's business type.");
      }
      if (moduleId === "pos" && !enabled) {
        throw new BadRequestException("The POS module is required and cannot be disabled.");
      }

      const tenantModule = await tx.tenantModule.upsert({
        where: { tenantId_moduleId: { tenantId, moduleId } },
        create: { tenantId, moduleId, enabled, featureFlags: featureFlags ?? {} },
        update: { enabled, ...(featureFlags ? { featureFlags } : {}), ...(enabled ? { activatedAt: new Date() } : {}) },
      });
      const enabledModules = new Set(
        tenant.modules
          .filter((item) => item.enabled)
          .flatMap((item) => moduleCatalog.find((module) => module.id === item.moduleId)?.id ?? []),
      );
      if (enabled) enabledModules.add(moduleId);
      else enabledModules.delete(moduleId);
      const amount = calculateSubscriptionAmount(
        parsePlanCode(tenant.subscription.planCode),
        [...enabledModules],
        tenant.subscription.interval,
      );
      await tx.subscription.update({ where: { tenantId }, data: { amount } });
      await this.reconcileSubscription(tx, tenantId, tenant.subscription.id, tenant.businessType, parsePlanCode(tenant.subscription.planCode), tenant.subscription.interval, [...enabledModules]);
      await tx.auditLog.create({
        data: {
          tenantId,
          userId: user.id,
          action: enabled ? "subscription.module_enabled" : "subscription.module_disabled",
          entityType: "TenantModule",
          entityId: `${tenantId}:${moduleId}`,
          metadata: { moduleId, enabled, amount, featureFlags: featureFlags ?? undefined },
        },
      });
      return { ...tenantModule, monthlyAmount: amount };
    });
  }

  async updatePlan(tenantId: string, user: AuthUser, dto: UpdateSubscriptionDto) {
    return this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.findUnique({
        where: { id: tenantId },
        include: { modules: true, subscription: true },
      });
      if (!tenant) throw new NotFoundException("Tenant not found.");
      if (!tenant.subscription) throw new NotFoundException("Subscription is not configured.");

      const enabledModules = tenant.modules
        .filter((item) => item.enabled)
        .flatMap((item) => moduleCatalog.find((module) => module.id === item.moduleId)?.id ?? []);
      const amount = calculateSubscriptionAmount(dto.planCode, enabledModules, dto.interval);
      const subscription = await tx.subscription.update({
        where: { tenantId },
        data: { planCode: dto.planCode, interval: dto.interval, amount },
      });
      const plan = planCatalog.find((item) => item.code === dto.planCode);
      if (!plan) throw new BadRequestException("Unknown subscription plan.");
      await this.reconcileSubscription(tx, tenantId, subscription.id, tenant.businessType, dto.planCode, dto.interval, enabledModules);
      await tx.tenant.update({ where: { id: tenantId }, data: { plan: plan.name } });
      await tx.auditLog.create({
        data: {
          tenantId,
          userId: user.id,
          action: "subscription.plan_updated",
          entityType: "Subscription",
          entityId: subscription.id,
          metadata: { planCode: dto.planCode, interval: dto.interval, amount },
        },
      });
      return subscription;
    });
  }

  async checkout(tenantId: string, user: AuthUser, dto: CheckoutSubscriptionDto) {
    return this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.findUnique({
        where: { id: tenantId },
        include: { modules: true, subscription: true },
      });
      if (!tenant) throw new NotFoundException("Tenant not found.");
      if (!tenant.subscription) throw new NotFoundException("Subscription is not configured.");
      const requestedModules = dto.moduleIds ?? tenant.modules.filter((item) => item.enabled).map((item) => item.moduleId as ModuleId);
      this.assertModulesCompatible(tenant.businessType, requestedModules);
      const amount = calculateSubscriptionAmount(dto.planCode, requestedModules, dto.interval);
      const subscription = await tx.subscription.update({
        where: { tenantId },
        data: { planCode: dto.planCode, interval: dto.interval, amount, provider: this.billingProvider.name },
      });
      const plan = planCatalog.find((item) => item.code === dto.planCode);
      await tx.tenant.update({ where: { id: tenantId }, data: { plan: plan?.name ?? dto.planCode } });
      for (const moduleId of requestedModules) {
        await tx.tenantModule.upsert({
          where: { tenantId_moduleId: { tenantId, moduleId } },
          create: { tenantId, moduleId, enabled: true },
          update: { enabled: true, activatedAt: new Date() },
        });
      }
      await this.reconcileSubscription(tx, tenantId, subscription.id, tenant.businessType, dto.planCode, dto.interval, requestedModules);
      const invoice = await this.createInvoice(tx, tenantId, subscription.id, dto.planCode, dto.interval, requestedModules);
      const checkout = await this.billingProvider.createCheckout({
        tenantId,
        subscriptionId: subscription.id,
        invoiceId: invoice.id,
        amount: Number(invoice.total),
        currency: invoice.currency,
        interval: dto.interval,
      });
      await tx.auditLog.create({
        data: { tenantId, userId: user.id, action: "subscription.checkout_created", entityType: "Invoice", entityId: invoice.id, metadata: { planCode: dto.planCode, interval: dto.interval, moduleIds: requestedModules, provider: checkout.provider } },
      });
      return { subscription, invoice, checkout };
    });
  }

  async cancel(tenantId: string, user: AuthUser) {
    const subscription = await this.prisma.subscription.update({
      where: { tenantId },
      data: { cancelAtPeriodEnd: true, status: "cancelled" },
    });
    await this.prisma.auditLog.create({ data: { tenantId, userId: user.id, action: "subscription.cancelled", entityType: "Subscription", entityId: subscription.id } });
    return subscription;
  }

  async renew(tenantId: string, user: AuthUser) {
    return this.prisma.$transaction(async (tx) => {
      const subscription = await tx.subscription.findUnique({ where: { tenantId } });
      if (!subscription) throw new NotFoundException("Subscription is not configured.");
      const currentPeriodEnd = addBillingPeriod(subscription.currentPeriodEnd > new Date() ? subscription.currentPeriodEnd : new Date(), subscription.interval as BillingInterval);
      const updated = await tx.subscription.update({ where: { tenantId }, data: { status: "active", cancelAtPeriodEnd: false, currentPeriodEnd } });
      await tx.tenant.update({ where: { id: tenantId }, data: { status: "active" } });
      await tx.auditLog.create({ data: { tenantId, userId: user.id, action: "subscription.renewed", entityType: "Subscription", entityId: subscription.id } });
      return updated;
    });
  }

  async recordPayment(tenantId: string, user: AuthUser, dto: CreateSubscriptionPaymentDto) {
    return this.prisma.$transaction(async (tx) => {
      const subscription = await tx.subscription.findUnique({ where: { tenantId }, include: { invoices: { where: { status: { in: ["open", "draft"] } }, orderBy: { issuedAt: "desc" }, take: 1 } } });
      if (!subscription) throw new NotFoundException("Subscription is not configured.");
      const invoice = subscription.invoices[0] ?? await this.createInvoice(tx, tenantId, subscription.id, parsePlanCode(subscription.planCode), subscription.interval as BillingInterval, await this.enabledModuleIds(tx, tenantId));
      const payment = await tx.subscriptionPayment.create({
        data: { subscriptionId: subscription.id, invoiceId: invoice.id, amount: invoice.dueAmount, currency: invoice.currency, provider: this.billingProvider.name, method: dto.method, reference: dto.reference, status: "pending" },
      });
      await tx.auditLog.create({
        data: {
          tenantId,
          userId: user.id,
          action: "subscription.payment_submitted",
          entityType: "SubscriptionPayment",
          entityId: payment.id,
          metadata: { amount: Number(payment.amount), method: payment.method, invoiceId: invoice.id, provider: this.billingProvider.name },
        },
      });
      return payment;
    });
  }

  async listPayments() {
    return this.prisma.subscriptionPayment.findMany({
      include: {
        subscription: {
          select: { tenantId: true, planCode: true, interval: true, tenant: { select: { name: true, businessType: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async updatePaymentStatus(paymentId: string, user: AuthUser, status: "captured" | "failed" | "refunded") {
    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.subscriptionPayment.findUnique({
        where: { id: paymentId },
        include: { invoice: true, subscription: { include: { tenant: true } } },
      });
      if (!payment) throw new NotFoundException("Subscription payment not found.");
      if (payment.status === status) return payment;
      const canTransition =
        (payment.status === "pending" && (status === "captured" || status === "failed")) ||
        (payment.status === "captured" && status === "refunded");
      if (!canTransition) {
        throw new BadRequestException(`A ${payment.status} payment cannot be marked ${status}.`);
      }

      const updatedPayment = await tx.subscriptionPayment.update({
        where: { id: paymentId },
        data: { status, paidAt: status === "captured" ? new Date() : null },
      });
      if (status === "captured" && payment.status !== "captured") {
        const now = new Date();
        const start = payment.subscription.currentPeriodEnd > now ? payment.subscription.currentPeriodEnd : now;
        const currentPeriodEnd = addBillingPeriod(start, payment.subscription.interval as BillingInterval);
        await tx.subscription.update({
          where: { id: payment.subscriptionId },
          data: { status: "active", currentPeriodEnd, cancelAtPeriodEnd: false },
        });
        if (payment.invoiceId) {
          await tx.invoice.update({ where: { id: payment.invoiceId }, data: { status: "paid", dueAmount: 0, paidAt: new Date() } });
        }
        await tx.tenant.update({ where: { id: payment.subscription.tenantId }, data: { status: "active" } });
      }
      await tx.auditLog.create({
        data: {
          tenantId: payment.subscription.tenantId,
          userId: user.id,
          action: `subscription.payment_${status}`,
          entityType: "SubscriptionPayment",
          entityId: payment.id,
          metadata: { previousStatus: payment.status, status },
        },
      });
      return updatedPayment;
    });
  }

  private modulesForTenant(
    businessType: BusinessType,
    tenantModules: Array<{ moduleId: string; enabled: boolean; featureFlags?: unknown; activatedAt: Date; expiresAt: Date | null }>,
  ) {
    const byId = new Map(tenantModules.map((item) => [item.moduleId, item]));
    return moduleCatalog
      .filter((module) => isModuleSupportedForBusiness(businessType, module.id))
      .map((module) => ({
        ...module,
        featureFlags: moduleFeatureFlags(module.id, asFeatureFlags(byId.get(module.id)?.featureFlags)),
        enabled: module.available && (byId.get(module.id)?.enabled ?? false),
        activatedAt: byId.get(module.id)?.activatedAt ?? null,
        expiresAt: byId.get(module.id)?.expiresAt ?? null,
      }));
  }

  private pricingForTenant(businessType: BusinessType) {
    return {
      plans: planCatalog,
      modules: moduleCatalog.filter((module) => isModuleSupportedForBusiness(businessType, module.id)),
    };
  }

  private async currentUsage(tenantId: string, subscriptionId: string) {
    const [branchCount, userCount, usageRecords] = await Promise.all([
      this.prisma.branch.count({ where: { tenantId, isActive: true } }),
      this.prisma.tenantMembership.count({ where: { tenantId, status: "active" } }),
      this.prisma.usageRecord.groupBy({ by: ["entitlementKey"], where: { tenantId, subscriptionId }, _sum: { quantity: true } }),
    ]);
    const metered = new Map(usageRecords.map((item) => [item.entitlementKey, item._sum.quantity ?? 0]));
    return {
      branches: branchCount,
      users: userCount,
      devices: metered.get("devices") ?? 0,
      storageGb: metered.get("storageGb") ?? 0,
      sms: metered.get("sms") ?? 0,
    };
  }

  private async reconcileSubscription(
    tx: Prisma.TransactionClient,
    tenantId: string,
    subscriptionId: string,
    businessType: BusinessType,
    planCode: PlanCode,
    interval: BillingInterval,
    moduleIds: ModuleId[],
  ) {
    const plan = planCatalog.find((item) => item.code === planCode);
    if (!plan) throw new BadRequestException("Unknown subscription plan.");
    const included = new Set(includedModulesForPlan(planCode));
    await tx.subscriptionItem.upsert({
      where: { subscriptionId_type_code: { subscriptionId, type: "plan", code: planCode } },
      create: { subscriptionId, type: "plan", code: planCode, name: plan.name, quantity: 1, unitAmount: plan.monthlyBasePrice, interval },
      update: { name: plan.name, unitAmount: plan.monthlyBasePrice, interval, status: "active" },
    });

    const activeModules = [...new Set(moduleIds)].filter((moduleId) => {
      const definition = moduleCatalog.find((module) => module.id === moduleId);
      return definition?.available && isModuleSupportedForBusiness(businessType, moduleId);
    });
    for (const moduleId of activeModules) {
      const definition = moduleCatalog.find((module) => module.id === moduleId)!;
      await tx.subscriptionItem.upsert({
        where: { subscriptionId_type_code: { subscriptionId, type: "module", code: moduleId } },
        create: { subscriptionId, type: "module", code: moduleId, name: definition.name, quantity: 1, unitAmount: included.has(moduleId) ? 0 : definition.monthlyPrice, interval, featureFlags: definition.featureFlags },
        update: { name: definition.name, unitAmount: included.has(moduleId) ? 0 : definition.monthlyPrice, interval, status: "active", featureFlags: definition.featureFlags },
      });
    }
    await tx.subscriptionItem.updateMany({
      where: { subscriptionId, type: "module", code: { notIn: activeModules } },
      data: { status: "inactive" },
    });

    const limits = planLimits(planCode);
    const entitlements: Array<[string, string, number | null, string]> = [
      ["branches", "Branch limit", limits.branches, "branch"],
      ["users", "User limit", limits.users, "user"],
      ["devices", "Device limit", limits.devices, "device"],
      ["storageGb", "Storage limit", limits.storageGb, "GB"],
      ["sms", "SMS limit", limits.sms, "message"],
    ];
    for (const [key, name, limit, unit] of entitlements) {
      await tx.entitlement.upsert({
        where: { tenantId_key: { tenantId, key } },
        create: { tenantId, subscriptionId, key, name, limit, unit, source: "plan" },
        update: { subscriptionId, name, limit, unit, source: "plan" },
      });
    }
    for (const moduleId of activeModules) {
      const definition = moduleCatalog.find((module) => module.id === moduleId)!;
      await tx.entitlement.upsert({
        where: { tenantId_key: { tenantId, key: `module:${moduleId}` } },
        create: { tenantId, subscriptionId, key: `module:${moduleId}`, name: definition.name, unit: "module", source: "module", metadata: { moduleId, featureFlags: definition.featureFlags } },
        update: { subscriptionId, name: definition.name, source: "module", metadata: { moduleId, featureFlags: definition.featureFlags } },
      });
    }
  }

  private async createInvoice(
    tx: Prisma.TransactionClient,
    tenantId: string,
    subscriptionId: string,
    planCode: PlanCode,
    interval: BillingInterval,
    moduleIds: ModuleId[],
  ) {
    const plan = planCatalog.find((item) => item.code === planCode);
    if (!plan) throw new BadRequestException("Unknown subscription plan.");
    const included = new Set(includedModulesForPlan(planCode));
    const multiplier = interval === "yearly" ? 12 : 1;
    const discount = interval === "yearly" ? 0.9 : 1;
    const lines = [
      { itemType: "plan", code: plan.code, description: `${plan.name} base subscription`, quantity: 1, unitAmount: plan.monthlyBasePrice * multiplier * discount },
      ...[...new Set(moduleIds)].flatMap((moduleId) => {
        const module = moduleCatalog.find((item) => item.id === moduleId);
        if (!module?.available || included.has(moduleId)) return [];
        return [{ itemType: "module", code: module.id, description: module.name, quantity: 1, unitAmount: module.monthlyPrice * multiplier * discount }];
      }),
    ];
    const subtotal = roundMoney(lines.reduce((total, line) => total + line.unitAmount * line.quantity, 0));
    const invoiceNo = `INV-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    return tx.invoice.create({
      data: {
        tenantId,
        subscriptionId,
        invoiceNo,
        status: "open",
        subtotal,
        total: subtotal,
        dueAmount: subtotal,
        dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        lines: { create: lines.map((line) => ({ ...line, total: roundMoney(line.unitAmount * line.quantity) })) },
      },
      include: { lines: true, payments: true },
    });
  }

  private async enabledModuleIds(tx: Prisma.TransactionClient, tenantId: string): Promise<ModuleId[]> {
    const modules = await tx.tenantModule.findMany({ where: { tenantId, enabled: true }, select: { moduleId: true } });
    return modules.map((module) => module.moduleId as ModuleId);
  }

  private assertModulesCompatible(businessType: BusinessType, moduleIds: ModuleId[]) {
    for (const moduleId of moduleIds) {
      const definition = moduleCatalog.find((module) => module.id === moduleId);
      if (!definition?.available || !isModuleSupportedForBusiness(businessType, moduleId)) {
        throw new BadRequestException(`The ${moduleId} module is not available for this business type.`);
      }
    }
  }
}

function parsePlanCode(value: string): PlanCode {
  const plan = planCatalog.find((item) => item.code === value);
  if (!plan) throw new BadRequestException("The tenant has an unsupported subscription plan.");
  return plan.code;
}

function asFeatureFlags(value: unknown): Record<string, boolean> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.entries(value).reduce<Record<string, boolean>>((flags, [key, flag]) => {
    if (typeof flag === "boolean") flags[key] = flag;
    return flags;
  }, {});
}

function addBillingPeriod(date: Date, interval: BillingInterval) {
  const monthDelta = interval === "yearly" ? 12 : 1;
  const month = date.getUTCMonth() + monthDelta;
  const lastDay = new Date(Date.UTC(date.getUTCFullYear(), month + 1, 0)).getUTCDate();
  return new Date(Date.UTC(
    date.getUTCFullYear(),
    month,
    Math.min(date.getUTCDate(), lastDay),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
    date.getUTCMilliseconds(),
  ));
}
