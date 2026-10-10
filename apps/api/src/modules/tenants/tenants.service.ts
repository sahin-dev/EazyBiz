import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { availableRecommendedModules, calculateSubscriptionAmount, getBusinessTypeConfig, moduleCatalog, planCatalog, planLimits } from "@businessos/domain";
import { hash } from "bcryptjs";
import { randomBytes } from "node:crypto";
import { PrismaService } from "../../common/prisma/prisma.service";
import { CreateTenantDto } from "./create-tenant.dto";

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string) {
    const tenants = await this.prisma.tenant.findMany({
      where: { id: tenantId },
      include: {
        modules: true,
        storefront: true,
        branches: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return tenants.map((tenant) => ({
      id: tenant.id,
      name: tenant.name,
      businessType: tenant.businessType,
      plan: tenant.plan,
      enabledModules: tenant.modules.filter((module) => module.enabled && (!module.expiresAt || module.expiresAt > new Date())).map((module) => module.moduleId),
      storefrontStatus: tenant.storefront?.status ?? "draft",
      branches: tenant.branches,
    }));
  }

  async get(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: { branches: true, modules: true, storefront: true },
    });
    if (!tenant) throw new NotFoundException("Tenant not found.");
    return tenant;
  }

  async listAll() {
    const tenants = await this.prisma.tenant.findMany({
      include: {
        branches: { select: { id: true, name: true, isActive: true } },
        modules: true,
        subscription: { select: { planCode: true, status: true, interval: true, amount: true, currentPeriodEnd: true } },
        _count: { select: { users: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return tenants.map((tenant) => ({
      id: tenant.id,
      name: tenant.name,
      businessType: tenant.businessType,
      status: tenant.status,
      plan: tenant.plan,
      enabledModules: tenant.modules.filter((module) => module.enabled && (!module.expiresAt || module.expiresAt > new Date())).map((module) => module.moduleId),
      branches: tenant.branches,
      userCount: tenant._count.users,
      subscription: tenant.subscription,
    }));
  }

  async setStatus(
    tenantId: string,
    userId: string,
    status: "trial" | "active" | "suspended" | "cancelled",
  ) {
    return this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.findUnique({ where: { id: tenantId }, select: { id: true } });
      if (!tenant) throw new NotFoundException("Tenant not found.");
      const updated = await tx.tenant.update({ where: { id: tenantId }, data: { status } });
      await tx.auditLog.create({
        data: {
          tenantId,
          userId,
          action: "platform.tenant_status_updated",
          entityType: "Tenant",
          entityId: tenantId,
          metadata: { status },
        },
      });
      return updated;
    });
  }

  async create(dto: CreateTenantDto, existingUserId?: string, requireVerification = false) {
    const recommendedModules = availableRecommendedModules(dto.businessType);
    const config = getBusinessTypeConfig(dto.businessType);
    const passwordHash = existingUserId ? null : await hash(dto.password, 12);
    const slugBase = dto.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "business";
    const subscriptionAmount = calculateSubscriptionAmount(
      "starter",
      recommendedModules,
      "monthly",
    );

    return this.prisma.$transaction(async (tx) => {
      const businessType = await tx.businessTypeDefinition.findUnique({
        where: { code: dto.businessType },
      });
      if (businessType?.status !== "active") throw new BadRequestException("Business type is unavailable.");
      const tenant = await tx.tenant.create({
        data: {
          name: dto.name,
          businessType: dto.businessType,
          phone: dto.phone,
          email: dto.email,
          serviceRate: config.pos.serviceRate,
          modules: {
            create: recommendedModules.map((moduleId) => ({ moduleId })),
          },
          storefront: {
            create: {
              slug: `${slugBase}-${randomBytes(5).toString("hex")}`,
              heroTitle: dto.name,
              tagline: config.storefrontTheme.heroTone,
              theme: config.storefrontTheme.name,
              primaryColor: config.storefrontTheme.primaryColor,
              sections: config.storefrontTheme.defaultSections.map((section) => (
                section.id === "hero" ? { ...section, title: dto.name } : section
              )),
            },
          },
          subscription: {
            create: {
              planCode: "starter",
              amount: subscriptionAmount,
              trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
              currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            },
          },
        },
      });
      const subscription = await tx.subscription.findUniqueOrThrow({ where: { tenantId: tenant.id } });
      const starterPlan = planCatalog.find((plan) => plan.code === "starter")!;
      await tx.subscriptionItem.create({
        data: { subscriptionId: subscription.id, type: "plan", code: starterPlan.code, name: starterPlan.name, unitAmount: starterPlan.monthlyBasePrice, interval: "monthly" },
      });
      for (const moduleId of recommendedModules) {
        const module = moduleCatalog.find((item) => item.id === moduleId);
        if (module) await tx.subscriptionItem.create({
          data: { subscriptionId: subscription.id, type: "module", code: module.id, name: module.name, unitAmount: starterPlan.includedModules.includes(module.id) ? 0 : module.monthlyPrice, interval: "monthly", featureFlags: module.featureFlags },
        });
      }
      const limits = planLimits("starter");
      for (const [key, name, limit, unit] of [
        ["branches", "Branch limit", limits.branches, "branch"],
        ["users", "User limit", limits.users, "user"],
        ["devices", "Device limit", limits.devices, "device"],
        ["storageGb", "Storage limit", limits.storageGb, "GB"],
        ["sms", "SMS limit", limits.sms, "message"],
      ] as const) {
        await tx.entitlement.create({ data: { tenantId: tenant.id, subscriptionId: subscription.id, key, name, limit, unit, source: "plan" } });
      }
      await tx.trial.create({ data: { tenantId: tenant.id, subscriptionId: subscription.id, endsAt: subscription.trialEndsAt ?? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) } });
      const business = await tx.business.create({
        data: {
          tenantId: tenant.id,
          businessTypeId: businessType.id,
          legalName: dto.name,
          tradingName: dto.name,
          currencyCode: tenant.currency,
        },
      });
      await tx.branch.create({
        data: {
          tenantId: tenant.id,
          businessId: business.id,
          name: dto.branchName,
          code: "MAIN",
          address: dto.branchAddress,
          phone: dto.phone,
        },
      });
      const owner = existingUserId
        ? await tx.user.findUniqueOrThrow({ where: { id: existingUserId } })
        : await tx.user.create({
          data: {
            tenantId: tenant.id,
            name: dto.ownerName,
            email: dto.email.toLowerCase(),
            passwordHash: passwordHash!,
            role: "owner",
            emailVerifiedAt: requireVerification ? null : new Date(),
          },
        });
      await tx.tenantMembership.create({ data: { tenantId: tenant.id, userId: owner.id, role: "owner" } });
      await tx.auditLog.create({ data: { tenantId: tenant.id, userId: owner.id, action: "tenant.created", entityType: "Tenant", entityId: tenant.id } });
      return tx.tenant.findUniqueOrThrow({
        where: { id: tenant.id },
        include: { branches: true, modules: true, storefront: true, subscription: true },
      });
    });
  }

  async createBranch(tenantId: string, userId: string, name: string, code: string, address: string) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const business = await tx.business.findUnique({ where: { tenantId }, select: { id: true } });
        if (!business) throw new NotFoundException("Business not found.");
        const branch = await tx.branch.create({ data: { tenantId, businessId: business.id, name: name.trim(), code: code.trim().toUpperCase(), address: address.trim() } });
        await tx.auditLog.create({ data: { tenantId, userId, action: "branch.created", entityType: "Branch", entityId: branch.id } });
        return branch;
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") throw new ConflictException("Branch code already exists in this workspace.");
      throw error;
    }
  }
}
