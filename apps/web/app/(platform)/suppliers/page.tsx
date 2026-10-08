import { redirect } from "next/navigation";
import { Directory } from "@/components/operations/directory";
import { api } from "@/lib/api";

export default async function SuppliersPage() {
  const { tenant } = await api.session();
  if (!tenant) redirect("/platform-admin");
  const suppliers = await api.suppliers(tenant.id);
  return <Directory kind="suppliers" tenantId={tenant.id} rows={suppliers.map((supplier) => ({ id: supplier.id, name: supplier.name, phone: supplier.phone, detail: supplier.category, amount: supplier.payable, secondary: `${supplier._count.purchases} purchases` }))} />;
}
