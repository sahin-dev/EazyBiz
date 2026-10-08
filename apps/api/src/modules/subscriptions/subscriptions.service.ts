import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import {
  calculateSubscriptionAmount,
  moduleCatalog,
  planCatalog,
  type BillingInterval,
  type BusinessType,
  type ModuleId,
  type PlanCode,
} from "@businessos/domain";
import type { AuthUser } from "../../common/auth/auth-user";
import { PrismaService } from "../../common/prisma/prisma.service";
import { CreateSubscriptionPaymentDto } from "./create-subscription-payment.dto";
import { UpdateSubscriptionDto } from "./update-subscription.dto";

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async get(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        modules: { orderBy: { moduleId: "asc" } },
        subscription: { include: { payments: { orderBy: { createdAt: "desc" } } } },
      },
    });
    if (!tenant) throw new NotFoundException("Tenant not found.");
    if (!tenant.subscription) throw new NotFoundException("Subscription is not configured.");
    return {
      subscription: tenant.subscription,
      plans: planCatalog,
      modules: this.modulesForTenant(tenant.businessType, tenant.modules),
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

  async setModule(tenantId: string, user: AuthUser, moduleId: ModuleId, enabled: boolean) {
    return this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.findUnique({
        where: { id: tenantId },
        include: { modules: true, subscription: true },
      });
      if (!tenant) throw new NotFoundException("Tenant not found.");
      if (!tenant.subscription) throw new NotFoundException("Subscription is not configured.");
      const definition = moduleCatalog.find((module) => module.id === moduleId);
      if (!definition || !definition.businessTypes.includes(tenant.businessType) || !definition.available) {
        throw new BadRequestException("This module is not available for the tenant's business type.");
      }
      if (moduleId === "pos" && !enabled) {
        throw new BadRequestException("The POS module is required and cannot be disabled.");
      }

      const tenantModule = await tx.tenantModule.upsert({
        where: { tenantId_moduleId: { tenantId, moduleId } },
        create: { tenantId, moduleId, enabled },
        update: { enabled, ...(enabled ? { activatedAt: new Date() } : {}) },
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
      await tx.auditLog.create({
        data: {
          tenantId,
          userId: user.id,
          action: enabled ? "subscription.module_enabled" : "subscription.module_disabled",
          entityType: "TenantModule",
          entityId: `${tenantId}:${moduleId}`,
          metadata: { moduleId, enabled, amount },
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

  async recordPayment(tenantId: string, user: AuthUser, dto: CreateSubscriptionPaymentDto) {
    return this.prisma.$transaction(async (tx) => {
      const subscription = await tx.subscription.findUnique({ where: { tenantId } });
      if (!subscription) throw new NotFoundException("Subscription is not configured.");
      const payment = await tx.subscriptionPayment.create({
        data: { subscriptionId: subscription.id, amount: subscription.amount, method: dto.method, reference: dto.reference, status: "pending" },
      });
      await tx.auditLog.create({
        data: {
          tenantId,
          userId: user.id,
          action: "subscription.payment_submitted",
          entityType: "SubscriptionPayment",
          entityId: payment.id,
          metadata: { amount: Number(payment.amount), method: payment.method },
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
        include: { subscription: { include: { tenant: true } } },
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
    tenantModules: Array<{ moduleId: string; enabled: boolean; activatedAt: Date; expiresAt: Date | null }>,
  ) {
    const byId = new Map(tenantModules.map((item) => [item.moduleId, item]));
    return moduleCatalog
      .filter((module) => module.businessTypes.includes(businessType))
      .map((module) => ({
        ...module,
        enabled: module.available && (byId.get(module.id)?.enabled ?? false),
        activatedAt: byId.get(module.id)?.activatedAt ?? null,
        expiresAt: byId.get(module.id)?.expiresAt ?? null,
      }));
  }
}

function parsePlanCode(value: string): PlanCode {
  const plan = planCatalog.find((item) => item.code === value);
  if (!plan) throw new BadRequestException("The tenant has an unsupported subscription plan.");
  return plan.code;
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
