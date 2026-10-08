import { Type } from "class-transformer";
import { IsArray, IsDateString, IsNumber, IsOptional, IsString, Min, ValidateNested } from "class-validator";

class PurchaseItemDto {
  @IsString()
  productId!: string;

  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0.001)
  quantity!: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  unitCost!: number;

  @IsOptional()
  @IsString()
  batchNo?: string;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;
}

export class ReceivePurchaseDto {
  @IsString()
  branchId!: string;

  @IsString()
  supplierId!: string;

  @IsOptional()
  @IsString()
  invoiceNo?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  paid!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseItemDto)
  items!: PurchaseItemDto[];
}
