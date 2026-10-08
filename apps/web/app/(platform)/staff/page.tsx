import { redirect } from "next/navigation";
import { Directory } from "@/components/operations/directory";
import { api } from "@/lib/api";

export default async function StaffPage() {
  const { tenant } = await api.session();
  if (!tenant) redirect("/platform-admin");
  const staff = await api.staff(tenant.id);
  return <Directory kind="staff" tenantId={tenant.id} rows={staff.map((person) => ({ id: person.id, name: person.name, phone: person.phone, detail: `${person.role} / ${person.shift}`, amount: person.salary, secondary: `${person.employeeNo} / ${person.branch?.name ?? "All branches"}`, status: person.status }))} />;
}
