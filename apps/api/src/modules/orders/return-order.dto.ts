import { IsIn, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class ReturnOrderDto {
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  reason!: string;

  @IsIn(["restock", "writeOff"])
  disposition!: "restock" | "writeOff";

  @IsOptional()
  @IsIn(["Cash", "Card", "bKash", "Nagad", "Rocket", "Bangla QR", "Bank transfer", "Manual"])
  refundMethod?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  refundReference?: string;
}
