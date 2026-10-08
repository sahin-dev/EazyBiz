import { redirect } from "next/navigation";
import { AuditLog } from "@/components/audit/audit-log";
import { api } from "@/lib/api";

export default async function AuditPage() {
  const { tenant, user } = await api.session();
  if (!tenant) redirect("/platform-admin");
  if (user.role !== "owner" && user.role !== "admin") redirect("/dashboard");
  return <AuditLog tenantId={tenant.id} initial={await api.auditLogs(tenant.id)} />;
}
