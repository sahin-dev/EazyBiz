import { redirect } from "next/navigation";
import { OrdersLedger } from "@/components/orders/orders-ledger";
import { api } from "@/lib/api";
import { workspaceBranchId } from "@/lib/workspace-branch";

export default async function OrdersPage() {
  const session = await api.session();
  const { tenant } = session;
  if (!tenant) redirect("/platform-admin");
  const branchId = workspaceBranchId(session);
  const orders = await api.orders(tenant.id, branchId);
  return <OrdersLedger tenantId={tenant.id} role={session.user.role} orders={orders} />;
}
