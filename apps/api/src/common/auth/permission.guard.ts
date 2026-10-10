import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { hasPermission, type PermissionId } from "@businessos/domain";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";
import type { AuthUser } from "./auth-user";
import { IS_PUBLIC_KEY } from "./public.decorator";
import { PERMISSION_KEY } from "./require-permission.decorator";

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()])) return true;
    const permission = this.reflector.getAllAndOverride<PermissionId>(PERMISSION_KEY, [context.getHandler(), context.getClass()]);
    if (!permission) return true;
    const user = context.switchToHttp().getRequest<Request & { user: AuthUser }>().user;
    if (!hasPermission(user.role, permission)) throw new ForbiddenException("Your role cannot access this resource.");
    return true;
  }
}
