"use client";

import { Check, MapPin, Minus, Plus, Search, ShoppingBag, X } from "lucide-react";
import { type FormEvent, useMemo, useState } from "react";
import { roundMoney } from "@businessos/domain";
import { formatMoney } from "@/lib/format";
import { ProductImage } from "@/components/ui/product-image";

export interface PublicStoreData {
  slug: string;
  heroTitle: string;
  tagline: string;
  theme: string;
  primaryColor: string;
  deliveryEnabled: boolean;
  pickupEnabled: boolean;
  sections: Array<{ id: string; type: string; title: string; subtitle?: string; visible: boolean }>;
  tenant: { name: string; phone: string; businessType: string; vatRate: number; serviceRate: number; branches: Array<{ id: string; name: string; address: string }>; products: Array<{ id: string; name: string; sku: string; imageUrl: string | null; category: string; salePrice: number; discountPrice: number | null; unit: string; stock: number; featured: boolean; inventoryBalances: Array<{ branchId: string; quantity: number }> }> };
}

function price(product: PublicStoreData["tenant"]["products"][number]) { const discounted = Number(product.discountPrice); return discounted > 0 && discounted < Number(product.salePrice) ? discounted : Number(product.salePrice); }

export function PublicStore({ store }: { store: PublicStoreData }) {
  const [branchId, setBranchId] = useState(store.tenant.branches[0]?.id || "");
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [fulfillment, setFulfillment] = useState<"delivery" | "pickup">(store.deliveryEnabled ? "delivery" : "pickup");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const categories = ["All", ...new Set(store.tenant.products.map((product) => product.category))];
  const lines = useMemo(() => store.tenant.products.filter((product) => cart[product.id] > 0).map((product) => ({ product, quantity: cart[product.id] })), [cart, store.tenant.products]);
  const subtotal = roundMoney(lines.reduce((sum, line) => sum + roundMoney(price(line.product) * line.quantity), 0));
  const total = roundMoney(subtotal + roundMoney(subtotal * Number(store.tenant.vatRate) / 100) + roundMoney(subtotal * Number(store.tenant.serviceRate) / 100));
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);
  const filtered = store.tenant.products.filter((product) => (category === "All" || product.category === category) && product.name.toLowerCase().includes(query.toLowerCase()));
  const stock = (product: PublicStoreData["tenant"]["products"][number]) => Number(product.inventoryBalances.find((balance) => balance.branchId === branchId)?.quantity || 0);
  function change(product: PublicStoreData["tenant"]["products"][number], delta: number) { setCart((current) => ({ ...current, [product.id]: Math.max(0, Math.min(stock(product), (current[product.id] || 0) + delta)) })); }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setBusy(true);
    try {
      const response = await fetch(`/api/storefront/${encodeURIComponent(store.slug)}/orders`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ branchId, customerName: name, phone, fulfillment, address: fulfillment === "delivery" ? address : undefined, note, items: lines.map((line) => ({ productId: line.product.id, quantity: line.quantity })) }) });
      const result = await response.json() as { orderNo?: string; message?: string | string[] };
      if (!response.ok) throw new Error(Array.isArray(result.message) ? result.message.join(" ") : result.message || "Unable to place your order.");
      setConfirmation(result.orderNo || "Order placed"); setCart({}); setOpen(false);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to place your order."); }
    finally { setBusy(false); }
  }

  const productTiles = (products: PublicStoreData["tenant"]["products"]) => <div className="store-products">{products.map((product) => <article className="store-product" key={product.id}>{product.imageUrl ? <ProductImage src={product.imageUrl} alt={product.name} width={560} height={380} /> : <div className="store-product-placeholder"><ShoppingBag size={31} /></div>}<div className="store-product-body"><span>{product.category}</span><h3>{product.name}</h3><div><strong>{formatMoney(price(product))}</strong><button type="button" aria-label={`Add ${product.name}`} disabled={stock(product) <= (cart[product.id] || 0)} onClick={() => change(product, 1)}><Plus size={17} /></button></div><small>{stock(product) > 0 ? `${stock(product)} ${product.unit} available` : "Out of stock"}</small></div></article>)}</div>;

  return <div className={`public-store theme-${store.theme}`} style={{ ["--store-accent" as string]: store.primaryColor }}><header className="store-header"><a href="#top" className="store-brand">{store.tenant.name}</a><nav><a href="#catalog">Products</a><a href="#locations">Locations</a></nav><button className="store-cart-button" type="button" onClick={() => setOpen(true)} aria-label={`Open cart, ${count} items`}><ShoppingBag size={18} /><span>Cart</span><b>{count}</b></button></header>
    {confirmation ? <div className="store-confirmation" role="status"><Check size={18} />Order {confirmation} received. The store will contact you to confirm delivery or pickup.<button type="button" aria-label="Dismiss" onClick={() => setConfirmation("")}><X size={16} /></button></div> : null}
    <main id="top">{store.sections.filter((section) => section.visible).map((section) => <section className={`store-band store-band-${section.type}`} key={section.id} id={section.type === "products" || section.type === "featuredProducts" ? "catalog" : section.type === "branches" ? "locations" : undefined}><div className="store-container">{section.type === "hero" ? <div className="store-hero-content"><span>{store.tenant.businessType}</span><h1>{store.heroTitle}</h1><p>{store.tagline}</p><a href="#catalog" className="store-primary-link">Shop products <Plus size={16} /></a></div> : <><div className="store-section-heading"><div><h2>{section.title}</h2>{section.subtitle ? <p>{section.subtitle}</p> : null}</div></div>{section.type === "categories" ? <div className="store-category-grid">{categories.slice(1).map((item) => <button type="button" key={item} onClick={() => { setCategory(item); document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" }); }}>{item}<span>Browse</span></button>)}</div> : null}{section.type === "featuredProducts" ? productTiles(store.tenant.products.filter((product) => product.featured).slice(0, 8)) : null}{section.type === "products" ? <><div className="store-catalog-tools"><label><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products" aria-label="Search products" /></label><select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Product category">{categories.map((item) => <option key={item}>{item}</option>)}</select><select value={branchId} onChange={(event) => { setBranchId(event.target.value); setCart({}); }} aria-label="Shopping branch">{store.tenant.branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select></div>{productTiles(filtered)}</> : null}{section.type === "offer" ? <div className="store-offer">{section.subtitle || "Explore our latest products."}</div> : null}{section.type === "branches" ? <div className="store-locations">{store.tenant.branches.map((branch) => <div key={branch.id}><MapPin size={20} /><strong>{branch.name}</strong><span>{branch.address}</span></div>)}</div> : null}</>}</div></section>)}</main><footer className="store-footer"><strong>{store.tenant.name}</strong><span>{store.tenant.phone}</span><span>Powered by BusinessOS</span></footer>
    {open ? <div className="drawer-backdrop" role="presentation" onMouseDown={() => setOpen(false)}><aside className="drawer store-cart" role="dialog" aria-modal="true" aria-label="Your cart" onMouseDown={(event) => event.stopPropagation()}><header className="drawer-header"><h2>Your cart ({count})</h2><button type="button" className="icon-button" aria-label="Close cart" onClick={() => setOpen(false)}><X size={19} /></button></header><div className="drawer-content"><div className="store-cart-lines">{lines.map(({ product, quantity }) => <div key={product.id}><span><strong>{product.name}</strong><small>{formatMoney(price(product))}</small></span><div><button type="button" aria-label={`Remove one ${product.name}`} onClick={() => change(product, -1)}><Minus size={14} /></button><b>{quantity}</b><button type="button" aria-label={`Add one ${product.name}`} onClick={() => change(product, 1)}><Plus size={14} /></button></div></div>)}{!lines.length ? <div className="store-cart-empty">Your cart is empty.</div> : null}</div>{lines.length ? <form className="drawer-form store-checkout" onSubmit={submit}><div className="purchase-total"><span>Subtotal</span><strong>{formatMoney(subtotal)}</strong></div><div className="purchase-total"><span>Total including taxes</span><strong>{formatMoney(total)}</strong></div><p>Pay on delivery or pickup. Your order remains pending until the store confirms it.</p>{error ? <div className="notice error" role="alert">{error}</div> : null}<label className="form-field"><span>Full name</span><input value={name} onChange={(event) => setName(event.target.value)} minLength={2} required /></label><label className="form-field"><span>Mobile number</span><input value={phone} onChange={(event) => setPhone(event.target.value)} pattern="(?:\+?88)?01[3-9][0-9]{8}" placeholder="01XXXXXXXXX" required /></label><label className="form-field"><span>Fulfillment</span><select value={fulfillment} onChange={(event) => setFulfillment(event.target.value as "delivery" | "pickup")}>{store.deliveryEnabled ? <option value="delivery">Delivery</option> : null}{store.pickupEnabled ? <option value="pickup">Pickup</option> : null}</select></label>{fulfillment === "delivery" ? <label className="form-field"><span>Delivery address</span><input value={address} onChange={(event) => setAddress(event.target.value)} required /></label> : null}<label className="form-field"><span>Order note</span><input value={note} onChange={(event) => setNote(event.target.value)} /></label><button className="button primary" disabled={busy || !branchId}>{busy ? "Placing order..." : `Place order / ${formatMoney(total)}`}</button></form> : null}</div></aside></div> : null}
  </div>;
}
