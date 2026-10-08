import { PosCheckout } from "@/components/pos/pos-checkout";
import { api } from "@/lib/api";
import { redirect } from "next/navigation";
import { workspaceBranchId } from "@/lib/workspace-branch";

export default async function PosPage() {
  const session = await api.session();
  const { tenant, user } = session;
  if (!tenant) redirect("/platform-admin");
  const [products, customers, inventory] = await Promise.all([
    api.products(tenant.id),
    api.customers(tenant.id),
    api.inventory(tenant.id),
  ]);

  const tables = tenant.enabledModules.includes("restaurantTables") ? await api.tables(tenant.id) : [];

  return <PosCheckout tenant={tenant} cashierName={user.name} userBranchId={workspaceBranchId(session) ?? null} products={products} customers={customers} balances={inventory.balances} tables={tables} />;
}
