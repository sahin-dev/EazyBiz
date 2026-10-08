"use client";

import { CircleDollarSign, Plus, Table2, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Button, Drawer, EmptyState, Input, Notice, Select, StatusBadge } from "@/components/ui/primitives";
import { clientRequest } from "@/lib/client-api";
import { formatMoney } from "@/lib/format";
import type { RestaurantTableRecord, SessionData } from "@/lib/types";

const paymentMethods = ["Cash", "Card", "bKash", "Nagad", "Rocket", "Bangla QR", "Bank transfer"];

export function TablesWorkspace({ tenant, role, branchId: assignedBranch, tables }: { tenant: NonNullable<SessionData["tenant"]>; role: string; branchId: string | null; tables: RestaurantTableRecord[] }) {
  const router = useRouter();
  const branches = assignedBranch ? tenant.branches.filter((item) => item.id === assignedBranch) : tenant.branches;
  const [branchId, setBranchId] = useState(branches[0]?.id || "");
  const [drawer, setDrawer] = useState<"create" | "settle" | null>(null);
  const [selected, setSelected] = useState<RestaurantTableRecord | null>(null);
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState(2);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const visible = tables.filter((table) => table.branchId === branchId);
  const canManage = ["owner", "admin", "manager"].includes(role);
  const canSettle = canManage || role === "cashier";

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setBusy(true);
    try { await clientRequest(`/tenants/${tenant.id}/tables`, { method: "POST", body: JSON.stringify({ branchId, name, capacity }) }); setDrawer(null); setName(""); setSuccess("Table added."); router.refresh(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Could not create table."); }
    finally { setBusy(false); }
  }
  async function setStatus(table: RestaurantTableRecord, status: "available" | "reserved") {
    setError("");
    try { await clientRequest(`/tenants/${tenant.id}/tables/${table.id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }); setSuccess(`${table.name} is now ${status}.`); router.refresh(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Could not update table."); }
  }
  async function settle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!selected?.orders[0]) return; setError(""); setBusy(true);
    try { await clientRequest(`/tenants/${tenant.id}/orders/${selected.orders[0].id}/settle`, { method: "POST", body: JSON.stringify({ paymentMethod }) }); setDrawer(null); setSuccess(`${selected.name} settled and available.`); router.refresh(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Could not settle order."); }
    finally { setBusy(false); }
  }

  return <div className="page-stack"><div className="page-heading"><div><p className="page-kicker">Floor management</p><h1>Tables</h1><p className="page-description">See availability, manage reservations, and settle dine-in orders.</p></div>{canManage ? <Button onClick={() => { setError(""); setDrawer("create"); }}><Plus size={17} /> Add table</Button> : null}</div>{success ? <Notice message={success} /> : null}{error && !drawer ? <Notice message={error} tone="error" /> : null}<div className="catalog-toolbar"><label className="catalog-filter"><select value={branchId} onChange={(event) => setBranchId(event.target.value)} aria-label="Select branch">{branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select></label><span className="catalog-count">{visible.filter((table) => table.status === "available").length} available / {visible.length} tables</span></div><div className="table-floor">{visible.map((table) => <article className="floor-table" key={table.id}><div className="floor-table-top"><span className="floor-table-icon"><Table2 size={23} /></span><StatusBadge label={table.status} tone={table.status === "available" ? "success" : table.status === "occupied" ? "warning" : "neutral"} /></div><h2>{table.name}</h2><p><Users size={14} />{table.capacity} seats / {table.branch.name}</p>{table.orders[0] ? <div className="floor-order"><span>{table.orders[0].orderNo}</span><strong>{formatMoney(table.orders[0].dueAmount)} due</strong></div> : <div className="floor-order muted">No active order</div>}<div className="floor-actions">{table.status === "available" && canSettle ? <><a className="button primary" href="/pos">New order</a><Button variant="secondary" onClick={() => setStatus(table, "reserved")}>Reserve</Button></> : null}{table.status === "reserved" && canSettle ? <Button variant="secondary" onClick={() => setStatus(table, "available")}>Release</Button> : null}{table.status === "occupied" && table.orders[0] && canSettle ? <Button onClick={() => { setSelected(table); setDrawer("settle"); setError(""); }}><CircleDollarSign size={16} /> Settle</Button> : null}</div></article>)}{!visible.length ? <div className="surface"><EmptyState icon={<Table2 size={29} />} title="No tables configured" detail="Add a table to start dine-in service." /></div> : null}</div>
    {drawer === "create" ? <Drawer title="Add table" onClose={() => setDrawer(null)}><form className="drawer-form" onSubmit={create}>{error ? <Notice message={error} tone="error" /> : null}<Select label="Branch" value={branchId} onChange={(event) => setBranchId(event.target.value)}>{branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</Select><Input label="Table name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Table 01" maxLength={40} required /><Input label="Seats" type="number" value={capacity} min={1} max={30} onChange={(event) => setCapacity(Number(event.target.value))} required /><div className="drawer-actions"><Button type="button" variant="secondary" onClick={() => setDrawer(null)}>Cancel</Button><Button disabled={busy}>{busy ? "Saving..." : "Add table"}</Button></div></form></Drawer> : null}
    {drawer === "settle" && selected?.orders[0] ? <Drawer title={`Settle ${selected.name}`} onClose={() => setDrawer(null)}><form className="drawer-form" onSubmit={settle}>{error ? <Notice message={error} tone="error" /> : null}<div className="stock-subject"><CircleDollarSign size={20} /><span><strong>{selected.orders[0].orderNo}</strong><small>Outstanding: {formatMoney(selected.orders[0].dueAmount)}</small></span></div><Select label="Payment method" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}>{paymentMethods.map((method) => <option key={method}>{method}</option>)}</Select><div className="drawer-actions"><Button type="button" variant="secondary" onClick={() => setDrawer(null)}>Cancel</Button><Button disabled={busy}>{busy ? "Settling..." : `Capture ${formatMoney(selected.orders[0].dueAmount)}`}</Button></div></form></Drawer> : null}
  </div>;
}
