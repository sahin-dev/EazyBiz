import { redirect } from "next/navigation";
import { InventoryWorkspace } from "@/components/operations/inventory-workspace";
import { api } from "@/lib/api";
import { workspaceBranchId } from "@/lib/workspace-branch";

export default async function InventoryPage() {
  const session = await api.session();
  const { tenant } = session;
  if (!tenant) redirect("/platform-admin");
  const branchId = workspaceBranchId(session);
  const [inventory, products] = await Promise.all([api.inventory(tenant.id, branchId), api.products(tenant.id)]);
  const [suppliers, purchases] = tenant.enabledModules.includes("suppliers") ? await Promise.all([api.suppliers(tenant.id), api.purchases(tenant.id, branchId)]) : [[], []];
  return <InventoryWorkspace tenant={tenant} branchId={branchId ?? null} inventory={inventory} products={products} suppliers={suppliers} purchases={purchases} />;
}
