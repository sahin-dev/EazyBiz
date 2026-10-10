import { planCatalog, moduleCatalog, type BillingInterval, type ModuleId, type PlanCode } from "@businessos/domain";
import { ArrayUnique, IsArray, IsIn, IsOptional } from "class-validator";

export class CheckoutSubscriptionDto {
  @IsIn(planCatalog.map((plan) => plan.code))
  planCode!: PlanCode;

  @IsIn(["monthly", "yearly"])
  interval!: BillingInterval;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsIn(moduleCatalog.map((module) => module.id), { each: true })
  moduleIds?: ModuleId[];
}

