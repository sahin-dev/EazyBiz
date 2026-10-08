"use client";

import { Plus, Search, UsersRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { clientRequest } from "@/lib/client-api";
import { formatMoney } from "@/lib/format";
import { Button, Drawer, EmptyState, Input, Notice, Select, StatusBadge } from "@/components/ui/primitives";

type Kind = "customers" | "suppliers" | "staff";
type Row = { id: string; name: string; phone?: string; detail: string; amount: number; secondary: string; status?: string };
type Field = { key: string; label: string; kind?: "email" | "number" | "select"; required?: boolean; options?: string[] };

const settings: Record<Kind, { title: string; kicker: string; description: string; action: string; amount: string; fields: Field[] }> = {
  customers: { title: "Customers", kicker: "Relationships", description: "Customer history, balances, and loyalty in one place.", action: "Add customer", amount: "Total spend", fields: [{ key: "name", label: "Full name", required: true }, { key: "phone", label: "Mobile number", required: true }, { key: "email", label: "Email", kind: "email" }, { key: "address", label: "Address" }] },
  suppliers: { title: "Suppliers", kicker: "Procurement", description: "Keep vendor contacts and outstanding balances organized.", action: "Add supplier", amount: "Payable", fields: [{ key: "name", label: "Supplier name", required: true }, { key: "category", label: "Category", required: true }, { key: "phone", label: "Mobile number", required: true }, { key: "email", label: "Email", kind: "email" }, { key: "address", label: "Address" }, { key: "openingPayable", label: "Opening payable (BDT)", kind: "number" }] },
  staff: { title: "Staff", kicker: "Team management", description: "Maintain employee assignments, roles, and shifts.", action: "Add employee", amount: "Monthly salary", fields: [{ key: "employeeNo", label: "Employee number", required: true }, { key: "name", label: "Full name", required: true }, { key: "phone", label: "Mobile number" }, { key: "role", label: "Role", kind: "select", required: true, options: ["cashier", "salesStaff", "inventoryManager", "kitchenStaff", "pharmacist", "manager"] }, { key: "shift", label: "Shift", kind: "select", required: true, options: ["Morning", "Evening", "Night", "Flexible"] }, { key: "salary", label: "Monthly salary (BDT)", kind: "number", required: true }] },
};

export function Directory({ kind, tenantId, rows }: { kind: Kind; tenantId: string; rows: Row[] }) {
  const config = settings[kind];
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const filtered = rows.filter((row) => `${row.name} ${row.phone ?? ""} ${row.detail}`.toLowerCase().includes(query.toLowerCase()));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const payload = Object.fromEntries(config.fields.map((field) => [field.key, field.kind === "number" ? Number(form[field.key] || 0) : form[field.key] || undefined]));
    try {
      await clientRequest(`/tenants/${tenantId}/${kind}`, { method: "POST", body: JSON.stringify(payload) });
      setOpen(false); setForm({}); setSuccess(`${config.title.slice(0, -1)} added successfully.`); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to save record."); }
    finally { setBusy(false); }
  }

  return <div className="page-stack">
    <div className="page-heading"><div><p className="page-kicker">{config.kicker}</p><h1>{config.title}</h1><p className="page-description">{config.description}</p></div><Button onClick={() => { setError(""); setOpen(true); }}><Plus size={17} />{config.action}</Button></div>
    {success ? <Notice message={success} /> : null}
    <div className="catalog-toolbar"><label className="catalog-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${kind}`} aria-label={`Search ${kind}`} /></label><span className="catalog-count">{filtered.length} records</span></div>
    <section className="surface"><div className="table-wrap"><table className="data-grid"><thead><tr><th>Name</th><th>Contact</th><th>Details</th><th className="numeric">{config.amount}</th><th>Status</th></tr></thead><tbody>{filtered.map((row) => <tr key={row.id}><td><strong>{row.name}</strong><small>{row.secondary}</small></td><td>{row.phone || "Not provided"}</td><td>{row.detail}</td><td className="numeric strong">{formatMoney(row.amount)}</td><td><StatusBadge label={row.status || "Active"} tone="success" /></td></tr>)}</tbody></table>{!filtered.length ? <EmptyState icon={<UsersRound size={27} />} title={`No ${kind} found`} detail={query ? "Try another search." : `Use ${config.action.toLowerCase()} to get started.`} /> : null}</div></section>
    {open ? <Drawer title={config.action} onClose={() => setOpen(false)}><form className="drawer-form" onSubmit={submit}>{error ? <Notice message={error} tone="error" /> : null}{config.fields.map((field) => field.kind === "select" ? <Select key={field.key} label={field.label} value={form[field.key] || ""} onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.value }))} required={field.required}><option value="">Select {field.label.toLowerCase()}</option>{field.options?.map((option) => <option key={option} value={option}>{option}</option>)}</Select> : <Input key={field.key} label={field.label} type={field.kind || "text"} value={form[field.key] || ""} onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.value }))} required={field.required} min={field.kind === "number" ? 0 : undefined} step={field.kind === "number" ? "0.01" : undefined} minLength={field.key === "name" ? 2 : undefined} placeholder={field.key === "phone" ? "01XXXXXXXXX" : undefined} />)}<div className="drawer-actions"><Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button disabled={busy}>{busy ? "Saving..." : config.action}</Button></div></form></Drawer> : null}
  </div>;
}
