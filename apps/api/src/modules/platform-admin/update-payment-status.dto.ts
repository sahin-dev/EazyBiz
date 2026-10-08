import { IsIn } from "class-validator";

export class UpdatePaymentStatusDto {
  @IsIn(["captured", "failed", "refunded"])
  status!: "captured" | "failed" | "refunded";
}
