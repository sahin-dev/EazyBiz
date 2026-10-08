import { planCatalog, type BillingInterval, type PlanCode } from "@businessos/domain";
import { IsIn } from "class-validator";

export class UpdateSubscriptionDto {
  @IsIn(planCatalog.map((plan) => plan.code))
  planCode!: PlanCode;

  @IsIn(["monthly", "yearly"])
  interval!: BillingInterval;
}
