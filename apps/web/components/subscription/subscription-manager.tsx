"use client";

import type { ModuleId } from "@businessos/domain";
import { Check, CreditCard, FileText, RotateCcw, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { clientRequest } from "@/lib/client-api";
import type { SubscriptionData } from "@/lib/types";
import { formatMoney } from "@/lib/format";

export function SubscriptionManager({ tenantId, data }: { tenantId: string; data: SubscriptionData }) {
  const router = useRouter();
  const [planCode, setPlanCode] = useState(data.subscription.planCode);
  const [interval, setInterval] = useState<"monthly" | "yearly">(data.subscription.interval);
  const [selectedModules, setSelectedModules] = useState<Set<ModuleId>>(() => new Set(data.modules.filter((module) => module.enabled).map((module) => module.id)));
  const [paymentMethod, setPaymentMethod] = useState("bKash");
  const [reference, setReference] = useState("");
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const selectedPlan = data.plans.find((plan) => plan.code === planCode) ?? data.plans[0];
  const included = new Set(selectedPlan.includedModules);
  const estimatedMonthly = selectedPlan.monthlyBasePrice + data.modules.reduce((total, module) => (
    selectedModules.has(module.id) && !included.has(module.id) && module.available ? total + module.monthlyPrice : total
  ), 0);
  const estimatedTotal = interval === "yearly" ? Math.round(estimatedMonthly * 12 * 0.9) : estimatedMonthly;
  const latestInvoice = data.subscription.invoices[0];
  const usageRows = useMemo(() => [
    ["branches", "Branches", data.usage.branches, selectedPlan.limits.branches],
    ["users", "Users", data.usage.users, selectedPlan.limits.users],
    ["devices", "Devices", data.usage.devices, selectedPlan.limits.devices],
    ["storageGb", "Storage", data.usage.storageGb, selectedPlan.limits.storageGb],
    ["sms", "SMS", data.usage.sms, selectedPlan.limits.sms],
  ], [data.usage, selectedPlan]);

  async function runAction(key: string, action: () => Promise<unknown>, success: string) {
    setBusy(key);
    setError("");
    setNotice("");
    try {
      await action();
      setNotice(success);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The request could not be completed.");
    } finally {
      setBusy("");
    }
  }

  function toggleModule(moduleId: ModuleId, enabled: boolean) {
    setSelectedModules((current) => {
      const next = new Set(current);
      if (enabled) next.add(moduleId);
      else next.delete(moduleId);
      return next;
    });
  }

  return (
    <div className="page-stack">
      <div className="topbar">
        <div><p className="eyebrow">Plan, usage, and billing</p><h1>Subscription</h1></div>
        <span className={`chip ${data.subscription.status === "active" || data.subscription.status === "trialing" ? "active" : "warn"}`}>{data.subscription.status}</span>
      </div>
      {notice ? <p className="notice success" role="status">{notice}</p> : null}
      {error ? <p className="notice error" role="alert">{error}</p> : null}

      <div className="grid metrics">
        <article className="card metric"><span>Current plan</span><strong>{selectedPlan.name}</strong><small>{data.subscription.interval}</small></article>
        <article className="card metric"><span>Estimated total</span><strong>{formatMoney(estimatedTotal)}</strong><small>{interval === "yearly" ? "per year, 10% off" : "per month"}</small></article>
        <article className="card metric"><span>Next renewal</span><strong>{new Date(data.subscription.currentPeriodEnd).toLocaleDateString("en-BD")}</strong><small>{data.subscription.cancelAtPeriodEnd ? "Cancels at period end" : "Auto-renew ready"}</small></article>
        <article className="card metric"><span>Latest invoice</span><strong>{latestInvoice ? formatMoney(Number(latestInvoice.total)) : "None"}</strong><small>{latestInvoice?.status ?? "No invoice yet"}</small></article>
      </div>

      <section className="card admin-section">
        <div className="card-header"><div><h2>Plan comparison</h2><p>Choose a base subscription and billing interval.</p></div></div>
        <div className="module-catalog">
          {data.plans.map((plan) => (
            <label className="module-row" key={plan.code}>
              <input type="radio" name="plan" checked={planCode === plan.code} onChange={() => setPlanCode(plan.code)} />
              <span><strong>{plan.name}</strong><small>{plan.description}</small></span>
              <span>{formatMoney(plan.monthlyBasePrice)} / month</span>
            </label>
          ))}
        </div>
        <div className="subscription-form">
          <label className="pos-field">
            <span>Billing interval</span>
            <select value={interval} onChange={(event) => setInterval(event.target.value as "monthly" | "yearly")}>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly (10% discount)</option>
            </select>
          </label>
          <button className="button primary" type="button" disabled={busy === "checkout"} onClick={() => void runAction("checkout", () => clientRequest(`/tenants/${tenantId}/subscription/checkout`, {
            method: "POST",
            body: JSON.stringify({ planCode, interval, moduleIds: [...selectedModules] }),
          }), "Checkout prepared. Record payment to activate changes.")}>
            <CreditCard size={17} /> {busy === "checkout" ? "Preparing..." : "Checkout"}
          </button>
        </div>
      </section>

      <section className="card subscription-modules">
        <div className="card-header"><div><h2>Add-ons and modules</h2><p>Toggle modular pricing independently from your base plan.</p></div></div>
        <div className="module-catalog">
          {data.modules.map((module) => {
            const planIncluded = included.has(module.id);
            return (
              <label className="module-row" key={module.id}>
                <input type="checkbox" checked={selectedModules.has(module.id) || planIncluded} disabled={!module.available || module.id === "pos" || planIncluded || busy === module.id} onChange={(event) => {
                  toggleModule(module.id, event.target.checked);
                  void runAction(module.id, () => clientRequest(`/tenants/${tenantId}/subscription/modules`, {
                    method: "PATCH",
                    body: JSON.stringify({ moduleId: module.id, enabled: event.target.checked }),
                  }), `${module.name} ${event.target.checked ? "enabled" : "disabled"}.`);
                }} />
                <span><strong>{module.name}</strong><small>{module.summary}</small></span>
                <span>{planIncluded ? "Included" : module.available ? `${formatMoney(module.monthlyPrice)} / month` : "Planned"}</span>
              </label>
            );
          })}
        </div>
      </section>

      <div className="grid two">
        <section className="card">
          <div className="card-header"><div><h2>Usage limits</h2><p>Current usage against plan entitlements.</p></div></div>
          <div className="payment-history">
            {usageRows.map(([key, label, used, limit]) => (
              <div className="payment-row" key={String(key)}>
                <span>{label}<small>{limit === null ? "Unlimited" : `${used} of ${limit}`}</small></span>
                <strong>{limit === null ? "Unlimited" : `${Math.max(Number(limit) - Number(used), 0)} left`}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <div className="card-header"><div><h2>Lifecycle</h2><p>Cancel, renew, upgrade, or downgrade without changing providers.</p></div></div>
          <div className="button-row">
            <button className="button secondary" type="button" disabled={busy === "cancel" || data.subscription.cancelAtPeriodEnd} onClick={() => void runAction("cancel", () => clientRequest(`/tenants/${tenantId}/subscription/cancel`, { method: "POST" }), "Subscription will cancel at period end.")}><X size={16} /> Cancel</button>
            <button className="button secondary" type="button" disabled={busy === "renew"} onClick={() => void runAction("renew", () => clientRequest(`/tenants/${tenantId}/subscription/renew`, { method: "POST" }), "Subscription renewed.")}><RotateCcw size={16} /> Renew</button>
            <button className="button primary" type="button" disabled={busy === "plan"} onClick={() => void runAction("plan", () => clientRequest(`/tenants/${tenantId}/subscription`, {
              method: "PATCH",
              body: JSON.stringify({ planCode, interval }),
            }), "Plan updated.")}><Check size={16} /> Save plan</button>
          </div>
          {data.subscription.trials.length ? <p className="muted">Trial ends {new Date(data.subscription.trials[0].endsAt).toLocaleDateString("en-BD")}.</p> : null}
        </section>
      </div>

      <section className="card admin-section">
        <div className="card-header"><div><h2>Billing history and invoices</h2><p>Invoices and provider-neutral manual payments.</p></div></div>
        <div className="subscription-form">
          <label className="pos-field"><span>Payment method</span><select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}>{["bKash", "Nagad", "Rocket", "Bangla QR", "Bank transfer", "Manual"].map((method) => <option key={method}>{method}</option>)}</select></label>
          <label className="pos-field"><span>Transaction reference</span><input value={reference} onChange={(event) => setReference(event.target.value)} maxLength={120} /></label>
          <button className="button primary" type="button" disabled={busy === "payment"} onClick={() => void runAction("payment", async () => {
            await clientRequest(`/tenants/${tenantId}/subscription/payments`, { method: "POST", body: JSON.stringify({ method: paymentMethod, reference: reference || undefined }) });
            setReference("");
          }, "Payment submitted for review.")}><FileText size={17} /> Submit payment</button>
        </div>
        <div className="table-shell">
          <table className="table">
            <thead><tr><th>Invoice</th><th>Status</th><th>Issued</th><th>Due</th><th>Total</th></tr></thead>
            <tbody>
              {data.subscription.invoices.map((invoice) => <tr key={invoice.id}><td>{invoice.invoiceNo}</td><td><span className="chip">{invoice.status}</span></td><td>{new Date(invoice.issuedAt).toLocaleDateString("en-BD")}</td><td>{new Date(invoice.dueAt).toLocaleDateString("en-BD")}</td><td>{formatMoney(Number(invoice.total))}</td></tr>)}
              {!data.subscription.invoices.length ? <tr><td colSpan={5}>No invoices yet.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

