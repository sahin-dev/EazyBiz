import { redirect } from "next/navigation";
import { ProductManager } from "@/components/products/product-manager";
import { api } from "@/lib/api";
import { hasPermission } from "@businessos/domain";
import { workspaceHome } from "@/lib/workspace-home";

export default async function ProductsPage() {
  const { tenant, user } = await api.session();
  if (!tenant) redirect("/platform-admin");
  if (!hasPermission(user.role, "product:manage")) redirect(workspaceHome(user.role, tenant.enabledModules));
  return <ProductManager tenant={tenant} products={await api.products(tenant.id)} />;
}
