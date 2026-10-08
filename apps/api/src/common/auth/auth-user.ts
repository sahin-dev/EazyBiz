import type { UserRole } from "@prisma/client";

export interface AuthUser {
  id: string;
  tenantId: string | null;
  branchId: string | null;
  name: string;
  email: string;
  role: UserRole;
}
