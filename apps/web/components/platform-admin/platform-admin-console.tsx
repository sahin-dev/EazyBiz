"use client";

import { moduleCatalog } from "@businessos/domain";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { clientRequest } from "@/lib/client-api";
import type { PlatformTenant, SubscriptionPayment } from "@/lib/types";
import { formatMoney } from "@/lib/format";

export function PlatformAdminConsole({ tenants, payments }: { tenants: PlatformTenant[]; payments: SubscriptionPayment[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const pendingPayments = payments.filter((payment) => payment.status === "pending").length;
  const activeTenants = tenants.filter((tenant) => tenant.status === "active").length;

  async function update(key: string, path: string, body: unknown) {
    setBusy(key);
    setError("");
    try {
      await clientRequest(path, { method: "PATCH", body: JSON.stringify(body) });
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The update could not be completed.");
    } finally {
      setBusy("");
    }
  }

  return (
    <>
      <div className="topbar"><div><p className="eyebrow">SaaS operations</p><h1>Platform Admin</h1></div><span className="chip active">Platform-wide</span></div>
      {error ? <p className="notice error" role="alert">{error}</p> : null}
      <div className="grid metrics">
        <article className="card metric"><span>Tenants</span><strong>{tenants.length}</strong><small>All business workspaces</small></article>
        <article className="card metric"><span>Active</span><strong>{activeTenants}</strong><small>Not suspended or cancelled</small></article>
        <article className="card metric"><span>Payments to review</span><strong>{pendingPayments}</strong><small>Manual payment submissions</small></article>
        <article className="card metric"><span>Modules</span><strong>{moduleCatalog.length}</strong><small>Shared catalog</small></article>
      </div>

      <section className="card admin-section">
        <div className="card-header"><div><h2>Tenants</h2><p>Manage tenant access and active module entitlements.</p></div></div>
        <div className="admin-tenants">
          {tenants.map((tenant) => {
            const eligibleModules = moduleCatalog.filter((module) => module.businessTypes.includes(tenant.businessType));
            return (
              <article className="admin-tenant" key={tenant.id}>
                <div className="admin-tenant-heading">
                  <div><strong>{tenant.name}</strong><span className="muted">{tenant.businessType} · {tenant.plan} · {tenant.userCount} users · {tenant.branches.length} branches</span></div>
                  <label className="pos-field">
                    <span>Tenant status</span>
                    <select value={tenant.status} disabled={busy === `status:${tenant.id}`} onChange={(event) => void update(`status:${tenant.id}`, `/platform-admin/tenants/${tenant.id}/status`, { status: event.target.value })}>
                      {["trial", "active", "suspended", "cancelled"].map((status) => <option key={status}>{status}</option>)}
                    </select>
                  </label>
                </div>
                <p className="muted">
                  {tenant.subscription
                    ? `${tenant.subscription.planCode} · ${tenant.subscription.interval} · ${formatMoney(Number(tenant.subscription.amount))} · ${tenant.subscription.status}`
                    : "No subscription"}
                </p>
                <div className="admin-module-list">
                  {eligibleModules.map((module) => (
                    <label key={module.id}>
                      <input
                        type="checkbox"
                        checked={module.available && tenant.enabledModules.includes(module.id)}
                        disabled={!module.available || module.id === "pos" || busy === `module:${tenant.id}:${module.id}`}
                        onChange={(event) => void update(`module:${tenant.id}:${module.id}`, `/platform-admin/tenants/${tenant.id}/modules`, { moduleId: module.id, enabled: event.target.checked })}
                      />
                      {module.name}{module.available ? "" : " (planned)"}
                    </label>
                  ))}
                </div>
              </article>
            );
          })}
          {tenants.length === 0 ? <p className="muted">No tenants found.</p> : null}
        </div>
      </section>

      <section className="card admin-section">
        <div className="card-header"><div><h2>Subscription payments</h2><p>Confirming a payment activates the subscription for the next billing period.</p></div></div>
        <div className="table-shell">
          <table className="table">
            <thead><tr><th>Tenant</th><th>Method / reference</th><th>Amount</th><th>Status</th><th>Submitted</th><th>Action</th></tr></thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td>{payment.subscription?.tenant.name ?? "Tenant"}</td>
                  <td>{payment.method}{payment.reference ? ` · ${payment.reference}` : ""}</td>
                  <td>{formatMoney(Number(payment.amount))}</td>
                  <td><span className="chip">{payment.status}</span></td>
                  <td>{new Date(payment.createdAt).toLocaleDateString("en-BD")}</td>
                  <td>
                    {payment.status === "pending" ? (
                      <div className="button-row">
                        <button className="button primary" type="button" disabled={busy === `payment:${payment.id}`} onClick={() => void update(`payment:${payment.id}`, `/platform-admin/payments/${payment.id}`, { status: "captured" })}>Confirm</button>
                        <button className="button secondary" type="button" disabled={busy === `payment:${payment.id}`} onClick={() => void update(`payment:${payment.id}`, `/platform-admin/payments/${payment.id}`, { status: "failed" })}>Reject</button>
                      </div>
                    ) : "—"}
                  </td>
                </tr>
              ))}
              {payments.length === 0 ? <tr><td colSpan={6}>No payments submitted.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
