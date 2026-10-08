import { IsNumber, IsOptional, IsString, Matches, Min, MinLength } from "class-validator";

export class CreateStaffDto {
  @IsString()
  employeeNo!: string;

  @IsString()
  @MinLength(2)
  name!: string;

  @IsOptional()
  @Matches(/^(?:\+?88)?01[3-9]\d{8}$/)
  phone?: string;

  @IsOptional()
  @IsString()
  branchId?: string;

  @IsString()
  role!: string;

  @IsString()
  shift!: string;

  @IsNumber()
  @Min(0)
  salary!: number;
}
