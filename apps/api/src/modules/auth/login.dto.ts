import { IsEmail, IsIn, IsOptional, IsString, MinLength } from "class-validator";

export type LoginWorkspace = "business" | "platform";

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsOptional()
  @IsIn(["business", "platform"])
  workspace?: LoginWorkspace;
}
