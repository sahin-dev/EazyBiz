import { Injectable, NotFoundException } from "@nestjs/common";
import { availableRecommendedModules, businessTypeConfigs, calculateSubscriptionAmount } from "@businessos/domain";
import { hash } from "bcryptjs";
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
      enabledModules: tenant.modules.filter((module) => module.enabled).map((module) => module.moduleId),
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
      enabledModules: tenant.modules.filter((module) => module.enabled).map((module) => module.moduleId),
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

  async create(dto: CreateTenantDto) {
    const config = businessTypeConfigs[dto.businessType];
    const recommendedModules = availableRecommendedModules(dto.businessType);
    const passwordHash = await hash(dto.password, 12);
    const slugBase = dto.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "business";
    const subscriptionAmount = calculateSubscriptionAmount(
      "starter",
      recommendedModules,
      "monthly",
    );

    return this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: dto.name,
          businessType: dto.businessType,
          phone: dto.phone,
          email: dto.email,
          serviceRate: dto.businessType === "restaurant" ? 5 : 0,
          branches: {
            create: {
              name: dto.branchName,
              code: "MAIN",
              address: dto.branchAddress,
              phone: dto.phone,
            },
          },
          modules: {
            create: recommendedModules.map((moduleId) => ({ moduleId })),
          },
          storefront: {
            create: {
              slug: `${slugBase}-${Date.now().toString().slice(-6)}`,
              heroTitle: dto.name,
              tagline: "Sell online from your BusinessOS storefront.",
              theme: "modern",
              sections: [
                { id: "hero", type: "hero", title: dto.name, subtitle: "Welcome to our store.", visible: true },
                { id: "categories", type: "categories", title: "Shop by category", subtitle: "Products sync from POS.", visible: true },
              ],
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
        include: { branches: true, modules: true, storefront: true, subscription: true },
      });
      await tx.user.create({
        data: {
          tenantId: tenant.id,
          branchId: tenant.branches[0].id,
          name: dto.ownerName,
          email: dto.email.toLowerCase(),
          passwordHash,
          role: "owner",
        },
      });
      return tenant;
    });
  }
}
