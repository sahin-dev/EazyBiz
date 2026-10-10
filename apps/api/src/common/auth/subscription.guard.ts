import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { ModuleId } from "@businessos/domain";
import type { Request } from "express";
import { PrismaService } from "../prisma/prisma.service";
import type { AuthUser } from "./auth-user";
import { IS_PUBLIC_KEY } from "./public.decorator";
import { MODULE_KEY } from "./require-module.decorator";

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext) {
    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()])) return true;
    const moduleId = this.reflector.getAllAndOverride<ModuleId>(MODULE_KEY, [context.getHandler(), context.getClass()]);
    if (!moduleId) return true;

    const request = context.switchToHttp().getRequest<Request & { user: AuthUser }>();
    const tenantId = resolveTenantId(request);
    if (!tenantId) throw new ForbiddenException("A tenant workspace is required.");

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { subscription: true },
    });
    const subscription = tenant?.subscription;
    if (!tenant || tenant.status === "suspended" || tenant.status === "cancelled") {
      throw new ForbiddenException("The tenant workspace is not active.");
    }
    if (
      !subscription ||
      !["active", "trialing"].includes(subscription.status) ||
      subscription.currentPeriodEnd <= new Date()
    ) {
      throw new ForbiddenException("A valid subscription entitlement is required for this feature.");
    }
    return true;
  }
}

function resolveTenantId(request: Request & { user: AuthUser }) {
  const routeTenantId = request.params.tenantId;
  if (request.user.role === "platformAdmin") return Array.isArray(routeTenantId) ? routeTenantId[0] : routeTenantId;
  return request.user.tenantId;
}

