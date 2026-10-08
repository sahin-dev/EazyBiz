"use client";

import { ArrowDown, ArrowUp, ExternalLink, Eye, EyeOff, GripVertical, Plus, Save, Send, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ProductSummary } from "@businessos/domain";
import { Button, Input, Notice, Select, StatusBadge } from "@/components/ui/primitives";
import { ProductImage } from "@/components/ui/product-image";
import { clientRequest } from "@/lib/client-api";
import { formatMoney } from "@/lib/format";
import type { SessionData, StorefrontData, StorefrontSection } from "@/lib/types";

const sectionTypes = [
  { type: "hero", name: "Hero" }, { type: "categories", name: "Categories" }, { type: "featuredProducts", name: "Featured products" },
  { type: "products", name: "Product catalog" }, { type: "offer", name: "Offer" }, { type: "branches", name: "Branches" },
];

export function StorefrontEditor({ tenant, initial, products }: { tenant: NonNullable<SessionData["tenant"]>; initial: StorefrontData; products: ProductSummary[] }) {
  const router = useRouter();
  const [store, setStore] = useState(initial);
  const [dirty, setDirty] = useState(false);
  const [selectedId, setSelectedId] = useState(initial.sections[0]?.id || "");
  const [dragId, setDragId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const selected = store.sections.find((section) => section.id === selectedId);
  const publicUrl = `/store/${store.publishedSlug || store.slug}`;

  function setField<K extends keyof StorefrontData>(key: K, value: StorefrontData[K]) { setStore((current) => ({ ...current, [key]: value })); setDirty(true); }
  function setSection(id: string, patch: Partial<StorefrontSection>) { setField("sections", store.sections.map((section) => section.id === id ? { ...section, ...patch } : section)); }
  function move(id: string, targetIndex: number) {
    const from = store.sections.findIndex((section) => section.id === id);
    if (from < 0 || targetIndex < 0 || targetIndex >= store.sections.length || targetIndex === from) return;
    const next = [...store.sections]; const [item] = next.splice(from, 1); next.splice(targetIndex, 0, item); setField("sections", next);
  }
  function add(type: string) {
    const name = sectionTypes.find((item) => item.type === type)?.name || "Section";
    const id = `${type}-${crypto.randomUUID().slice(0, 8)}`;
    setField("sections", [...store.sections, { id, type, title: name, subtitle: "", visible: true }]); setSelectedId(id);
  }
  async function save(publish: boolean) {
    setBusy(true); setError(""); setMessage("");
    try {
      const payload = { slug: store.slug, heroTitle: store.heroTitle, tagline: store.tagline, theme: store.theme, primaryColor: store.primaryColor, deliveryEnabled: store.deliveryEnabled, pickupEnabled: store.pickupEnabled, sections: store.sections };
      await clientRequest(`/tenants/${tenant.id}/storefront`, { method: "PUT", body: JSON.stringify(payload) });
      if (publish) await clientRequest(`/tenants/${tenant.id}/storefront/publish`, { method: "POST" });
      setStore((current) => ({ ...current, status: publish ? "published" : current.status, publishedSlug: publish ? current.slug : current.publishedSlug })); setDirty(false); setMessage(publish ? "Storefront published." : "Draft saved."); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to save storefront."); }
    finally { setBusy(false); }
  }

  return <div className="page-stack"><div className="page-heading"><div><p className="page-kicker">Online presence</p><h1>Storefront builder</h1><p className="page-description">Compose your storefront from catalog-backed sections.</p></div><div className="heading-actions"><StatusBadge label={dirty ? "Unsaved changes" : store.status} tone={store.status === "published" ? "success" : "warning"} /><Button variant="secondary" onClick={() => save(false)} disabled={busy}><Save size={16} /> Save draft</Button><Button onClick={() => save(true)} disabled={busy}><Send size={16} /> Publish</Button></div></div>
    {message ? <Notice message={message} /> : null}{error ? <Notice message={error} tone="error" /> : null}
    <div className="builder-grid"><section className="surface builder-panel"><div className="surface-heading"><div><h2>Site settings</h2><p>Changes stay private until published</p></div></div><div className="builder-fields"><Input label="Website address" value={store.slug} onChange={(event) => setField("slug", event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} hint={`/store/${store.slug}`} /><Input label="Hero headline" value={store.heroTitle} onChange={(event) => setField("heroTitle", event.target.value)} /><Input label="Tagline" value={store.tagline} onChange={(event) => setField("tagline", event.target.value)} /><Select label="Theme" value={store.theme} onChange={(event) => setField("theme", event.target.value)}><option value="modern">Modern</option><option value="classic">Classic</option><option value="minimal">Minimal</option></Select><label className="color-field"><span>Accent color</span><input type="color" value={store.primaryColor} onChange={(event) => setField("primaryColor", event.target.value)} /><code>{store.primaryColor}</code></label><label className="check-field"><input type="checkbox" checked={store.deliveryEnabled} onChange={(event) => setField("deliveryEnabled", event.target.checked)} /> Delivery</label><label className="check-field"><input type="checkbox" checked={store.pickupEnabled} onChange={(event) => setField("pickupEnabled", event.target.checked)} /> Pickup</label></div><div className="surface-heading"><div><h2>Sections</h2><p>Drag to reorder, or use arrows</p></div></div><div className="builder-sections">{store.sections.map((section, index) => <div className={`builder-section ${selectedId === section.id ? "selected" : ""}`} key={section.id} draggable onDragStart={() => setDragId(section.id)} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); if (dragId) move(dragId, index); setDragId(null); }}><GripVertical size={15} /><button type="button" className="builder-section-name" onClick={() => setSelectedId(section.id)}>{section.title}<small>{sectionTypes.find((item) => item.type === section.type)?.name || section.type}</small></button><button type="button" className="icon-button" title="Move up" aria-label={`Move ${section.title} up`} disabled={index === 0} onClick={() => move(section.id, index - 1)}><ArrowUp size={14} /></button><button type="button" className="icon-button" title="Move down" aria-label={`Move ${section.title} down`} disabled={index === store.sections.length - 1} onClick={() => move(section.id, index + 1)}><ArrowDown size={14} /></button><button type="button" className="icon-button" title={section.visible ? "Hide section" : "Show section"} aria-label={section.visible ? `Hide ${section.title}` : `Show ${section.title}`} onClick={() => setSection(section.id, { visible: !section.visible })}>{section.visible ? <Eye size={15} /> : <EyeOff size={15} />}</button></div>)}<Select label="Add a section" value="" onChange={(event) => { if (event.target.value) add(event.target.value); }}><option value="">Choose section type</option>{sectionTypes.map((item) => <option key={item.type} value={item.type}>{item.name}</option>)}</Select></div>{selected ? <div className="builder-fields selected-fields"><div className="form-section-title">Edit section</div><Input label="Heading" value={selected.title} onChange={(event) => setSection(selected.id, { title: event.target.value })} /><Input label="Supporting text" value={selected.subtitle || ""} onChange={(event) => setSection(selected.id, { subtitle: event.target.value })} /><button className="table-action danger-action" type="button" onClick={() => { setField("sections", store.sections.filter((section) => section.id !== selected.id)); setSelectedId(""); }}><Trash2 size={14} /> Remove section</button></div> : null}</section>
      <section className="surface builder-preview"><div className="surface-heading"><div><h2>Live preview</h2><p>{products.length} products synced from POS</p></div>{store.status === "published" ? <Link className="text-action" href={publicUrl} target="_blank"><ExternalLink size={14} /> Open website</Link> : null}</div><div className="preview-site" style={{ ["--store-accent" as string]: store.primaryColor }}><div className="preview-nav"><strong>{tenant.name}</strong><span>Shop all products</span></div>{store.sections.filter((section) => section.visible).map((section) => <div className={`preview-section preview-${section.type}`} key={section.id}>{section.type === "hero" ? <><span>Welcome to {tenant.name}</span><h2>{store.heroTitle}</h2><p>{store.tagline}</p></> : <><h3>{section.title}</h3>{section.subtitle ? <p>{section.subtitle}</p> : null}{["products", "featuredProducts"].includes(section.type) ? <div className="preview-products">{products.filter((item) => section.type !== "featuredProducts" || item.featured).slice(0, 4).map((product) => <div key={product.id}>{product.imageUrl ? <ProductImage src={product.imageUrl} alt="" width={320} height={220} /> : <span className="preview-placeholder" />}<strong>{product.name}</strong><small>{formatMoney(product.salePrice)}</small></div>)}</div> : section.type === "categories" ? <div className="preview-categories">{[...new Set(products.map((item) => item.category))].slice(0, 6).map((category) => <span key={category}>{category}</span>)}</div> : section.type === "branches" ? <div className="preview-categories">{tenant.branches.map((branch) => <span key={branch.id}>{branch.name}</span>)}</div> : null}</>}</div>)}</div></section></div></div>;
}
