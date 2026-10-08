import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { compare } from "bcryptjs";
import { PrismaService } from "../../common/prisma/prisma.service";
import type { AuthUser } from "../../common/auth/auth-user";
import { LoginDto } from "./login.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const workspace = dto.workspace ?? "business";
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: { tenant: { include: { branches: true, modules: true, storefront: true, subscription: true } } },
    });
    const isPlatformAdmin = user?.role === "platformAdmin";
    if (
      !user ||
      user.status !== "active" ||
      (workspace === "platform" ? !isPlatformAdmin || user.tenantId !== null : isPlatformAdmin) ||
      (isPlatformAdmin ? user.tenantId !== null : !user.tenant || !["trial", "active"].includes(user.tenant.status)) ||
      !(await compare(dto.password, user.passwordHash))
    ) {
      throw new UnauthorizedException("Email or password is incorrect.");
    }

    await this.prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    const profile = this.toAuthUser(user);
    return {
      accessToken: await this.jwt.signAsync({ sub: user.id, tenantId: user.tenantId, role: user.role }),
      expiresIn: 28_800,
      user: profile,
      tenant: user.tenant ? this.toTenant(user.tenant) : null,
    };
  }

  async session(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { tenant: { include: { branches: true, modules: true, storefront: true, subscription: true } } },
    });
    if (!user || user.status !== "active") throw new UnauthorizedException();
    if (!user.tenantId) {
      if (user.role !== "platformAdmin") throw new UnauthorizedException();
      return { user: this.toAuthUser(user), tenant: null };
    }
    if (!user.tenant || !["trial", "active"].includes(user.tenant.status)) throw new UnauthorizedException();
    return { user: this.toAuthUser(user), tenant: this.toTenant(user.tenant) };
  }

  private toAuthUser(user: { id: string; tenantId: string | null; branchId: string | null; name: string; email: string; role: AuthUser["role"] }): AuthUser {
    return { id: user.id, tenantId: user.tenantId, branchId: user.branchId, name: user.name, email: user.email, role: user.role };
  }

  private toTenant(tenant: {
    id: string;
    name: string;
    businessType: string;
    plan: string;
    status: string;
    currency: string;
    receiptWidth: string;
    vatRate: unknown;
    serviceRate: unknown;
    branches: { id: string; name: string; code: string; isActive: boolean }[];
    modules: { moduleId: string; enabled: boolean }[];
    storefront: { status: string } | null;
    subscription: { status: string; currentPeriodEnd: Date } | null;
  }) {
    return {
      id: tenant.id,
      name: tenant.name,
      businessType: tenant.businessType,
      plan: tenant.plan,
      status: tenant.status,
      currency: tenant.currency,
      receiptWidth: tenant.receiptWidth,
      vatRate: Number(tenant.vatRate),
      serviceRate: Number(tenant.serviceRate),
      branches: tenant.branches.filter((branch) => branch.isActive),
      enabledModules: tenant.modules.filter((item) => item.enabled).map((item) => item.moduleId),
      storefrontStatus: tenant.storefront?.status ?? "draft",
      subscription: tenant.subscription,
    };
  }
}
