import { applyDecorators, SetMetadata } from "@nestjs/common";
import type { ModuleId } from "@businessos/domain";

export const MODULE_KEY = "requiredModule";
export const MODULE_FEATURES_KEY = "requiredModuleFeatures";
export const RequireModule = (moduleId: ModuleId, featureFlags: string[] = []) => applyDecorators(
  SetMetadata(MODULE_KEY, moduleId),
  SetMetadata(MODULE_FEATURES_KEY, featureFlags),
);
