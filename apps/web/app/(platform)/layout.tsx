import { AppShell } from "@/components/app-shell";
import { api } from "@/lib/api";
import { workspaceBranchId } from "@/lib/workspace-branch";

export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
  const session = await api.session();
  return <AppShell session={session} branchId={workspaceBranchId(session)}>{children}</AppShell>;
}
