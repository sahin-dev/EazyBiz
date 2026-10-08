import { cookies } from "next/headers";
import type { SessionData } from "./types";

export const branchCookieName = "businessos_branch";

export function workspaceBranchId(session: SessionData): string | undefined {
  if (!session.tenant) return undefined;
  if (session.user.branchId) return session.user.branchId;
  const selected = cookies().get(branchCookieName)?.value;
  return session.tenant.branches.some((branch) => branch.id === selected) ? selected : undefined;
}
