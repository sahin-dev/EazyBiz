"use client";

import { Boxes, Plus, Search, Truck } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import type { ProductSummary } from "@businessos/domain";
import { roundMoney } from "@businessos/domain";
import { Button, Drawer, EmptyState, Input, Notice, Select, StatusBadge } from "@/components/ui/primitives";
import { clientRequest } from "@/lib/client-api";
import { formatMoney } from "@/lib/format";
import type { InventoryData, PurchaseRecord, SessionData, SupplierRecord } from "@/lib/types";

type Tenant = NonNullable<SessionData["tenant"]>;
type Line = { productId: string; quantity: number; unitCost: number; batchNo: string; expiryDate: string };

export function InventoryWorkspace({ tenant, branchId: assignedBranch, inventory, suppliers, products, purchases }: { tenant: Tenant; branchId: string | null; inventory: InventoryData; suppliers: SupplierRecord[]; products: Array<Pick<ProductSummary, "id" | "name" | "sku">>; purchases: PurchaseRecord[] }) {
  const router = useRouter();
  const branches = assignedBranch ? tenant.branches.filter((item) => item.id === assignedBranch) : tenant.branches;
  const [branchId, setBranchId] = useState(branches[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [supplierId, setSupplierId] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [paid, setPaid] = useState(0);
  const [lines, setLines] = useState<Line[]>([{ productId: "", quantity: 1, unitCost: 0, batchNo: "", expiryDate: "" }]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const balances = inventory.balances.filter((item) => item.branchId === branchId && `${item.product.name} ${item.product.sku}`.toLowerCase().includes(query.toLowerCase()));
  const total = roundMoney(lines.reduce((sum, line) => sum + roundMoney(line.quantity * line.unitCost), 0));

  function updateLine(index: number, patch: Partial<Line>) { setLines((current) => current.map((line, position) => position === index ? { ...line, ...patch } : line)); }

  async function receive(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    if (new Set(lines.map((line) => line.productId)).size !== lines.length) { setError("Select each product only once per purchase."); return; }
    setBusy(true);
    try {
      await clientRequest(`/tenants/${tenant.id}/purchases/receive`, { method: "POST", body: JSON.stringify({ branchId, supplierId, invoiceNo: invoiceNo || undefined, paid, items: lines.map((line) => ({ productId: line.productId, quantity: line.quantity, unitCost: line.unitCost, batchNo: line.batchNo || undefined, expiryDate: line.expiryDate || undefined })) }) });
      setOpen(false); setSuccess("Purchase received and branch stock updated."); setLines([{ productId: "", quantity: 1, unitCost: 0, batchNo: "", expiryDate: "" }]); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to receive purchase."); }
    finally { setBusy(false); }
  }

  return <div className="page-stack">
    <div className="page-heading"><div><p className="page-kicker">Stock control</p><h1>Inventory</h1><p className="page-description">Live stock by branch with an auditable movement trail.</p></div>{tenant.enabledModules.includes("purchasing") && tenant.enabledModules.includes("suppliers") ? <Button onClick={() => { setError(""); setOpen(true); }}><Plus size={17} /> Receive purchase</Button> : null}</div>
    {success ? <Notice message={success} /> : null}
    <div className="inventory-summary"><div><span>Active SKUs</span><strong>{balances.length}</strong></div><div><span>Low stock</span><strong>{balances.filter((item) => Number(item.quantity) <= Number(item.minimumStock)).length}</strong></div><div><span>Stock value</span><strong>{formatMoney(balances.reduce((sum, item) => sum + Number(item.quantity) * Number(item.product.purchasePrice), 0))}</strong></div></div>
    <div className="catalog-toolbar"><label className="catalog-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search inventory" aria-label="Search inventory" /></label><label className="catalog-filter"><select value={branchId} onChange={(event) => setBranchId(event.target.value)} aria-label="Select branch">{branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select></label></div>
    <section className="surface"><div className="surface-heading"><div><h2>Stock balances</h2><p>Available quantity at the selected branch</p></div></div><div className="table-wrap"><table className="data-grid"><thead><tr><th>Product</th><th>SKU</th><th className="numeric">On hand</th><th className="numeric">Reorder at</th><th className="numeric">Value</th><th>Status</th></tr></thead><tbody>{balances.map((item) => <tr key={item.id}><td><strong>{item.product.name}</strong><small>{item.product.category}</small></td><td className="mono">{item.product.sku}</td><td className="numeric strong">{Number(item.quantity)} {item.product.unit}</td><td className="numeric">{Number(item.minimumStock)}</td><td className="numeric">{formatMoney(Number(item.quantity) * Number(item.product.purchasePrice))}</td><td><StatusBadge label={Number(item.quantity) <= Number(item.minimumStock) ? "Reorder" : "Healthy"} tone={Number(item.quantity) <= Number(item.minimumStock) ? "warning" : "success"} /></td></tr>)}</tbody></table>{balances.length === 0 ? <EmptyState icon={<Boxes size={28} />} title="No stock records" detail="Add products or receive a purchase at this branch." /> : null}</div></section>
    <section className="surface"><div className="surface-heading"><div><h2>Recent movements</h2><p>Latest 50 inventory events</p></div></div><div className="table-wrap"><table className="data-grid"><thead><tr><th>Date</th><th>Product</th><th>Movement</th><th>Branch</th><th className="numeric">Change</th><th className="numeric">Balance</th></tr></thead><tbody>{inventory.movements.filter((item) => item.branch.name === branches.find((branch) => branch.id === branchId)?.name).map((item) => <tr key={item.id}><td>{new Date(item.createdAt).toLocaleDateString("en-BD")}</td><td><strong>{item.product.name}</strong></td><td>{item.type}</td><td>{item.branch.name}</td><td className="numeric">{Number(item.quantity) > 0 ? "+" : ""}{Number(item.quantity)}</td><td className="numeric strong">{Number(item.balanceAfter)}</td></tr>)}</tbody></table></div></section>
    {purchases.length ? <section className="surface"><div className="surface-heading"><div><h2>Received purchases</h2><p>Vendor receipts and payable balances</p></div></div><div className="table-wrap"><table className="data-grid"><thead><tr><th>Purchase</th><th>Supplier</th><th>Branch</th><th>Items</th><th className="numeric">Total</th><th className="numeric">Due</th></tr></thead><tbody>{purchases.slice(0, 20).map((purchase) => <tr key={purchase.id}><td><strong>{purchase.purchaseNo}</strong><small>{purchase.invoiceNo || "No vendor invoice"}</small></td><td>{purchase.supplier.name}</td><td>{purchase.branch.name}</td><td>{purchase.items.length}</td><td className="numeric strong">{formatMoney(purchase.subtotal)}</td><td className="numeric">{formatMoney(purchase.due)}</td></tr>)}</tbody></table></div></section> : null}
    {open ? <Drawer title="Receive purchase" onClose={() => setOpen(false)}><form className="drawer-form" onSubmit={receive}>{error ? <Notice message={error} tone="error" /> : null}<Select label="Branch" value={branchId} onChange={(event) => setBranchId(event.target.value)} required>{branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</Select><Select label="Supplier" value={supplierId} onChange={(event) => setSupplierId(event.target.value)} required><option value="">Select supplier</option>{suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}</Select>{suppliers.length === 0 ? <Notice message="Add a supplier before receiving a purchase." tone="error" /> : null}<Input label="Supplier invoice number" value={invoiceNo} onChange={(event) => setInvoiceNo(event.target.value)} /><div className="form-section-title">Products</div>{lines.map((line, index) => <div className="purchase-line" key={index}><Select label={`Product ${index + 1}`} value={line.productId} onChange={(event) => updateLine(index, { productId: event.target.value })} required><option value="">Select product</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</Select><div className="form-row"><Input label="Quantity" type="number" min="0.001" step="0.001" value={line.quantity} onChange={(event) => updateLine(index, { quantity: Number(event.target.value) })} required /><Input label="Unit cost (BDT)" type="number" min="0" step="0.01" value={line.unitCost} onChange={(event) => updateLine(index, { unitCost: Number(event.target.value) })} required /></div>{tenant.businessType === "pharmacy" ? <div className="form-row"><Input label="Batch number" value={line.batchNo} onChange={(event) => updateLine(index, { batchNo: event.target.value })} /><Input label="Expiry date" type="date" value={line.expiryDate} onChange={(event) => updateLine(index, { expiryDate: event.target.value })} /></div> : null}{lines.length > 1 ? <button className="table-action" type="button" onClick={() => setLines((current) => current.filter((_, position) => position !== index))}>Remove line</button> : null}</div>)}<button className="table-action" type="button" onClick={() => setLines((current) => [...current, { productId: "", quantity: 1, unitCost: 0, batchNo: "", expiryDate: "" }])}><Plus size={14} /> Add product line</button><div className="purchase-total"><span>Purchase total</span><strong>{formatMoney(total)}</strong></div><Input label="Paid now (BDT)" type="number" min="0" max={total} step="0.01" value={paid} onChange={(event) => setPaid(Number(event.target.value))} required /><div className="drawer-actions"><Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button disabled={busy || !suppliers.length || !products.length}><Truck size={16} />{busy ? "Receiving..." : "Receive stock"}</Button></div></form></Drawer> : null}
  </div>;
}
