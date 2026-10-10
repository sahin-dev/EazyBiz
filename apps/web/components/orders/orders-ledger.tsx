"use client";

import { ClipboardList, Eye, RotateCcw, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Button, Drawer, EmptyState, Notice, Select, StatusBadge } from "@/components/ui/primitives";
import { clientRequest } from "@/lib/client-api";
import { formatMoney } from "@/lib/format";
import type { OrderRecord } from "@/lib/types";

const refundMethods = ["Cash", "Card", "bKash", "Nagad", "Rocket", "Bangla QR", "Bank transfer", "Manual"];

export function OrdersLedger({ tenantId, role, orders }: { tenantId: string; role: string; orders: OrderRecord[] }) {
  const router = useRouter();
  const canReturn = ["owner", "admin", "manager"].includes(role);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<OrderRecord | null>(null);
  const [details, setDetails] = useState<OrderRecord | null>(null);
  const [reason, setReason] = useState("");
  const [disposition, setDisposition] = useState<"restock" | "writeOff">("writeOff");
  const [refundMethod, setRefundMethod] = useState("Cash");
  const [refundReference, setRefundReference] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const visible = orders.filter((order) => `${order.orderNo} ${order.paymentMethod} ${order.status}`.toLowerCase().includes(query.toLowerCase()));

  function openReturn(order: OrderRecord) {
    setSelected(order); setReason(""); setDisposition("writeOff"); setRefundMethod("Cash"); setRefundReference(""); setError("");
  }

  async function submitReturn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    setBusy(true); setError("");
    try {
      await clientRequest(`/tenants/${tenantId}/orders/${selected.id}/return`, { method: "POST", body: JSON.stringify({
        reason, disposition, ...(Number(selected.paidAmount) > 0 ? { refundMethod, refundReference: refundReference || undefined } : {}),
      }) });
      setSelected(null); setNotice(`${selected.orderNo} returned. The refund is recorded in the payment ledger.`); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "The return could not be completed."); }
    finally { setBusy(false); }
  }

  return <div className="page-stack">
    <div className="page-heading"><div><p className="page-kicker">Sales ledger</p><h1>Orders</h1><p className="page-description">Sales, payments, outstanding balances, and returns.</p></div><Link className="button primary" href="/pos">New sale</Link></div>
    {notice ? <Notice message={notice} /> : null}
    <div className="catalog-toolbar"><label className="catalog-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search orders" aria-label="Search orders" /></label></div>
    <section className="surface"><div className="table-wrap"><table className="data-grid orders-table"><thead><tr><th>Order</th><th>Created</th><th>Source</th><th>Items</th><th>Payment</th><th>Status</th><th className="numeric">Total</th><th className="numeric">Due</th><th aria-label="Actions" /></tr></thead><tbody>{visible.map((order) => <tr key={order.id}><td><strong>{order.orderNo}</strong></td><td>{new Intl.DateTimeFormat("en-BD", { timeZone: "Asia/Dhaka", dateStyle: "medium", timeStyle: "short" }).format(new Date(order.createdAt))}</td><td>{order.source}</td><td>{order.items?.length ?? 0}</td><td>{order.paymentMethod}</td><td><StatusBadge label={order.status === "Refunded" ? "Returned" : order.paymentStatus} tone={order.status === "Refunded" ? "danger" : order.paymentStatus === "captured" ? "success" : "warning"} /></td><td className="numeric strong">{formatMoney(order.total)}</td><td className="numeric">{formatMoney(order.dueAmount)}</td><td><div className="order-actions"><button type="button" className="icon-button" title="View order" aria-label={`View ${order.orderNo}`} onClick={() => setDetails(order)}><Eye size={17} /></button>{canReturn ? <button type="button" className="icon-button" title="Return order" aria-label={`Return ${order.orderNo}`} disabled={order.status === "Refunded"} onClick={() => openReturn(order)}><RotateCcw size={17} /></button> : null}</div></td></tr>)}</tbody></table>{orders.length === 0 ? <EmptyState icon={<ClipboardList size={28} />} title="No orders yet" detail="Sales completed in POS will appear here." /> : null}{orders.length > 0 && visible.length === 0 ? <EmptyState icon={<Search size={28} />} title="No matching orders" detail="Try another order number or status." /> : null}</div></section>
    {details ? <Drawer title={details.orderNo} onClose={() => setDetails(null)} footer={canReturn && details.status !== "Refunded" ? <Button variant="secondary" onClick={() => { setDetails(null); openReturn(details); }}><RotateCcw size={16} /> Return order</Button> : undefined}>
      <div className="order-detail-meta"><span>Status<strong>{details.status === "Refunded" ? "Returned" : details.status}</strong></span><span>Payment<strong>{details.paymentStatus}</strong></span><span>Source<strong>{details.source}</strong></span></div>
      <h3 className="order-detail-heading">Items</h3><div className="return-lines">{details.items.map((item) => <div key={item.id}><span>{item.name} <small>x {Number(item.quantity)}</small></span><strong>{formatMoney(item.total)}</strong></div>)}</div>
      <div className="order-totals"><span>Total<strong>{formatMoney(details.total)}</strong></span><span>Original paid<strong>{formatMoney(details.paidAmount)}</strong></span><span>Outstanding<strong>{formatMoney(details.dueAmount)}</strong></span></div>
      <h3 className="order-detail-heading">Payment activity</h3><div className="order-payments">{details.payments.map((payment) => <div key={payment.id}><span><strong>{payment.status === "refunded" ? "Refund" : "Payment"} / {payment.method}</strong><small>{new Intl.DateTimeFormat("en-BD", { timeZone: "Asia/Dhaka", dateStyle: "medium", timeStyle: "short" }).format(new Date(payment.createdAt))}{payment.reference ? ` / ${payment.reference}` : ""}</small></span><strong className={payment.status === "refunded" ? "negative" : ""}>{formatMoney(payment.amount)}</strong></div>)}{details.payments.length === 0 ? <p className="page-description">No payment recorded.</p> : null}</div>
    </Drawer> : null}
    {selected ? <Drawer title={`Return ${selected.orderNo}`} onClose={() => { if (!busy) setSelected(null); }} footer={<Button form="return-order-form" type="submit" disabled={busy}>{busy ? "Recording return..." : "Confirm return"}</Button>}><form id="return-order-form" className="drawer-form" onSubmit={submitReturn}>
      {error ? <Notice message={error} tone="error" /> : null}
      <div className="return-summary"><span>Order total<strong>{formatMoney(selected.total)}</strong></span><span>Refund to record<strong>{formatMoney(selected.paidAmount)}</strong></span><span>Due to reverse<strong>{formatMoney(selected.dueAmount)}</strong></span></div>
      <div className="return-lines">{selected.items.map((item) => <div key={item.id}><span>{item.name} <small>x {Number(item.quantity)}</small></span><strong>{formatMoney(item.total)}</strong></div>)}</div>
      <label className="form-field"><span>Reason</span><textarea value={reason} onChange={(event) => setReason(event.target.value)} minLength={10} maxLength={500} rows={3} required /></label>
      <Select label="Stock disposition" value={disposition} onChange={(event) => setDisposition(event.target.value as "restock" | "writeOff")}><option value="writeOff">Write off</option><option value="restock">Return to stock</option></Select>
      {Number(selected.paidAmount) > 0 ? <><Select label="Refund issued by" value={refundMethod} onChange={(event) => setRefundMethod(event.target.value)}>{refundMethods.map((method) => <option key={method} value={method}>{method}</option>)}</Select>{refundMethod !== "Cash" ? <label className="form-field"><span>Refund transaction reference</span><input value={refundReference} onChange={(event) => setRefundReference(event.target.value)} maxLength={120} required /></label> : null}</> : null}
    </form></Drawer> : null}
  </div>;
}
