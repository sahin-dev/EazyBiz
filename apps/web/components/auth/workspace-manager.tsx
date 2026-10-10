"use client";

import { Building2, Loader2, Plus, Store } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import type { SessionData } from "@/lib/types";

type Membership = { tenantId: string; role: string; tenant: { name: string; businessType: string; status: string } };

export function WorkspaceManager({ session, memberships }: { session: SessionData; memberships: Membership[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const canCreate = ["owner", "admin"].includes(session.user.role);

  async function post(url: string, data: unknown) {
    const response = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(data) });
    const result = await response.json() as { id?: string; message?: string };
    if (!response.ok) throw new Error(result.message ?? "Unable to save changes.");
    return result;
  }

  async function switchTo(tenantId: string) {
    setBusy(tenantId); setError(""); setSuccess("");
    try { await post("/api/auth/switch-tenant", { tenantId }); router.replace("/dashboard"); router.refresh(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to switch workspace."); setBusy(""); }
  }

  async function createWorkspace(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy("create"); setError(""); setSuccess("");
    const form = event.currentTarget;
    try {
      const result = await post("/api/backend/tenants", Object.fromEntries(new FormData(form)));
      if (result.id) { await post("/api/auth/switch-tenant", { tenantId: result.id }); router.replace("/dashboard"); router.refresh(); }
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to create workspace."); setBusy(""); }
  }

  async function createBranch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy("branch"); setError(""); setSuccess("");
    const form = event.currentTarget;
    try { await post(`/api/backend/tenants/${session.user.tenantId}/branches`, Object.fromEntries(new FormData(form))); form.reset(); setSuccess("Branch created."); router.refresh(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to create branch."); }
    finally { setBusy(""); }
  }

  return <div className="account-page">
    <header className="account-heading"><p className="overline">Account</p><h1>Workspaces</h1><p>Choose the business you are working in.</p></header>
    {error ? <div className="form-alert" role="alert">{error}</div> : null}
    {success ? <div className="notice success" role="status">{success}</div> : null}
    <section aria-labelledby="workspace-list-heading"><h2 id="workspace-list-heading">Your businesses</h2>
      {memberships.length ? <div className="workspace-list">{memberships.map((item) => <div className="workspace-row" key={item.tenantId}>
        <span className="workspace-icon"><Store size={19} /></span><div><strong>{item.tenant.name}</strong><small>{item.tenant.businessType} · {item.role}</small></div>
        {item.tenantId === session.user.tenantId ? <span className="workspace-current">Current</span> : <button className="button secondary" type="button" disabled={Boolean(busy)} onClick={() => void switchTo(item.tenantId)}>{busy === item.tenantId ? <Loader2 className="spin" size={16} /> : null}Switch</button>}
      </div>)}</div> : <p className="account-empty">No active workspaces are available for this account.</p>}
    </section>
    {canCreate ? <section className="account-section" aria-labelledby="workspace-create-heading"><h2 id="workspace-create-heading">Add a business</h2><form className="account-grid" onSubmit={createWorkspace}>
      <label className="field"><span>Business name</span><input name="name" required minLength={2} maxLength={100} /></label>
      <label className="field"><span>Business type</span><select name="businessType" defaultValue="retail"><option value="retail">Retail</option><option value="restaurant">Restaurant</option><option value="cafe">Cafe</option><option value="cloudKitchen">Cloud kitchen</option><option value="pharmacy">Pharmacy</option><option value="grocery">Grocery</option><option value="superShop">Super shop</option><option value="bakery">Bakery</option><option value="electronics">Electronics</option><option value="cosmetics">Cosmetics</option></select></label>
      <label className="field"><span>Phone</span><input name="phone" type="tel" required placeholder="01XXXXXXXXX" /></label>
      <label className="field"><span>Main branch name</span><input name="branchName" required minLength={2} maxLength={80} /></label>
      <label className="field account-wide"><span>Main branch address</span><input name="branchAddress" required minLength={2} maxLength={220} /></label>
      <button className="button primary" disabled={Boolean(busy)}>{busy === "create" ? <Loader2 className="spin" size={16} /> : <Plus size={16} />}Create business</button>
    </form></section> : null}
    {canCreate && session.tenant ? <section className="account-section" aria-labelledby="branch-create-heading"><h2 id="branch-create-heading">Branches in {session.tenant.name}</h2>
      <div className="branch-list">{session.tenant.branches.map((branch) => <span key={branch.id}>{branch.name} <small>{branch.code}</small></span>)}</div>
      <form className="account-grid" onSubmit={createBranch}>
        <label className="field"><span>Branch name</span><input name="name" required minLength={2} maxLength={80} /></label>
        <label className="field"><span>Branch code</span><input name="code" required pattern="[A-Z0-9-]{2,20}" title="Use 2 to 20 uppercase letters, digits or hyphens" onInput={(event) => { event.currentTarget.value = event.currentTarget.value.toUpperCase(); }} /></label>
        <label className="field account-wide"><span>Address</span><input name="address" required minLength={2} maxLength={220} /></label>
        <button className="button secondary" disabled={Boolean(busy)}>{busy === "branch" ? <Loader2 className="spin" size={16} /> : <Building2 size={16} />}Add branch</button>
      </form>
    </section> : null}
  </div>;
}
