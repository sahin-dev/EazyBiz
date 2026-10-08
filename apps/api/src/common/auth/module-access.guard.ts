import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { ModuleId } from "@businessos/domain";
import type { Request } from "express";
import { PrismaService } from "../prisma/prisma.service";
import type { AuthUser } from "./auth-user";
import { IS_PUBLIC_KEY } from "./public.decorator";
import { MODULE_KEY } from "./require-module.decorator";

@Injectable()
export class ModuleAccessGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext) {
    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()])) return true;
    const moduleId = this.reflector.getAllAndOverride<ModuleId>(MODULE_KEY, [context.getHandler(), context.getClass()]);
    if (!moduleId) return true;
    const request = context.switchToHttp().getRequest<Request & { user: AuthUser }>();
    const user = request.user;
    const routeTenantId = request.params.tenantId;
    const tenantId = user.role === "platformAdmin"
      ? Array.isArray(routeTenantId) ? routeTenantId[0] : routeTenantId
      : user.tenantId;
    if (!tenantId) throw new ForbiddenException("A tenant workspace is required.");
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { subscription: true },
    });
    const subscription = tenant?.subscription;
    if (
      !tenant ||
      tenant.status === "suspended" ||
      tenant.status === "cancelled" ||
      !subscription ||
      !["active", "trialing"].includes(subscription.status) ||
      subscription.currentPeriodEnd <= new Date()
    ) {
      throw new ForbiddenException("The tenant subscription is not active.");
    }
    const enabled = await this.prisma.tenantModule.findFirst({
      where: { tenantId, moduleId, enabled: true, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
      select: { moduleId: true },
    });
    if (!enabled) throw new ForbiddenException(`The ${moduleId} module is not active for this subscription.`);
    return true;
  }
}
