import { ShieldAlert } from "lucide-react";
import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import { workspaceHome } from "@/lib/workspace-home";

export default async function AccessPage() {
  const session = await api.session();
  if (!session.tenant) redirect("/platform-admin");
  const home = workspaceHome(session.user.role, session.tenant.enabledModules);
  if (home !== "/access") redirect(home);
  return <div className="page-stack"><div className="page-heading"><div><p className="page-kicker">Workspace access</p><h1>No workspace tools are available</h1><p className="page-description">Your account is active, but your role has no enabled tools in this business. Ask the owner or an administrator to review your access.</p></div></div><div className="panel-empty"><ShieldAlert size={28} /><strong>Access needs review</strong><span>Signed in as {session.user.name} at {session.tenant.name}.</span></div></div>;
}
