import { redirect } from "next/navigation";
import { SubscriptionManager } from "@/components/subscription/subscription-manager";
import { api } from "@/lib/api";

export default async function SubscriptionPage() {
  const { tenant } = await api.session();
  if (!tenant) redirect("/platform-admin");
  const subscription = await api.subscription(tenant.id);
  return <SubscriptionManager tenantId={tenant.id} data={subscription} />;
}
