"use client";

import { Check, Copy, KeyRound, Pencil, Plus, Search, ShieldCheck, UserCheck, UserX, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useMemo, useState } from "react";
import { Button, Drawer, EmptyState, Input, Notice, Select, StatusBadge } from "@/components/ui/primitives";
import { clientRequest } from "@/lib/client-api";
import type { BranchSummary, TenantUserRecord } from "@/lib/types";

type InviteResult = { invitationToken: string; expiresAt: string };
type RoleOption = { value: string; label: string };
const roleOptions: RoleOption[] = [
  { value: "admin", label: "Administrator" }, { value: "manager", label: "Manager" },
  { value: "cashier", label: "Cashier" }, { value: "inventoryManager", label: "Inventory manager" },
  { value: "salesStaff", label: "Sales staff" }, { value: "accountant", label: "Accountant" },
  { value: "kitchenStaff", label: "Kitchen staff" }, { value: "pharmacist", label: "Pharmacist" },
  { value: "deliveryStaff", label: "Delivery staff" },
];
const roleLabel = (role: string) => role === "owner" ? "Owner" : roleOptions.find((item) => item.value === role)?.label ?? role;
const dateLabel = (value: string) => new Intl.DateTimeFormat("en-BD", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Dhaka" }).format(new Date(value));

export function UserManager({ tenantId, branches, users, actorId, actorRole }: {
  tenantId: string; branches: BranchSummary[]; users: TenantUserRecord[]; actorId: string; actorRole: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | TenantUserRecord["status"]>("all");
  const [drawer, setDrawer] = useState<"invite" | "edit" | null>(null);
  const [editing, setEditing] = useState<TenantUserRecord | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("cashier");
  const [branchId, setBranchId] = useState("");
  const [busy, setBusy] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [inviteUrl, setInviteUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const availableRoles = actorRole === "owner" ? roleOptions : roleOptions.filter((item) => item.value !== "admin");
  const counts = useMemo(() => ({
    all: users.length, active: users.filter((item) => item.status === "active").length,
    invited: users.filter((item) => item.status === "invited").length,
    suspended: users.filter((item) => item.status === "suspended").length,
  }), [users]);
  const filtered = useMemo(() => users.filter((item) =>
    (filter === "all" || item.status === filter) &&
    `${item.name} ${item.email} ${item.role} ${item.branch?.name ?? ""}`.toLowerCase().includes(query.trim().toLowerCase()),
  ), [users, filter, query]);

  function startInvite() {
    setName(""); setEmail(""); setPhone(""); setRole("cashier"); setBranchId("");
    setEditing(null); setError(""); setDrawer("invite");
  }

  function startEdit(user: TenantUserRecord) {
    setEditing(user); setRole(user.role); setBranchId(user.branchId ?? "");
    setError(""); setDrawer("edit");
  }

  function showInvitation(result: InviteResult) {
    setInviteUrl(`${window.location.origin}/invite?token=${encodeURIComponent(result.invitationToken)}`);
    setCopied(false);
    setNotice(`Invitation link expires ${dateLabel(result.expiresAt)}. Share it privately with the user.`);
    router.refresh();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      if (drawer === "invite") {
        const result = await clientRequest<InviteResult>(`/tenants/${tenantId}/users/invitations`, {
          method: "POST", body: JSON.stringify({ name, email, phone: phone || undefined, role, branchId: branchId || null }),
        });
        showInvitation(result);
      } else if (editing) {
        await clientRequest(`/tenants/${tenantId}/users/${editing.id}/access`, { method: "PATCH", body: JSON.stringify({ role, branchId: branchId || null }) });
        setNotice(`${editing.name}'s access was updated.`); router.refresh();
      }
      setDrawer(null);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to save this account."); }
    finally { setBusy(false); }
  }

  async function changeStatus(user: TenantUserRecord) {
    const nextStatus = user.status === "active" ? "suspended" : "active";
    if (nextStatus === "suspended" && !window.confirm(`Suspend ${user.name}? Their current session will stop working.`)) return;
    setBusyId(user.id); setError("");
    try {
      await clientRequest(`/tenants/${tenantId}/users/${user.id}/status`, { method: "PATCH", body: JSON.stringify({ status: nextStatus }) });
      setNotice(`${user.name} is now ${nextStatus}.`); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to update status."); }
    finally { setBusyId(""); }
  }

  async function renew(user: TenantUserRecord) {
    setBusyId(user.id); setError("");
    try {
      const result = await clientRequest<InviteResult>(`/tenants/${tenantId}/users/${user.id}/invitations`, { method: "POST" });
      showInvitation(result);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to renew invitation."); }
    finally { setBusyId(""); }
  }

  async function copyInvitation() {
    try { await navigator.clipboard.writeText(inviteUrl); setCopied(true); }
    catch { setError("Clipboard access is unavailable. Select the link and copy it manually."); }
  }

  return <div className="page-stack users-page">
    <div className="page-heading"><div><p className="page-kicker">Workspace administration</p><h1>Users & access</h1><p className="page-description">Manage sign-in accounts, roles, and branch access.</p></div><Button onClick={startInvite}><Plus size={17} />Invite user</Button></div>
    {notice ? <Notice message={notice} /> : null}
    {error && !drawer ? <Notice message={error} tone="error" /> : null}
    {inviteUrl ? <section className="invite-link-panel" aria-label="Invitation link"><div><KeyRound size={20} /><span><strong>Invitation link</strong><small>Available now; renew the invitation to generate another link.</small></span></div><div className="invite-link-controls"><input readOnly value={inviteUrl} aria-label="Invitation link" onFocus={(event) => event.target.select()} /><Button variant="secondary" onClick={copyInvitation}>{copied ? <Check size={16} /> : <Copy size={16} />}{copied ? "Copied" : "Copy"}</Button></div></section> : null}
    <div className="users-summary" aria-label="Account status totals"><div><span>Active</span><strong>{counts.active}</strong></div><div><span>Pending invite</span><strong>{counts.invited}</strong></div><div><span>Suspended</span><strong>{counts.suspended}</strong></div></div>
    <div className="users-toolbar"><div className="users-tabs" role="group" aria-label="Filter accounts">{(["all", "active", "invited", "suspended"] as const).map((status) => <button key={status} type="button" aria-pressed={filter === status} className={filter === status ? "selected" : ""} onClick={() => setFilter(status)}>{status === "all" ? "All" : status === "invited" ? "Pending" : status[0].toUpperCase() + status.slice(1)} <span>{counts[status]}</span></button>)}</div><label className="catalog-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search users" aria-label="Search users" /></label></div>
    <section className="surface"><div className="table-wrap"><table className="data-grid users-table"><thead><tr><th scope="col">User</th><th scope="col">Role</th><th scope="col">Branch</th><th scope="col">Last sign-in</th><th scope="col">Status</th><th scope="col">Actions</th></tr></thead><tbody>{filtered.map((user) => { const editable = user.role !== "owner" && (actorRole === "owner" || user.role !== "admin"); return <tr key={user.id}><td><div className="users-person"><span className="users-person-avatar">{user.name.trim().charAt(0).toUpperCase()}</span><span><strong>{user.name}{user.id === actorId ? " (you)" : ""}</strong><small>{user.email}</small></span></div></td><td>{roleLabel(user.role)}</td><td>{user.branch?.name ?? "All branches"}</td><td>{user.lastLoginAt ? dateLabel(user.lastLoginAt) : "Never"}</td><td><StatusBadge label={user.status === "invited" ? "Pending" : user.status === "active" ? "Active" : "Suspended"} tone={user.status === "active" ? "success" : user.status === "invited" ? "warning" : "danger"} /></td><td><div className="users-actions">{editable ? <><button type="button" title="Edit access" aria-label={`Edit ${user.name}'s access`} onClick={() => startEdit(user)}><Pencil size={16} /></button>{user.status === "invited" ? <button type="button" title="Renew invitation" aria-label={`Renew ${user.name}'s invitation`} disabled={busyId === user.id} onClick={() => renew(user)}><KeyRound size={16} /></button> : user.id !== actorId ? <button type="button" title={user.status === "active" ? "Suspend account" : "Reactivate account"} aria-label={`${user.status === "active" ? "Suspend" : "Reactivate"} ${user.name}`} disabled={busyId === user.id} onClick={() => changeStatus(user)}>{user.status === "active" ? <UserX size={16} /> : <UserCheck size={16} />}</button> : null}</> : <ShieldCheck size={17} aria-label="Protected account" />}</div></td></tr>; })}</tbody></table>{!filtered.length ? <EmptyState icon={<Users size={28} />} title="No accounts found" detail={query || filter !== "all" ? "Change the search or filter." : "Invite your first team member."} /> : null}</div></section>
    {drawer ? <Drawer title={drawer === "invite" ? "Invite user" : `Edit ${editing?.name ?? "user"}`} onClose={() => setDrawer(null)}><form className="drawer-form" onSubmit={submit}>{error ? <Notice message={error} tone="error" /> : null}{drawer === "invite" ? <><Input label="Full name" value={name} onChange={(event) => setName(event.target.value)} required minLength={2} maxLength={100} autoComplete="name" /><Input label="Email address" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required maxLength={160} autoComplete="email" /><Input label="Mobile number (optional)" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="01XXXXXXXXX" autoComplete="tel" /></> : null}<Select label="Role" value={role} onChange={(event) => { setRole(event.target.value); if (event.target.value === "admin") setBranchId(""); }} required>{availableRoles.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</Select><Select label="Branch access" value={branchId} disabled={role === "admin"} onChange={(event) => setBranchId(event.target.value)}><option value="">All branches</option>{branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</Select><p className="users-access-note"><ShieldCheck size={16} />{drawer === "invite" ? "The user will set their own password from a link valid for 48 hours." : "Changes to role and branch take effect on the next API request."}</p><div className="drawer-actions"><Button type="button" variant="secondary" onClick={() => setDrawer(null)}>Cancel</Button><Button disabled={busy}>{busy ? "Saving..." : drawer === "invite" ? "Create invitation" : "Save access"}</Button></div></form></Drawer> : null}
  </div>;
}
