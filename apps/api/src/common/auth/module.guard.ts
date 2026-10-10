import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import {
  getModuleDefinition,
  isModuleSupportedForBusiness,
  moduleFeatureFlags,
  type ModuleId,
} from "@businessos/domain";
import type { Request } from "express";
import { PrismaService } from "../prisma/prisma.service";
import type { AuthUser } from "./auth-user";
import { IS_PUBLIC_KEY } from "./public.decorator";
import { MODULE_FEATURES_KEY, MODULE_KEY } from "./require-module.decorator";

@Injectable()
export class ModuleGuard implements CanActivate {
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

    const definition = getModuleDefinition(moduleId);
    if (!definition || !definition.available) {
      throw new ForbiddenException("This module is not available for subscription entitlement.");
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { businessType: true, modules: { where: { moduleId }, take: 1 } },
    });
    if (!tenant) throw new ForbiddenException("Tenant workspace was not found.");
    if (!isModuleSupportedForBusiness(tenant.businessType, moduleId)) {
      throw new ForbiddenException("This module is not compatible with the tenant business type.");
    }

    const entitlement = tenant.modules[0];
    if (!entitlement?.enabled || (entitlement.expiresAt && entitlement.expiresAt <= new Date())) {
      throw new ForbiddenException(`The ${definition.name} module is not enabled for this tenant.`);
    }

    const requiredFlags = this.reflector.getAllAndOverride<string[]>(MODULE_FEATURES_KEY, [context.getHandler(), context.getClass()]) ?? [];
    const flags = moduleFeatureFlags(moduleId, asFeatureFlags(entitlement.featureFlags));
    const missing = requiredFlags.find((flag) => flags[flag] !== true);
    if (missing) {
      throw new ForbiddenException(`The ${definition.name} feature "${missing}" is not enabled for this tenant.`);
    }

    return true;
  }
}

function resolveTenantId(request: Request & { user: AuthUser }) {
  const routeTenantId = request.params.tenantId;
  if (request.user.role === "platformAdmin") return Array.isArray(routeTenantId) ? routeTenantId[0] : routeTenantId;
  return request.user.tenantId;
}

function asFeatureFlags(value: unknown): Record<string, boolean> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.entries(value).reduce<Record<string, boolean>>((flags, [key, flag]) => {
    if (typeof flag === "boolean") flags[key] = flag;
    return flags;
  }, {});
}

