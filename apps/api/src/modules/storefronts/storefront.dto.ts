import { Type } from "class-transformer";
import { ArrayMaxSize, IsArray, IsBoolean, IsHexColor, IsIn, IsNumber, IsOptional, IsString, Matches, Max, MaxLength, Min, MinLength, ValidateNested } from "class-validator";

export class StorefrontSectionDto {
  @IsString()
  id!: string;

  @IsString()
  type!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(240)
  subtitle?: string;

  @IsBoolean()
  visible!: boolean;
}

export class UpdateStorefrontDto {
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug!: string;

  @IsString()
  @MinLength(2)
  heroTitle!: string;

  @IsString()
  tagline!: string;

  @IsString()
  theme!: string;

  @IsHexColor()
  primaryColor!: string;

  @IsBoolean()
  deliveryEnabled!: boolean;

  @IsBoolean()
  pickupEnabled!: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StorefrontSectionDto)
  sections!: StorefrontSectionDto[];
}

class PublicOrderItemDto {
  @IsString()
  productId!: string;

  @IsNumber()
  @Min(1)
  @Max(999)
  quantity!: number;
}

export class PlaceStorefrontOrderDto {
  @IsString()
  branchId!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  customerName!: string;

  @Matches(/^(?:\+?88)?01[3-9]\d{8}$/)
  phone!: string;

  @IsIn(["delivery", "pickup"])
  fulfillment!: "delivery" | "pickup";

  @IsOptional()
  @IsString()
  @MaxLength(300)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  note?: string;

  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => PublicOrderItemDto)
  items!: PublicOrderItemDto[];
}
