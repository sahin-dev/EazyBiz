import { redirect } from "next/navigation";
import { TablesWorkspace } from "@/components/restaurant/tables-workspace";
import { api } from "@/lib/api";
import { workspaceBranchId } from "@/lib/workspace-branch";

export default async function TablesPage() {
  const session = await api.session();
  const { tenant, user } = session;
  if (!tenant) redirect("/platform-admin");
  return <TablesWorkspace tenant={tenant} role={user.role} branchId={workspaceBranchId(session) ?? null} tables={await api.tables(tenant.id)} />;
}
