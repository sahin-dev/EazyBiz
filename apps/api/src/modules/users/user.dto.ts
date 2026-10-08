import { IsEmail, IsIn, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";

export const assignableRoles = ["admin", "manager", "cashier", "inventoryManager", "salesStaff", "accountant", "kitchenStaff", "pharmacist", "deliveryStaff"] as const;
export type AssignableRole = (typeof assignableRoles)[number];

export class InviteUserDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @IsEmail()
  @MaxLength(160)
  email!: string;

  @IsOptional()
  @Matches(/^(?:\+?88)?01[3-9]\d{8}$/)
  phone?: string;

  @IsIn(assignableRoles)
  role!: AssignableRole;

  @IsOptional()
  @IsString()
  branchId?: string | null;
}

export class UpdateUserAccessDto {
  @IsIn(assignableRoles)
  role!: AssignableRole;

  @IsOptional()
  @IsString()
  branchId?: string | null;
}

export class UpdateUserStatusDto {
  @IsIn(["active", "suspended"])
  status!: "active" | "suspended";
}

export class AcceptInvitationDto {
  @IsString()
  @MaxLength(512)
  token!: string;

  @IsString()
  @MinLength(12)
  @MaxLength(72)
  password!: string;
}
