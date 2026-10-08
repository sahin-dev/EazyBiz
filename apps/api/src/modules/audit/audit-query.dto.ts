import { IsIn, IsOptional, IsString, MaxLength } from "class-validator";

export const auditCategories = ["all", "access", "sales", "inventory", "billing", "storefront", "people"] as const;
export type AuditCategory = (typeof auditCategories)[number];

export class AuditQueryDto {
  @IsOptional()
  @IsIn(auditCategories)
  category?: AuditCategory;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  cursor?: string;
}
