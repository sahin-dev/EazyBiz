import { IsIn, IsInt, IsString, Max, MaxLength, Min, MinLength } from "class-validator";

export class CreateTableDto {
  @IsString()
  branchId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(40)
  name!: string;

  @IsInt()
  @Min(1)
  @Max(30)
  capacity!: number;
}

export class SetTableStatusDto {
  @IsIn(["available", "reserved"])
  status!: "available" | "reserved";
}

export class SetKitchenStatusDto {
  @IsIn(["preparing", "ready", "served"])
  status!: "preparing" | "ready" | "served";
}

export class SettleTableOrderDto {
  @IsIn(["Cash", "Card", "bKash", "Nagad", "Rocket", "Bangla QR", "Bank transfer"])
  paymentMethod!: string;
}
