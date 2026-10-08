import { redirect } from "next/navigation";
import { Directory } from "@/components/operations/directory";
import { api } from "@/lib/api";

export default async function CustomersPage() {
  const { tenant } = await api.session();
  if (!tenant) redirect("/platform-admin");
  const customers = await api.customers(tenant.id);
  return <Directory kind="customers" tenantId={tenant.id} rows={customers.map((customer) => ({ id: customer.id, name: customer.name, phone: customer.phone, detail: `${customer.loyaltyPoints} loyalty points`, amount: customer.totalSpend, secondary: customer.email || "Customer", status: Number(customer.due) > 0 ? `Due ${customer.due}` : "Active" }))} />;
}
