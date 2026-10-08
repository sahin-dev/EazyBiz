import { PaymentMethod } from "@businessos/domain";
import { IsArray, IsIn, IsNumber, IsOptional, IsString, MaxLength, Min, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

class CreateOrderItemDto {
  @IsString()
  productId!: string;

  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0.001)
  quantity!: number;
}

export class CreateOrderDto {
  @IsString()
  branchId!: string;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsString()
  tableId?: string;

  @IsString()
  source!: string;

  @IsIn(["Cash", "Card", "bKash", "Nagad", "Rocket", "Bangla QR", "Bank transfer", "Manual", "Due"])
  paymentMethod!: PaymentMethod;

  @IsOptional()
  @IsString()
  orderType?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  discount?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  paidAmount?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];
}
