import { IsString, Matches, MaxLength, MinLength } from "class-validator";

export class CreateBranchDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name!: string;

  @IsString()
  @Matches(/^[A-Z0-9-]{2,20}$/)
  code!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(220)
  address!: string;
}
