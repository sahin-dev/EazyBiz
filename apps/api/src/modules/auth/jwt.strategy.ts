import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "../../common/prisma/prisma.service";
import type { AuthUser } from "../../common/auth/auth-user";

interface JwtPayload {
  sub: string;
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
    const user = await this.prisma.user.findFirst({
      where: payload.tenantId
        ? { id: payload.sub, tenantId: payload.tenantId, status: "active", tenant: { status: { in: ["trial", "active"] } } }
        : { id: payload.sub, tenantId: null, role: "platformAdmin", status: "active" },
      select: { id: true, tenantId: true, branchId: true, name: true, email: true, role: true },
    });
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
