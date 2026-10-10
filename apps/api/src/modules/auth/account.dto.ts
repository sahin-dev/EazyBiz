import { IsEmail, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class EmailDto {
  @IsEmail()
  @MaxLength(160)
  email!: string;
}

export class TokenDto {
  @IsString()
  @Matches(/^[a-f0-9]{64}$/)
  token!: string;
}

export class ResetPasswordDto extends TokenDto {
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;
}

export class SwitchTenantDto {
  @IsString()
  @MaxLength(50)
  tenantId!: string;
}

export class ProfileDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @Matches(/^(?:\+?88)?01[3-9]\d{8}$/)
  phone!: string;
}
