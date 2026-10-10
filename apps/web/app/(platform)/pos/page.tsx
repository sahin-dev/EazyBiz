import { PosCheckout } from "@/components/pos/pos-checkout";
import { api } from "@/lib/api";
import { redirect } from "next/navigation";
import { workspaceBranchId } from "@/lib/workspace-branch";
import { hasPermission } from "@businessos/domain";

export default async function PosPage() {
  const session = await api.session();
  const { tenant, user } = session;
  if (!tenant) redirect("/platform-admin");
  const [products, customers, inventory] = await Promise.all([
    api.catalog(tenant.id),
    tenant.enabledModules.includes("customers") ? api.customers(tenant.id) : Promise.resolve([]),
    api.inventoryAvailability(tenant.id, workspaceBranchId(session)),
  ]);

  const tables = tenant.enabledModules.includes("restaurantTables") && hasPermission(user.role, "table:view") ? await api.tables(tenant.id) : [];

  return <PosCheckout tenant={tenant} cashierName={user.name} userBranchId={workspaceBranchId(session) ?? null} products={products} customers={customers} balances={inventory} tables={tables} />;
}
