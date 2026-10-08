import { IsBoolean, IsNumber, IsObject, IsOptional, IsString, Matches, MaxLength, Min, MinLength } from "class-validator";

export class CreateProductDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Matches(/^(https:\/\/[^\s]+|\/products\/[a-zA-Z0-9._-]+)$/)
  imageUrl?: string;

  @IsString()
  @MinLength(2)
  sku!: string;

  @IsOptional()
  @IsString()
  barcode?: string;

  @IsString()
  category!: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  purchasePrice!: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  salePrice!: number;

  @IsString()
  unit!: string;

  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  stock!: number;

  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  minimumStock!: number;

  @IsBoolean()
  featured!: boolean;

  @IsObject()
  attributes!: Record<string, string | number | boolean | null>;
}
