import { IsIn, IsNumber, IsOptional, IsString, MinLength, NotEquals } from "class-validator";

export class AdjustStockDto {
  @IsNumber()
  @NotEquals(0)
  delta!: number;

  @IsOptional()
  @IsString()
  branchId?: string;

  @IsIn(["adjustment", "wastage", "return"])
  type!: "adjustment" | "wastage" | "return";

  @IsString()
  @MinLength(3)
  reason!: string;
}
