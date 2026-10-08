"use client";

import { ChefHat, Clock3, RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, EmptyState, Notice, StatusBadge } from "@/components/ui/primitives";
import { clientRequest } from "@/lib/client-api";
import type { KitchenTicketRecord } from "@/lib/types";

const nextStatus: Record<string, { value: "preparing" | "ready" | "served"; label: string }> = { new: { value: "preparing", label: "Start preparing" }, preparing: { value: "ready", label: "Mark ready" }, ready: { value: "served", label: "Mark served" } };
const columns = ["new", "preparing", "ready", "served"] as const;

export function KitchenBoard({ tenantId, tickets }: { tenantId: string; tickets: KitchenTicketRecord[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  useEffect(() => { const timer = window.setInterval(() => router.refresh(), 15000); return () => window.clearInterval(timer); }, [router]);
  async function advance(ticket: KitchenTicketRecord) {
    const next = nextStatus[ticket.status]; if (!next) return; setBusyId(ticket.id); setError("");
    try { await clientRequest(`/tenants/${tenantId}/kitchen/${ticket.id}/status`, { method: "PATCH", body: JSON.stringify({ status: next.value }) }); router.refresh(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Could not update kitchen ticket."); }
    finally { setBusyId(""); }
  }
  return <div className="page-stack"><div className="page-heading"><div><p className="page-kicker">Kitchen display</p><h1>Kitchen</h1><p className="page-description">Orders refresh automatically every 15 seconds.</p></div><Button variant="secondary" onClick={() => router.refresh()}><RefreshCcw size={16} /> Refresh</Button></div>{error ? <Notice message={error} tone="error" /> : null}<div className="kitchen-board">{columns.map((status) => <section className="kitchen-column" key={status}><div className="kitchen-column-head"><h2>{status === "new" ? "New orders" : status === "preparing" ? "Preparing" : status === "ready" ? "Ready" : "Served"}</h2><span>{tickets.filter((ticket) => ticket.status === status).length}</span></div><div className="kitchen-ticket-list">{tickets.filter((ticket) => ticket.status === status).map((ticket) => <article className="kitchen-ticket" key={ticket.id}><div className="kitchen-ticket-top"><strong>{ticket.order.orderNo}</strong><StatusBadge label={ticket.order.table?.name || ticket.order.orderType} tone={status === "ready" ? "success" : "neutral"} /></div><p className="kitchen-meta"><Clock3 size={14} />{new Intl.DateTimeFormat("en-BD", { timeZone: "Asia/Dhaka", timeStyle: "short" }).format(new Date(ticket.createdAt))} / {ticket.branch.name}</p><ul>{ticket.order.items.map((item) => <li key={item.id}><b>{Number(item.quantity)}x</b><span>{item.name}</span></li>)}</ul>{ticket.order.notes ? <p className="kitchen-note">{ticket.order.notes}</p> : null}{nextStatus[status] ? <Button onClick={() => advance(ticket)} disabled={busyId === ticket.id}>{busyId === ticket.id ? "Updating..." : nextStatus[status].label}</Button> : null}</article>)}{!tickets.some((ticket) => ticket.status === status) ? <div className="kitchen-column-empty"><ChefHat size={22} />No orders</div> : null}</div></section>)}</div>{!tickets.length ? <EmptyState icon={<ChefHat size={30} />} title="Kitchen is clear" detail="New food orders will appear here." /> : null}</div>;
}
