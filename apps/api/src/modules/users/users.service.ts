import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { hash } from "bcryptjs";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { AuthUser } from "../../common/auth/auth-user";
import { PrismaService } from "../../common/prisma/prisma.service";
import type { AcceptInvitationDto, InviteUserDto, UpdateUserAccessDto, UpdateUserStatusDto } from "./user.dto";

const userSelect = {
  id: true, tenantId: true, branchId: true, name: true, email: true, phone: true,
  role: true, status: true, lastLoginAt: true, createdAt: true,
  branch: { select: { id: true, name: true } },
} satisfies Prisma.UserSelect;

const invitationLifetimeMs = 48 * 60 * 60 * 1000;
const invalidInvitation = "Invitation is invalid or has expired.";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  list(tenantId: string) {
    return this.prisma.user.findMany({
      where: { tenantId }, select: userSelect, orderBy: [{ name: "asc" }],
    });
  }

  async invite(tenantId: string, actor: AuthUser, dto: InviteUserDto) {
    this.checkAssignableRole(actor, dto.role);
    const branchId = await this.validBranch(tenantId, dto.branchId);
    if (dto.role === "admin" && branchId) throw new BadRequestException("Administrator access must cover the whole workspace.");
    const email = dto.email.trim().toLowerCase();
    const secret = randomBytes(32).toString("hex");
    try {
      const invited = await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: { tenantId, branchId, name: dto.name.trim(), email, phone: dto.phone, role: dto.role, status: "invited", passwordHash: secret },
          select: userSelect,
        });
        await tx.auditLog.create({ data: { tenantId, userId: actor.id, action: "user.invited", entityType: "User", entityId: user.id, metadata: { role: dto.role, branchId } } });
        return user;
      });
      const expiresAt = new Date(Date.now() + invitationLifetimeMs);
      return { user: invited, invitationToken: this.makeToken(invited.id, secret, expiresAt.getTime()), expiresAt };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") throw new BadRequestException("An account with this email already exists.");
      throw error;
    }
  }

  async reissue(tenantId: string, targetId: string, actor: AuthUser) {
    const target = await this.findTarget(tenantId, targetId);
    if (target.status !== "invited") throw new BadRequestException("Only pending invitations can be renewed.");
    this.checkTarget(actor, target.role);
    const secret = randomBytes(32).toString("hex");
    await this.prisma.$transaction(async (tx) => {
      const renewed = await tx.user.updateMany({ where: { id: targetId, tenantId, status: "invited", passwordHash: target.passwordHash }, data: { passwordHash: secret } });
      if (renewed.count !== 1) throw new BadRequestException("Invitation changed. Refresh and try again.");
      await tx.auditLog.create({ data: { tenantId, userId: actor.id, action: "user.invitation_renewed", entityType: "User", entityId: targetId } });
    });
    const expiresAt = new Date(Date.now() + invitationLifetimeMs);
    return { invitationToken: this.makeToken(targetId, secret, expiresAt.getTime()), expiresAt };
  }

  async updateAccess(tenantId: string, targetId: string, actor: AuthUser, dto: UpdateUserAccessDto) {
    const target = await this.findTarget(tenantId, targetId);
    this.checkTarget(actor, target.role);
    this.checkAssignableRole(actor, dto.role);
    const branchId = await this.validBranch(tenantId, dto.branchId);
    if (dto.role === "admin" && branchId) throw new BadRequestException("Administrator access must cover the whole workspace.");
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({ where: { id: targetId }, data: { role: dto.role, branchId }, select: userSelect });
      await tx.auditLog.create({ data: { tenantId, userId: actor.id, action: "user.access_changed", entityType: "User", entityId: targetId, metadata: { previousRole: target.role, role: dto.role, branchId } } });
      return updated;
    });
  }

  async updateStatus(tenantId: string, targetId: string, actor: AuthUser, dto: UpdateUserStatusDto) {
    const target = await this.findTarget(tenantId, targetId);
    this.checkTarget(actor, target.role);
    if (targetId === actor.id && dto.status === "suspended") throw new BadRequestException("You cannot suspend your own account.");
    if (target.status === "invited") throw new BadRequestException("Pending invitations must be accepted before activation.");
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({ where: { id: targetId }, data: { status: dto.status }, select: userSelect });
      await tx.auditLog.create({ data: { tenantId, userId: actor.id, action: "user.status_changed", entityType: "User", entityId: targetId, metadata: { previousStatus: target.status, status: dto.status } } });
      return updated;
    });
  }

  async accept(dto: AcceptInvitationDto) {
    const parts = dto.token.split(".");
    if (parts.length !== 3 || !/^\d{13}$/.test(parts[1]) || !/^[a-f0-9]{64}$/.test(parts[2])) throw new BadRequestException(invalidInvitation);
    const id = Buffer.from(parts[0], "base64url").toString("utf8");
    const expiresAt = Number(parts[1]);
    if (!id || expiresAt <= Date.now() || expiresAt > Date.now() + invitationLifetimeMs) throw new BadRequestException(invalidInvitation);
    if (Buffer.byteLength(dto.password, "utf8") > 72) throw new BadRequestException("Password must be 72 bytes or fewer.");
    const user = await this.prisma.user.findFirst({
      where: { id, status: "invited", tenant: { status: { in: ["active", "trial"] } } },
      select: { id: true, tenantId: true, passwordHash: true },
    });
    if (!user?.tenantId) throw new BadRequestException(invalidInvitation);
    const expected = this.makeSignature(id, user.passwordHash, expiresAt);
    if (!timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(parts[2], "hex"))) throw new BadRequestException(invalidInvitation);
    const passwordHash = await hash(dto.password, 12);
    const accepted = await this.prisma.$transaction(async (tx) => {
      const result = await tx.user.updateMany({ where: { id, status: "invited", passwordHash: user.passwordHash }, data: { status: "active", passwordHash } });
      if (result.count !== 1) throw new BadRequestException(invalidInvitation);
      await tx.auditLog.create({ data: { tenantId: user.tenantId, userId: id, action: "user.invitation_accepted", entityType: "User", entityId: id } });
      return tx.user.findUniqueOrThrow({ where: { id }, select: { email: true } });
    });
    return { email: accepted.email };
  }

  private makeToken(id: string, secret: string, expiresAt: number) {
    return `${Buffer.from(id).toString("base64url")}.${expiresAt}.${this.makeSignature(id, secret, expiresAt)}`;
  }

  private makeSignature(id: string, secret: string, expiresAt: number) {
    return createHmac("sha256", secret).update(`${id}.${expiresAt}`).digest("hex");
  }

  private async validBranch(tenantId: string, branchId?: string | null) {
    if (!branchId) return null;
    const branch = await this.prisma.branch.findFirst({ where: { id: branchId, tenantId, isActive: true }, select: { id: true } });
    if (!branch) throw new BadRequestException("Choose an active branch in this workspace.");
    return branch.id;
  }

  private async findTarget(tenantId: string, id: string) {
    const user = await this.prisma.user.findFirst({ where: { id, tenantId }, select: { id: true, role: true, status: true, passwordHash: true } });
    if (!user) throw new NotFoundException("Account not found.");
    return user;
  }

  private checkAssignableRole(actor: AuthUser, role: string) {
    if (role === "admin" && actor.role !== "owner") throw new ForbiddenException("Only the owner can assign admin access.");
  }

  private checkTarget(actor: AuthUser, role: string) {
    if (role === "owner") throw new ForbiddenException("Owner access cannot be changed here.");
    if (role === "admin" && actor.role !== "owner") throw new ForbiddenException("Only the owner can change admin accounts.");
  }
}
