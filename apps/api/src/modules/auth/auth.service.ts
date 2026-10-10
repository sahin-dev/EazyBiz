import { BadRequestException, ForbiddenException, Injectable, ServiceUnavailableException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Prisma } from "@prisma/client";
import { moduleFeatureFlags, type ModuleId } from "@businessos/domain";
import { compare, hash } from "bcryptjs";
import { createHash, randomBytes } from "node:crypto";
import { PrismaService } from "../../common/prisma/prisma.service";
import type { AuthUser } from "../../common/auth/auth-user";
import { TenantsService } from "../tenants/tenants.service";
import { CreateTenantDto } from "../tenants/create-tenant.dto";
import { EmailService } from "./email.service";
import { LoginDto } from "./login.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly email: EmailService,
    private readonly tenants: TenantsService,
  ) {}

  async signup(dto: CreateTenantDto) {
    if (!this.email.ready) throw new ServiceUnavailableException("Sign up is unavailable until email delivery is configured.");
    if (Buffer.byteLength(dto.password, "utf8") > 72) throw new BadRequestException("Password must be 72 bytes or fewer.");
    const email = dto.email.trim().toLowerCase();
    if (await this.prisma.user.findUnique({ where: { email }, select: { id: true } })) throw new BadRequestException("This email already has an account. Sign in to add a workspace.");
    try {
      await this.tenants.create({ ...dto, email }, undefined, true);
      const owner = await this.prisma.user.findUniqueOrThrow({ where: { email }, select: { id: true } });
      await this.sendAccountLink(owner.id, email, "verify");
      return { message: "Check your email to verify your account before signing in." };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") throw new BadRequestException("This email already has an account.");
      throw error;
    }
  }

  async login(dto: LoginDto, userAgent?: string) {
    const workspace = dto.workspace ?? "business";
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.trim().toLowerCase() },
      include: { memberships: { include: { tenant: true } } },
    });
    const isPlatformAdmin = user?.role === "platformAdmin";
    if (
      !user ||
      user.status !== "active" || !user.emailVerifiedAt ||
      (workspace === "platform" ? !isPlatformAdmin || user.tenantId !== null : isPlatformAdmin) ||
      (isPlatformAdmin ? user.tenantId !== null : !user.memberships.some((item) => item.status === "active" && ["trial", "active"].includes(item.tenant.status))) ||
      !(await compare(dto.password, user.passwordHash))
    ) {
      throw new UnauthorizedException("Email or password is incorrect.");
    }

    await this.prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    const membership = isPlatformAdmin ? null : user.memberships.find((item) => item.tenantId === user.tenantId && item.role !== "platformAdmin" && item.status === "active" && ["trial", "active"].includes(item.tenant.status)) ?? user.memberships.find((item) => item.role !== "platformAdmin" && item.status === "active" && ["trial", "active"].includes(item.tenant.status));
    const session = await this.prisma.$transaction(async (tx) => {
      const created = await tx.authSession.create({ data: { userId: user.id, tenantId: membership?.tenantId ?? null, expiresAt: new Date(Date.now() + 28_800_000), userAgent: userAgent?.slice(0, 255) } });
      await tx.auditLog.create({ data: { tenantId: membership?.tenantId, userId: user.id, action: "auth.login", entityType: "AuthSession", entityId: created.id } });
      return created;
    });
    const context = await this.session(user.id, membership?.tenantId ?? null);
    return {
      accessToken: await this.jwt.signAsync({ sub: user.id, sid: session.id, tenantId: membership?.tenantId ?? null }),
      expiresIn: 28_800,
      ...context,
    };
  }

  async session(userId: string, tenantId: string | null) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user || user.status !== "active" || !user.emailVerifiedAt) throw new UnauthorizedException();
    if (!tenantId) {
      if (user.role !== "platformAdmin" || user.tenantId !== null) throw new UnauthorizedException();
      return { user: this.toAuthUser(user, null, null, "platformAdmin"), tenant: null };
    }
    const membership = await this.prisma.tenantMembership.findUnique({ where: { userId_tenantId: { userId, tenantId } }, include: { branch: true, tenant: { include: { branches: true, modules: true, storefront: true, subscription: true } } } });
    if (!membership || membership.role === "platformAdmin" || membership.status !== "active" || !["trial", "active"].includes(membership.tenant.status) || (membership.branch && !membership.branch.isActive)) throw new UnauthorizedException();
    return { user: this.toAuthUser(user, tenantId, membership.branchId, membership.role), tenant: this.toTenant(membership.tenant) };
  }

  memberships(userId: string) {
    return this.prisma.tenantMembership.findMany({
      where: { userId, status: "active", tenant: { status: { in: ["trial", "active"] } } },
      select: { tenantId: true, role: true, tenant: { select: { name: true, businessType: true, status: true } } },
      orderBy: { createdAt: "asc" },
    });
  }

  async switchTenant(user: AuthUser, tenantId: string) {
    if (!user.sessionId) throw new UnauthorizedException();
    const membership = await this.prisma.tenantMembership.findUnique({ where: { userId_tenantId: { userId: user.id, tenantId } }, include: { tenant: true, branch: true } });
    if (!membership || membership.role === "platformAdmin" || membership.status !== "active" || !["trial", "active"].includes(membership.tenant.status) || (membership.branch && !membership.branch.isActive)) throw new ForbiddenException("You do not have access to that workspace.");
    const next = await this.prisma.$transaction(async (tx) => {
      const changed = await tx.authSession.updateMany({ where: { id: user.sessionId, userId: user.id, revokedAt: null, expiresAt: { gt: new Date() } }, data: { revokedAt: new Date() } });
      if (changed.count !== 1) throw new UnauthorizedException();
      const session = await tx.authSession.create({ data: { userId: user.id, tenantId, expiresAt: new Date(Date.now() + 28_800_000) } });
      await tx.auditLog.create({ data: { tenantId, userId: user.id, action: "auth.tenant_switched", entityType: "AuthSession", entityId: session.id } });
      return session;
    });
    return { ...await this.session(user.id, tenantId), accessToken: await this.jwt.signAsync({ sub: user.id, sid: next.id, tenantId }), expiresIn: 28_800 };
  }

  async logout(user: AuthUser) {
    if (!user.sessionId) throw new UnauthorizedException();
    await this.prisma.$transaction(async (tx) => {
      await tx.authSession.updateMany({ where: { id: user.sessionId, userId: user.id, revokedAt: null }, data: { revokedAt: new Date() } });
      await tx.auditLog.create({ data: { tenantId: user.tenantId, userId: user.id, action: "auth.logout", entityType: "AuthSession", entityId: user.sessionId } });
    });
    return { success: true };
  }

  sessions(userId: string) {
    return this.prisma.authSession.findMany({ where: { userId, revokedAt: null, expiresAt: { gt: new Date() } }, select: { id: true, tenantId: true, createdAt: true, expiresAt: true, userAgent: true }, orderBy: { createdAt: "desc" } });
  }

  async revokeSession(user: AuthUser, sessionId: string) {
    return this.prisma.$transaction(async (tx) => {
      const result = await tx.authSession.updateMany({ where: { id: sessionId, userId: user.id, revokedAt: null }, data: { revokedAt: new Date() } });
      if (!result.count) throw new BadRequestException("Session is no longer active.");
      await tx.auditLog.create({ data: { tenantId: user.tenantId, userId: user.id, action: "auth.session_revoked", entityType: "AuthSession", entityId: sessionId } });
      return { success: true };
    });
  }

  async profile(user: AuthUser, name: string, phone: string) {
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({ where: { id: user.id }, data: { name: name.trim(), phone: phone.trim() }, select: { id: true, name: true, email: true, phone: true } });
      await tx.auditLog.create({ data: { tenantId: user.tenantId, userId: user.id, action: "auth.profile_updated", entityType: "User", entityId: user.id } });
      return updated;
    });
  }

  async requestReset(email: string) {
    if (!this.email.ready) throw new ServiceUnavailableException("Email delivery is not configured.");
    const user = await this.prisma.user.findUnique({ where: { email: email.trim().toLowerCase() }, select: { id: true, email: true, status: true } });
    if (user?.status === "active") await this.sendAccountLink(user.id, user.email, "reset");
    return { message: "If this account can receive email, a reset link will arrive shortly." };
  }

  async resendVerification(email: string) {
    if (!this.email.ready) throw new ServiceUnavailableException("Email delivery is not configured.");
    const user = await this.prisma.user.findUnique({ where: { email: email.trim().toLowerCase() }, select: { id: true, email: true, emailVerifiedAt: true, status: true } });
    if (user?.status === "active" && !user.emailVerifiedAt) await this.sendAccountLink(user.id, user.email, "verify");
    return { message: "If verification is pending, a new link will arrive shortly." };
  }

  private async sendAccountLink(userId: string, email: string, purpose: "reset" | "verify") {
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + (purpose === "verify" ? 24 * 60 : 30) * 60 * 1000);
    const record = await this.prisma.accountToken.create({ data: { userId, tokenHash: this.hashToken(token), purpose, expiresAt } });
    try { await this.email.sendLink(email, purpose, token); }
    catch (error) { await this.prisma.accountToken.delete({ where: { id: record.id } }); throw error; }
  }

  async verifyEmail(token: string) {
    await this.consumeToken(token, "verify", async (tx, userId) => {
      await tx.user.update({ where: { id: userId }, data: { emailVerifiedAt: new Date() } });
      await tx.auditLog.create({ data: { userId, action: "auth.email_verified", entityType: "User", entityId: userId } });
    });
    return { message: "Email verified. You can sign in now." };
  }

  async resetPassword(token: string, password: string) {
    if (Buffer.byteLength(password, "utf8") > 72) throw new BadRequestException("Password must be 72 bytes or fewer.");
    const passwordHash = await hash(password, 12);
    await this.consumeToken(token, "reset", async (tx, userId) => {
      await tx.user.update({ where: { id: userId }, data: { passwordHash } });
      await tx.authSession.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } });
      await tx.auditLog.create({ data: { userId, action: "auth.password_reset", entityType: "User", entityId: userId } });
    });
    return { message: "Password updated. Sign in with your new password." };
  }

  private hashToken(token: string) { return createHash("sha256").update(token).digest("hex"); }

  private async consumeToken(token: string, purpose: "reset" | "verify", action: (tx: Prisma.TransactionClient, userId: string) => Promise<void>) {
    await this.prisma.$transaction(async (tx) => {
      const record = await tx.accountToken.findUnique({ where: { tokenHash: this.hashToken(token) } });
      if (!record || record.purpose !== purpose || record.consumedAt || record.expiresAt <= new Date()) throw new BadRequestException("This link is invalid or has expired.");
      const changed = await tx.accountToken.updateMany({ where: { id: record.id, consumedAt: null, expiresAt: { gt: new Date() } }, data: { consumedAt: new Date() } });
      if (changed.count !== 1) throw new BadRequestException("This link is invalid or has expired.");
      await action(tx, record.userId);
    });
  }

  private toAuthUser(user: { id: string; name: string; email: string; phone: string | null }, tenantId: string | null, branchId: string | null, role: AuthUser["role"]): AuthUser {
    return { id: user.id, tenantId, branchId, name: user.name, email: user.email, phone: user.phone, role };
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
    modules: { moduleId: string; enabled: boolean; featureFlags?: unknown; expiresAt: Date | null }[];
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
      enabledModules: tenant.modules.filter((item) => item.enabled && (!item.expiresAt || item.expiresAt > new Date())).map((item) => item.moduleId),
      moduleEntitlements: tenant.modules.map((item) => ({
        moduleId: item.moduleId,
        enabled: item.enabled && (!item.expiresAt || item.expiresAt > new Date()),
        featureFlags: moduleFeatureFlags(item.moduleId as ModuleId, asFeatureFlags(item.featureFlags)),
        expiresAt: item.expiresAt,
      })),
      storefrontStatus: tenant.storefront?.status ?? "draft",
      subscription: tenant.subscription,
    };
  }
}

function asFeatureFlags(value: unknown): Record<string, boolean> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.entries(value).reduce<Record<string, boolean>>((flags, [key, flag]) => {
    if (typeof flag === "boolean") flags[key] = flag;
    return flags;
  }, {});
}
