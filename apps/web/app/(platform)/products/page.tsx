import { redirect } from "next/navigation";
import { ProductManager } from "@/components/products/product-manager";
import { api } from "@/lib/api";

export default async function ProductsPage() {
  const { tenant } = await api.session();
  if (!tenant) redirect("/platform-admin");
  return <ProductManager tenant={tenant} products={await api.products(tenant.id)} />;
}
