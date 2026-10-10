import { api } from "@/lib/api";
import { WorkspaceManager } from "@/components/auth/workspace-manager";

export default async function WorkspacesPage() {
  const session = await api.session();
  const memberships = session.tenant ? await api.memberships() : [];
  return <WorkspaceManager session={session} memberships={memberships} />;
}
