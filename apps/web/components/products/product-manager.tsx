"use client";

import { businessTypeConfigs, type ProductSummary } from "@businessos/domain";
import { Boxes, ImageIcon, Package, Plus, Search, SlidersHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { clientRequest } from "@/lib/client-api";
import { formatMoney } from "@/lib/format";
import type { SessionData } from "@/lib/types";
import { Button, Drawer, EmptyState, Input, Notice, Select, StatusBadge } from "@/components/ui/primitives";
import { ProductImage } from "@/components/ui/product-image";

type ProductInput = { name: string; sku: string; imageUrl: string; barcode: string; category: string; brand: string; purchasePrice: number; salePrice: number; unit: string; stock: number; minimumStock: number; featured: boolean; attributes: Record<string, string | number | boolean | null> };

const emptyProduct: ProductInput = { name: "", sku: "", imageUrl: "", barcode: "", category: "", brand: "", purchasePrice: 0, salePrice: 0, unit: "piece", stock: 0, minimumStock: 0, featured: false, attributes: {} };

export function ProductManager({ tenant, products }: { tenant: NonNullable<SessionData["tenant"]>; products: ProductSummary[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All categories");
  const [drawer, setDrawer] = useState<"create" | "stock" | null>(null);
  const [selected, setSelected] = useState<ProductSummary | null>(null);
  const [form, setForm] = useState<ProductInput>(emptyProduct);
  const [adjustment, setAdjustment] = useState({ delta: 0, reason: "", type: "adjustment" });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const categories = useMemo(() => ["All categories", ...new Set(products.map((product) => product.category))], [products]);
  const filtered = products.filter((product) => (category === "All categories" || product.category === category) && `${product.name} ${product.sku} ${product.barcode ?? ""}`.toLowerCase().includes(query.toLowerCase()));
  const attributes = businessTypeConfigs[tenant.businessType].productAttributes;

  function update<K extends keyof ProductInput>(key: K, value: ProductInput[K]) { setForm((current) => ({ ...current, [key]: value })); }
  function openCreate() { setForm(emptyProduct); setError(""); setDrawer("create"); }
  function openStock(product: ProductSummary) { setSelected(product); setAdjustment({ delta: 0, reason: "", type: "adjustment" }); setError(""); setDrawer("stock"); }

  async function create(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      await clientRequest(`/tenants/${tenant.id}/products`, { method: "POST", body: JSON.stringify({ ...form, imageUrl: form.imageUrl || undefined, barcode: form.barcode || undefined, brand: form.brand || undefined }) });
      setNotice(`${form.name} was added to your catalog.`); setDrawer(null); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to create product."); }
    finally { setBusy(false); }
  }

  async function adjust(event: FormEvent) {
    event.preventDefault(); if (!selected) return; setBusy(true); setError("");
    try {
      await clientRequest(`/tenants/${tenant.id}/products/${selected.id}/stock`, { method: "PATCH", body: JSON.stringify(adjustment) });
      setNotice(`Stock updated for ${selected.name}.`); setDrawer(null); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to update stock."); }
    finally { setBusy(false); }
  }

  return <div className="page-stack">
    <div className="page-heading"><div><p className="page-kicker">Catalog management</p><h1>Products</h1><p className="page-description">Manage the catalog shared by POS and your storefront.</p></div><Button onClick={openCreate}><Plus size={17} /> Add product</Button></div>
    {notice ? <Notice message={notice} /> : null}
    <div className="catalog-toolbar"><label className="catalog-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products or scan barcode" aria-label="Search products" /></label><label className="catalog-filter"><SlidersHorizontal size={16} /><select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter category">{categories.map((option) => <option key={option}>{option}</option>)}</select></label><span className="catalog-count">{filtered.length} products</span></div>
    <section className="surface"><div className="table-wrap"><table className="data-grid catalog-table"><thead><tr><th>Product</th><th>SKU</th><th>Category</th><th className="numeric">Price</th><th className="numeric">Stock</th><th>Status</th><th className="numeric">Action</th></tr></thead><tbody>{filtered.map((product) => <tr key={product.id}><td><div className="table-product">{product.imageUrl ? <ProductImage src={product.imageUrl} alt="" width={86} height={86} /> : <span><ImageIcon size={20} /></span>}<div><strong>{product.name}</strong><small>{product.unit}{product.barcode ? ` · ${product.barcode}` : ""}</small></div></div></td><td className="mono">{product.sku}</td><td>{product.category}</td><td className="numeric strong">{formatMoney(product.salePrice)}</td><td className="numeric">{Number(product.stock)} {product.unit}</td><td><StatusBadge label={Number(product.stock) <= Number(product.minimumStock) ? "Low stock" : "In stock"} tone={Number(product.stock) <= Number(product.minimumStock) ? "warning" : "success"} /></td><td className="numeric"><button className="table-action" onClick={() => openStock(product)}>Adjust stock</button></td></tr>)}</tbody></table>{!filtered.length ? <EmptyState icon={<Package size={28} />} title="No products found" detail="Add a product or try another search." /> : null}</div></section>
    {drawer === "create" ? <Drawer title="Add product" onClose={() => setDrawer(null)}><form className="drawer-form" onSubmit={create}>
      {error ? <Notice message={error} tone="error" /> : null}
      <div className="form-section-title">Product details</div>
      <Input label="Product name" value={form.name} onChange={(event) => update("name", event.target.value)} minLength={2} required />
      <div className="form-row"><Input label="SKU" value={form.sku} onChange={(event) => update("sku", event.target.value)} minLength={2} required /><Input label="Barcode" value={form.barcode} onChange={(event) => update("barcode", event.target.value)} /></div>
      <div className="form-row"><Input label="Category" value={form.category} onChange={(event) => update("category", event.target.value)} required /><Input label="Brand" value={form.brand} onChange={(event) => update("brand", event.target.value)} /></div>
      <Input label="Product image URL" value={form.imageUrl} onChange={(event) => update("imageUrl", event.target.value)} placeholder="https://... or /products/image.png" hint="Use an HTTPS image URL for a product photo." />
      <div className="form-section-title">Pricing and stock</div>
      <div className="form-row"><Input label="Selling price (BDT)" type="number" min={0} step="0.01" value={form.salePrice} onChange={(event) => update("salePrice", Number(event.target.value))} required /><Input label="Purchase cost (BDT)" type="number" min={0} step="0.01" value={form.purchasePrice} onChange={(event) => update("purchasePrice", Number(event.target.value))} required /></div>
      <div className="form-row"><Input label="Opening stock" type="number" min={0} step="0.001" value={form.stock} onChange={(event) => update("stock", Number(event.target.value))} required /><Input label="Reorder level" type="number" min={0} step="0.001" value={form.minimumStock} onChange={(event) => update("minimumStock", Number(event.target.value))} required /></div>
      <Select label="Unit" value={form.unit} onChange={(event) => update("unit", event.target.value)}>{["piece", "plate", "kg", "gram", "liter", "bottle", "pack", "box", "bag"].map((unit) => <option key={unit}>{unit}</option>)}</Select>
      {attributes.length ? <><div className="form-section-title">{businessTypeConfigs[tenant.businessType].name} details</div>{attributes.map((attribute) => attribute.type === "boolean" ? <label className="check-field" key={attribute.key}><input type="checkbox" checked={form.attributes[attribute.key] === true} onChange={(event) => setForm((current) => ({ ...current, attributes: { ...current.attributes, [attribute.key]: event.target.checked } }))} />{attribute.label}</label> : attribute.type === "select" ? <Select key={attribute.key} label={attribute.label} value={String(form.attributes[attribute.key] ?? "")} onChange={(event) => setForm((current) => ({ ...current, attributes: { ...current.attributes, [attribute.key]: event.target.value } }))}><option value="">Select {attribute.label.toLowerCase()}</option>{attribute.options?.map((option) => <option key={option}>{option}</option>)}</Select> : <Input key={attribute.key} label={attribute.label} type={attribute.type === "number" ? "number" : attribute.type === "date" ? "date" : "text"} value={String(form.attributes[attribute.key] ?? "")} onChange={(event) => setForm((current) => ({ ...current, attributes: { ...current.attributes, [attribute.key]: attribute.type === "number" ? Number(event.target.value) : event.target.value } }))} required={attribute.required} />)}</> : null}
      <label className="check-field"><input type="checkbox" checked={form.featured} onChange={(event) => update("featured", event.target.checked)} /> Feature on storefront</label>
      <div className="drawer-actions"><Button variant="secondary" type="button" onClick={() => setDrawer(null)}>Cancel</Button><Button disabled={busy}>{busy ? "Saving..." : "Create product"}</Button></div>
    </form></Drawer> : null}
    {drawer === "stock" && selected ? <Drawer title="Adjust stock" onClose={() => setDrawer(null)}><form className="drawer-form" onSubmit={adjust}>{error ? <Notice message={error} tone="error" /> : null}<div className="stock-subject"><Boxes size={20} /><span><strong>{selected.name}</strong><small>Current total: {selected.stock} {selected.unit}</small></span></div><Select label="Movement type" value={adjustment.type} onChange={(event) => setAdjustment((current) => ({ ...current, type: event.target.value }))}><option value="adjustment">Correction</option><option value="wastage">Damage or wastage</option><option value="return">Customer return</option></Select><Input label="Quantity change" type="number" step="0.001" value={adjustment.delta} onChange={(event) => setAdjustment((current) => ({ ...current, delta: Number(event.target.value) }))} hint="Positive to add, negative to remove." required /><Input label="Reason" value={adjustment.reason} minLength={3} onChange={(event) => setAdjustment((current) => ({ ...current, reason: event.target.value }))} required /><div className="drawer-actions"><Button variant="secondary" type="button" onClick={() => setDrawer(null)}>Cancel</Button><Button disabled={busy || adjustment.delta === 0}>{busy ? "Updating..." : "Update stock"}</Button></div></form></Drawer> : null}
  </div>;
}
