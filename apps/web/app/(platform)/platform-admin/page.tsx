import { redirect } from "next/navigation";
import { PlatformAdminConsole } from "@/components/platform-admin/platform-admin-console";
import { api } from "@/lib/api";

export default async function PlatformAdminPage() {
  const { user } = await api.session();
  if (user.role !== "platformAdmin") redirect("/dashboard");
  const [tenants, payments] = await Promise.all([api.platformTenants(), api.platformPayments()]);
  return <PlatformAdminConsole tenants={tenants} payments={payments} />;
}
