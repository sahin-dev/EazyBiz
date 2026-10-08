import { IsEmail, IsOptional, IsString, Matches, MinLength } from "class-validator";

export class CreateCustomerDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @Matches(/^(?:\+?88)?01[3-9]\d{8}$/)
  phone!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;
}
