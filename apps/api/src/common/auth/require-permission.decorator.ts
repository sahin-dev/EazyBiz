import { SetMetadata } from "@nestjs/common";
import type { PermissionId } from "@businessos/domain";

export const PERMISSION_KEY = "permission";
export const RequirePermission = (permission: PermissionId) => SetMetadata(PERMISSION_KEY, permission);
