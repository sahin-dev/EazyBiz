"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { clientRequest } from "@/lib/client-api";
import type { SubscriptionData } from "@/lib/types";
import { formatMoney } from "@/lib/format";

export function SubscriptionManager({ tenantId, data }: { tenantId: string; data: SubscriptionData }) {
  const router = useRouter();
  const [planCode, setPlanCode] = useState(data.subscription.planCode);
  const [interval, setInterval] = useState<"monthly" | "yearly">(data.subscription.interval);
  const [paymentMethod, setPaymentMethod] = useState("bKash");
  const [reference, setReference] = useState("");
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const amount = Number(data.subscription.amount);

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

  return (
    <>
      <div className="topbar">
        <div><p className="eyebrow">Plan and billing</p><h1>Subscription</h1></div>
        <span className={`chip ${data.subscription.status === "active" || data.subscription.status === "trialing" ? "active" : "warn"}`}>{data.subscription.status}</span>
      </div>
      {notice ? <p className="notice success" role="status">{notice}</p> : null}
      {error ? <p className="notice error" role="alert">{error}</p> : null}
      <div className="grid two">
        <article className="card">
          <div className="card-header"><div><h2>Plan</h2><p>Choose a base plan and billing interval.</p></div></div>
          <div className="subscription-form">
            <label className="pos-field">
              <span>Plan</span>
              <select value={planCode} onChange={(event) => setPlanCode(event.target.value)}>
                {data.plans.map((plan) => <option key={plan.code} value={plan.code}>{plan.name} · {formatMoney(plan.monthlyBasePrice)}/month base</option>)}
              </select>
            </label>
            <label className="pos-field">
              <span>Billing interval</span>
              <select value={interval} onChange={(event) => setInterval(event.target.value as "monthly" | "yearly")}>
                <option value="monthly">Monthly</option><option value="yearly">Yearly (12 monthly periods)</option>
              </select>
            </label>
            <button
              className="button primary"
              type="button"
              disabled={busy === "plan"}
              onClick={() => void runAction("plan", () => clientRequest(`/tenants/${tenantId}/subscription`, {
                method: "PATCH",
                body: JSON.stringify({ planCode, interval }),
              }), "Plan updated.")}
            >
              {busy === "plan" ? "Saving…" : "Save plan"}
            </button>
            <div className="subscription-total"><span>Current total</span><strong>{formatMoney(amount)} / {data.subscription.interval === "yearly" ? "year" : "month"}</strong></div>
            {data.subscription.trialEndsAt ? <p className="muted">Trial ends {new Date(data.subscription.trialEndsAt).toLocaleDateString("en-BD")}.</p> : null}
          </div>
        </article>
        <article className="card">
          <div className="card-header"><div><h2>Payment history</h2><p>Manual payments are recorded as pending until platform review.</p></div></div>
          <div className="subscription-form">
            <label className="pos-field">
              <span>Payment method</span>
              <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}>
                {["bKash", "Nagad", "Rocket", "Bangla QR", "Bank transfer", "Manual"].map((method) => <option key={method}>{method}</option>)}
              </select>
            </label>
            <label className="pos-field">
              <span>Transaction reference (optional)</span>
              <input value={reference} onChange={(event) => setReference(event.target.value)} maxLength={120} />
            </label>
            <button
              className="button primary"
              type="button"
              disabled={busy === "payment"}
              onClick={() => void runAction("payment", async () => {
                await clientRequest(`/tenants/${tenantId}/subscription/payments`, {
                  method: "POST",
                  body: JSON.stringify({ method: paymentMethod, reference: reference || undefined }),
                });
                setReference("");
              }, "Payment submitted for review.")}
            >
              {busy === "payment" ? "Submitting…" : `Record payment · ${formatMoney(amount)}`}
            </button>
            <div className="payment-history">
              {data.subscription.payments.length ? data.subscription.payments.map((payment) => (
                <div className="payment-row" key={payment.id}>
                  <span>{payment.method}{payment.reference ? ` · ${payment.reference}` : ""}<small>{new Date(payment.createdAt).toLocaleDateString("en-BD")}</small></span>
                  <strong>{formatMoney(Number(payment.amount))}</strong>
                  <span className="chip">{payment.status}</span>
                </div>
              )) : <p className="muted">No payments recorded.</p>}
            </div>
          </div>
        </article>
      </div>
      <section className="card subscription-modules">
        <div className="card-header"><div><h2>Business modules</h2><p>Module prices are monthly add-ons; yearly billing is twelve monthly periods.</p></div></div>
        <div className="module-catalog">
          {data.modules.map((module) => (
            <label className="module-row" key={module.id}>
              <input
                type="checkbox"
                checked={module.enabled}
                disabled={!module.available || module.id === "pos" || busy === module.id}
                onChange={(event) => void runAction(module.id, () => clientRequest(`/tenants/${tenantId}/subscription/modules`, {
                  method: "PATCH",
                  body: JSON.stringify({ moduleId: module.id, enabled: event.target.checked }),
                }), `${module.name} ${event.target.checked ? "enabled" : "disabled"}.`)}
              />
              <span><strong>{module.name}</strong><small>{module.summary}</small></span>
              <span>{module.available ? `${formatMoney(module.monthlyPrice)} / month` : "Planned"}</span>
            </label>
          ))}
        </div>
      </section>
    </>
  );
}
