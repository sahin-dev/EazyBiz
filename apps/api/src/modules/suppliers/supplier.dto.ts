import { IsEmail, IsNumber, IsOptional, IsString, Matches, Min, MinLength } from "class-validator";

export class CreateSupplierDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  category!: string;

  @Matches(/^(?:\+?88)?01[3-9]\d{8}$/)
  phone!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  openingPayable?: number;
}
