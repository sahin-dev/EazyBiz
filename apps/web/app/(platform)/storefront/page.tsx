import { redirect } from "next/navigation";
import { StorefrontEditor } from "@/components/storefront/storefront-editor";
import { api } from "@/lib/api";

export default async function StorefrontPage() {
  const { tenant } = await api.session();
  if (!tenant) redirect("/platform-admin");
  const [storefront, products] = await Promise.all([api.storefront(tenant.id), api.products(tenant.id)]);
  return <StorefrontEditor tenant={tenant} initial={storefront} products={products} />;
}
