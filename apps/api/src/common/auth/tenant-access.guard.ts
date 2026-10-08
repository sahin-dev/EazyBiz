import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";
import type { AuthUser } from "./auth-user";
import { ALLOW_PLATFORM_KEY } from "./allow-platform.decorator";
import { IS_PUBLIC_KEY } from "./public.decorator";

@Injectable()
export class TenantAccessGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()])) return true;
    const request = context.switchToHttp().getRequest<Request & { user: AuthUser }>();
    if (request.user.role === "platformAdmin") {
      const allowed = this.reflector.getAllAndOverride<boolean>(ALLOW_PLATFORM_KEY, [context.getHandler(), context.getClass()]);
      if (!allowed) throw new ForbiddenException("Use an authorized platform administration route.");
      return true;
    }
    if (!request.user.tenantId) throw new ForbiddenException("A tenant workspace is required.");
    const tenantId = request.params.tenantId ?? request.params.id;
    if (tenantId && tenantId !== request.user.tenantId) throw new ForbiddenException("Cross-tenant access is not allowed.");
    return true;
  }
}
