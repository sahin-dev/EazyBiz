import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "../../common/prisma/prisma.service";
import type { AuthUser } from "../../common/auth/auth-user";

interface JwtPayload {
  sub: string;
  sid: string;
  tenantId: string | null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService, private readonly prisma: PrismaService) {
    const secret = config.get<string>("JWT_SECRET");
    if (!secret) throw new Error("JWT_SECRET is required.");
    super({ jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), ignoreExpiration: false, secretOrKey: secret });
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    if (!payload?.sub || !payload.sid || !Object.prototype.hasOwnProperty.call(payload, "tenantId")) throw new UnauthorizedException();
    const session = await this.prisma.authSession.findFirst({
      where: { id: payload.sid, userId: payload.sub, tenantId: payload.tenantId, revokedAt: null, expiresAt: { gt: new Date() } },
      include: { user: true },
    });
    const user = session?.user;
    if (!user || user.status !== "active" || !user.emailVerifiedAt) throw new UnauthorizedException();
    if (payload.tenantId === null) {
      if (user.role !== "platformAdmin" || user.tenantId !== null) throw new UnauthorizedException();
      return { id: user.id, tenantId: null, branchId: null, name: user.name, email: user.email, role: "platformAdmin", sessionId: session.id };
    }
    const membership = await this.prisma.tenantMembership.findUnique({ where: { userId_tenantId: { userId: user.id, tenantId: payload.tenantId } }, include: { tenant: true, branch: true } });
    if (!membership || membership.role === "platformAdmin" || membership.status !== "active" || !["trial", "active"].includes(membership.tenant.status) || (membership.branch && !membership.branch.isActive)) throw new UnauthorizedException();
    return { id: user.id, tenantId: membership.tenantId, branchId: membership.branchId, name: user.name, email: user.email, role: membership.role, sessionId: session.id };
  }
}
