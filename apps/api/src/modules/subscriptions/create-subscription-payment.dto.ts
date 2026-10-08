import { IsIn, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateSubscriptionPaymentDto {
  @IsIn(["bKash", "Nagad", "Rocket", "Bangla QR", "Bank transfer", "Manual"])
  method!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  reference?: string;
}
