"use client";

import { hasPermission, type ModuleId, type PermissionId } from "@businessos/domain";
import type React from "react";
import type { SessionData } from "@/lib/types";

type Tenant = NonNullable<SessionData["tenant"]>;

export function FeatureGate({
  tenant,
  role,
  moduleId,
  permission,
  featureFlag,
  fallback = null,
  children,
}: {
  tenant: Tenant;
  role?: string;
  moduleId?: ModuleId;
  permission?: PermissionId;
  featureFlag?: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}) {
  if (permission && (!role || !hasPermission(role, permission))) return <>{fallback}</>;
  if (!moduleId) return <>{children}</>;

  const entitlement = tenant.moduleEntitlements?.find((item) => item.moduleId === moduleId);
  const enabled = entitlement?.enabled ?? tenant.enabledModules.includes(moduleId);
  if (!enabled) return <>{fallback}</>;
  if (featureFlag && entitlement?.featureFlags?.[featureFlag] !== true) return <>{fallback}</>;

  return <>{children}</>;
}

export function moduleIsEnabled(tenant: Tenant, moduleId: ModuleId, featureFlag?: string) {
  const entitlement = tenant.moduleEntitlements?.find((item) => item.moduleId === moduleId);
  const enabled = entitlement?.enabled ?? tenant.enabledModules.includes(moduleId);
  if (!enabled) return false;
  return featureFlag ? entitlement?.featureFlags?.[featureFlag] === true : true;
}

