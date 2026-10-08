import { redirect } from "next/navigation";
import { UserManager } from "@/components/users/user-manager";
import { api } from "@/lib/api";

export default async function UsersPage() {
  const { tenant, user } = await api.session();
  if (!tenant) redirect("/platform-admin");
  if (user.role !== "owner" && user.role !== "admin") redirect("/dashboard");
  const users = await api.users(tenant.id);
  return <UserManager tenantId={tenant.id} branches={tenant.branches} users={users} actorId={user.id} actorRole={user.role} />;
}
