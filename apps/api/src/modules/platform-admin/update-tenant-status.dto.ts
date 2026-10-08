import { IsIn } from "class-validator";

export class UpdateTenantStatusDto {
  @IsIn(["trial", "active", "suspended", "cancelled"])
  status!: "trial" | "active" | "suspended" | "cancelled";
}
