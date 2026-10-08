import { SetMetadata } from "@nestjs/common";
import type { ModuleId } from "@businessos/domain";

export const MODULE_KEY = "requiredModule";
export const RequireModule = (moduleId: ModuleId) => SetMetadata(MODULE_KEY, moduleId);
