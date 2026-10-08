import { redirect } from "next/navigation";
import { KitchenBoard } from "@/components/restaurant/kitchen-board";
import { api } from "@/lib/api";
import { workspaceBranchId } from "@/lib/workspace-branch";

export default async function KitchenPage() {
  const session = await api.session();
  const { tenant } = session;
  if (!tenant) redirect("/platform-admin");
  const branchId = workspaceBranchId(session);
  const tickets = await api.kitchen(tenant.id);
  return <KitchenBoard tenantId={tenant.id} tickets={branchId ? tickets.filter((ticket) => ticket.branchId === branchId) : tickets} />;
}
