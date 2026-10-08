"use client";

import { FileClock, RefreshCw, Search, SlidersHorizontal } from "lucide-react";
import { useRef, useState } from "react";
import { Button, Drawer, EmptyState, Notice } from "@/components/ui/primitives";
import { clientRequest } from "@/lib/client-api";
import type { AuditEvent, AuditPageData } from "@/lib/types";

type Category = "all" | "access" | "sales" | "inventory" | "billing" | "storefront" | "people";
const categories: Array<{ value: Category; label: string }> = [
  { value: "all", label: "All events" }, { value: "access", label: "Access" },
  { value: "sales", label: "Sales" }, { value: "inventory", label: "Inventory" },
  { value: "billing", label: "Billing" }, { value: "storefront", label: "Storefront" },
  { value: "people", label: "People" },
];
const eventLabel = (action: string) => action.split(".").slice(1).join(" ").replaceAll("_", " ") || action;
const dateLabel = (value: string) => new Intl.DateTimeFormat("en-BD", { timeZone: "Asia/Dhaka", dateStyle: "medium", timeStyle: "short" }).format(new Date(value));

export function AuditLog({ tenantId, initial }: { tenantId: string; initial: AuditPageData }) {
  const [category, setCategory] = useState<Category>("all");
  const [page, setPage] = useState(initial);
  const [selected, setSelected] = useState<AuditEvent | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const requestId = useRef(0);

  async function load(nextCategory: Category, cursor?: string) {
    const currentRequest = ++requestId.current;
    setBusy(true); setError("");
    try {
      const query = new URLSearchParams({ category: nextCategory });
      if (cursor) query.set("cursor", cursor);
      const result = await clientRequest<AuditPageData>(`/tenants/${tenantId}/audit-logs?${query}`);
      if (currentRequest === requestId.current) setPage((current) => ({ items: cursor ? [...current.items, ...result.items] : result.items, nextCursor: result.nextCursor }));
    } catch (cause) { if (currentRequest === requestId.current) setError(cause instanceof Error ? cause.message : "Unable to load audit events."); }
    finally { if (currentRequest === requestId.current) setBusy(false); }
  }

  function changeCategory(nextCategory: Category) {
    setCategory(nextCategory);
    setPage({ items: [], nextCursor: null });
    void load(nextCategory);
  }

  return <div className="page-stack audit-page">
    <div className="page-heading"><div><p className="page-kicker">Workspace administration</p><h1>Audit log</h1><p className="page-description">Recorded account and operational changes.</p></div><Button variant="secondary" onClick={() => void load(category)} disabled={busy}><RefreshCw size={16} />Refresh</Button></div>
    {error ? <Notice message={error} tone="error" /> : null}
    <div className="audit-toolbar"><label className="catalog-filter"><SlidersHorizontal size={16} /><select value={category} onChange={(event) => changeCategory(event.target.value as Category)} aria-label="Filter audit events">{categories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label><span className="catalog-count">{page.items.length} events shown</span></div>
    <section className="surface"><div className="table-wrap"><table className="data-grid audit-table"><thead><tr><th scope="col">Date & time</th><th scope="col">Actor</th><th scope="col">Event</th><th scope="col">Record</th><th scope="col">Details</th></tr></thead><tbody>{page.items.map((event) => <tr key={event.id}><td>{dateLabel(event.createdAt)}</td><td><strong>{event.user?.name ?? "System"}</strong><small>{event.user?.email ?? "Automated event"}</small></td><td><span className="audit-event-label">{eventLabel(event.action)}</span><small>{event.action}</small></td><td><strong>{event.entityType}</strong><small className="mono">{event.entityId ?? "-"}</small></td><td><button className="audit-detail-button" type="button" onClick={() => setSelected(event)} aria-label={`View details for ${event.action}`} title="View event details"><Search size={16} /></button></td></tr>)}</tbody></table>{!page.items.length ? <EmptyState icon={<FileClock size={28} />} title="No events found" detail={category === "all" ? "Recorded changes will appear here." : "Try another event category."} /> : null}</div>{page.nextCursor ? <div className="audit-pagination"><span>Showing the latest {page.items.length} events</span><Button variant="secondary" disabled={busy} onClick={() => void load(category, page.nextCursor ?? undefined)}>{busy ? "Loading..." : "Load more"}</Button></div> : null}</section>
    {selected ? <Drawer title="Event details" onClose={() => setSelected(null)}><div className="audit-details"><dl><div><dt>Event</dt><dd>{selected.action}</dd></div><div><dt>Time</dt><dd>{dateLabel(selected.createdAt)}</dd></div><div><dt>Actor</dt><dd>{selected.user?.name ?? "System"}</dd></div><div><dt>Record</dt><dd>{selected.entityType} {selected.entityId ?? ""}</dd></div><div><dt>IP address</dt><dd>{selected.ipAddress ?? "Not recorded"}</dd></div></dl><h3>Recorded details</h3><pre>{JSON.stringify(selected.metadata ?? {}, null, 2)}</pre></div></Drawer> : null}
  </div>;
}
