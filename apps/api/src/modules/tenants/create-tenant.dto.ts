import { BusinessType, businessTypeConfigs } from "@businessos/domain";
import { IsEmail, IsIn, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class CreateTenantDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @IsIn(Object.keys(businessTypeConfigs))
  businessType!: BusinessType;

  @Matches(/^(?:\+?88)?01[3-9]\d{8}$/)
  phone!: string;

  @IsEmail()
  @MaxLength(160)
  email!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(80)
  branchName!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(220)
  branchAddress!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  ownerName!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;
}
