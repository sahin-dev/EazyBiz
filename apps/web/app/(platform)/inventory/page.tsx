import { redirect } from "next/navigation";
import { InventoryWorkspace } from "@/components/operations/inventory-workspace";
import { api } from "@/lib/api";
import { workspaceBranchId } from "@/lib/workspace-branch";
import { hasPermission } from "@businessos/domain";

export default async function InventoryPage() {
  const session = await api.session();
  const { tenant, user } = session;
  if (!tenant) redirect("/platform-admin");
  const branchId = workspaceBranchId(session);
  const [inventory, products] = await Promise.all([api.inventory(tenant.id, branchId), hasPermission(user.role, "product:manage") ? api.products(tenant.id) : api.catalog(tenant.id)]);
  const [suppliers, purchases] = tenant.enabledModules.includes("suppliers") && tenant.enabledModules.includes("purchasing") ? await Promise.all([api.suppliers(tenant.id), api.purchases(tenant.id, branchId)]) : [[], []];
  return <InventoryWorkspace tenant={tenant} branchId={branchId ?? null} inventory={inventory} products={products} suppliers={suppliers} purchases={purchases} />;
}
