import { IsBoolean, IsIn } from "class-validator";
import { moduleCatalog, type ModuleId } from "@businessos/domain";

const modules = moduleCatalog.map((module) => module.id);

export class UpdateModuleDto {
  @IsIn(modules)
  moduleId!: ModuleId;

  @IsBoolean()
  enabled!: boolean;
}
