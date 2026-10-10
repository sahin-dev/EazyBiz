"use client";

import { roundMoney, type PaymentMethod, type SaleProduct } from "@businessos/domain";
import { Barcode, Check, Package, Plus, Printer, RefreshCw, Search, ShoppingBag, Trash2, Usb } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CustomerRecord, InventoryAvailability, RestaurantTableRecord, SessionData } from "@/lib/types";
import { clientRequest } from "@/lib/client-api";
import { formatMoney } from "@/lib/format";
import { ProductImage } from "@/components/ui/product-image";

type PosTenant = NonNullable<SessionData["tenant"]>;
type StockBalance = InventoryAvailability[number];
type ReceiptWidth = "58mm" | "80mm";
type PosSettings = { autoPrint: boolean; width: ReceiptWidth; printerName: string };
type DeviceStatus = { browserPrint: boolean; usb: boolean; serial: boolean; pairedUsb: number; pairedSerial: number; checkedAt: string };
type CreatedOrder = { id: string; orderNo: string; createdAt: string };
type ReceiptData = {
  orderNo: string;
  createdAt: string;
  tenantName: string;
  branchName: string;
  cashierName: string;
  customerName: string;
  paymentMethod: PaymentMethod;
  subtotal: number;
  taxAmount: number;
  serviceCharge: number;
  discount: number;
  total: number;
  paidAmount: number;
  dueAmount: number;
  lines: Array<{ name: string; quantity: number; unitPrice: number; total: number }>;
};

const paymentMethods: PaymentMethod[] = [
  "Cash",
  "Card",
  "bKash",
  "Nagad",
  "Rocket",
  "Bangla QR",
  "Bank transfer",
  "Manual",
  "Due",
];

export function PosCheckout({
  tenant,
  cashierName,
  userBranchId,
  products,
  customers,
  balances,
  tables,
}: {
  tenant: PosTenant;
  cashierName: string;
  userBranchId: string | null;
  products: SaleProduct[];
  customers: CustomerRecord[];
  balances: StockBalance[];
  tables: RestaurantTableRecord[];
}) {
  const router = useRouter();
  const settingsKey = `businessos.pos.${tenant.id}.settings`;
  const availableBranches = userBranchId ? tenant.branches.filter((branch) => branch.id === userBranchId) : tenant.branches;
  const [branchId, setBranchId] = useState(availableBranches[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All items");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [customerId, setCustomerId] = useState("");
  const [saleMode, setSaleMode] = useState<"counter" | "table">("counter");
  const [tableId, setTableId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Cash");
  const [discount, setDiscount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [posSettings, setPosSettings] = useState<PosSettings>({ autoPrint: true, width: tenant.receiptWidth === "58mm" ? "58mm" : "80mm", printerName: "Default receipt printer" });
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus>({ browserPrint: false, usb: false, serial: false, pairedUsb: 0, pairedSerial: 0, checkedAt: "" });
  const [deviceMessage, setDeviceMessage] = useState("");
  const [lastReceipt, setLastReceipt] = useState<ReceiptData | null>(null);
  const checkoutAttempt = useRef<{ body: string; key: string } | null>(null);

  const stockByProduct = useMemo(
    () => new Map(balances.filter((balance) => balance.branchId === branchId).map((balance) => [balance.productId, Number(balance.quantity)])),
    [balances, branchId],
  );
  const matchingProducts = products.filter((product) => {
    const term = query.trim().toLowerCase();
    return (category === "All items" || product.category === category) && (!term || `${product.name} ${product.sku} ${product.category} ${product.barcode ?? ""}`.toLowerCase().includes(term));
  });
  const categories = ["All items", ...new Set(products.map((product) => product.category))];
  const availableTables = tables.filter((table) => table.branchId === branchId && table.status === "available");
  const lines = products.flatMap((product) => {
    const quantity = quantities[product.id] ?? 0;
    return quantity > 0 ? [{ product, quantity }] : [];
  });
  const subtotal = roundMoney(lines.reduce((sum, line) => sum + roundMoney(effectivePrice(line.product) * line.quantity), 0));
  const taxAmount = roundMoney(subtotal * (Number(tenant.vatRate) / 100));
  const serviceCharge = roundMoney(subtotal * (Number(tenant.serviceRate) / 100));
  const total = Math.max(0, roundMoney(subtotal + taxAmount + serviceCharge - discount));
  const amountPaid = saleMode === "table" ? 0 : paymentMethod === "Due" ? clamp(paidAmount, 0, total) : total;
  const outstanding = Math.max(0, roundMoney(total - amountPaid));

  const detectPosDevices = useCallback(async (showMessage = true) => {
    const nav = navigator as Navigator & {
      usb?: { getDevices?: () => Promise<Array<unknown>> };
      serial?: { getPorts?: () => Promise<Array<unknown>> };
    };
    const [usbDevices, serialPorts] = await Promise.all([
      nav.usb?.getDevices ? nav.usb.getDevices().catch(() => []) : Promise.resolve([]),
      nav.serial?.getPorts ? nav.serial.getPorts().catch(() => []) : Promise.resolve([]),
    ]);
    const status = {
      browserPrint: typeof window.print === "function",
      usb: Boolean(nav.usb),
      serial: Boolean(nav.serial),
      pairedUsb: usbDevices.length,
      pairedSerial: serialPorts.length,
      checkedAt: new Date().toLocaleTimeString(),
    };
    setDeviceStatus(status);
    if (showMessage) setDeviceMessage(status.pairedUsb + status.pairedSerial > 0 ? "POS device profile detected." : "Browser print is ready. No paired USB or serial device found.");
  }, []);

  useEffect(() => {
    const stored = window.localStorage.getItem(settingsKey);
    if (stored) {
      try {
        setPosSettings((current) => ({ ...current, ...JSON.parse(stored) }));
      } catch {
        window.localStorage.removeItem(settingsKey);
      }
    }
    void detectPosDevices(false);
  }, [detectPosDevices, settingsKey]);

  useEffect(() => {
    window.localStorage.setItem(settingsKey, JSON.stringify(posSettings));
  }, [posSettings, settingsKey]);

  function setQuantity(product: SaleProduct, quantity: number) {
    const available = stockByProduct.get(product.id) ?? 0;
    if (quantity > available) return;
    setQuantities((current) => {
      const next = { ...current };
      if (quantity <= 0) delete next[product.id];
      else next[product.id] = quantity;
      return next;
    });
  }

  async function pairPosDevice() {
    setDeviceMessage("");
    const nav = navigator as Navigator & {
      usb?: { requestDevice?: (options: { filters: Array<Record<string, unknown>> }) => Promise<unknown> };
      serial?: { requestPort?: () => Promise<unknown> };
    };
    try {
      if (nav.serial?.requestPort) {
        await nav.serial.requestPort();
        setDeviceMessage("Serial POS device paired.");
      } else if (nav.usb?.requestDevice) {
        await nav.usb.requestDevice({ filters: [] });
        setDeviceMessage("USB POS device paired.");
      } else {
        setDeviceMessage("This browser supports receipt printing through the system print dialog.");
      }
    } catch {
      setDeviceMessage("Device pairing was cancelled.");
    } finally {
      await detectPosDevices(false);
    }
  }

  function printReceipt() {
    if (!lastReceipt) return;
    window.setTimeout(() => window.print(), 80);
  }

  async function completeSale() {
    setError("");
    setMessage("");
    if (lines.length === 0) {
      setError("Add at least one product before completing the sale.");
      return;
    }
    if (saleMode === "table" && !tableId) { setError("Select an available table."); return; }
    if (outstanding > 0 && !customerId && saleMode !== "table") {
      setError("Select a customer to record a due balance.");
      return;
    }

    setSubmitting(true);
    try {
      const body = JSON.stringify({
        branchId,
        customerId: customerId || undefined,
        source: "pos",
        orderType: saleMode === "table" ? "dine_in" : "counter",
        tableId: saleMode === "table" ? tableId : undefined,
        paymentMethod: saleMode === "table" ? "Due" : paymentMethod,
        discount,
        paidAmount: amountPaid,
        items: lines.map(({ product, quantity }) => ({ productId: product.id, quantity })),
      });
      if (checkoutAttempt.current?.body !== body) checkoutAttempt.current = { body, key: crypto.randomUUID() };
      const order = await clientRequest<CreatedOrder>(`/tenants/${tenant.id}/orders`, {
        method: "POST",
        headers: { "idempotency-key": checkoutAttempt.current.key },
        body,
      });
      checkoutAttempt.current = null;
      const receipt: ReceiptData = {
        orderNo: order.orderNo,
        createdAt: order.createdAt,
        tenantName: tenant.name,
        branchName: availableBranches.find((branch) => branch.id === branchId)?.name ?? "Main branch",
        cashierName,
        customerName: customers.find((customer) => customer.id === customerId)?.name ?? "Walk-in customer",
        paymentMethod: saleMode === "table" ? "Due" : paymentMethod,
        subtotal,
        taxAmount,
        serviceCharge,
        discount,
        total,
        paidAmount: amountPaid,
        dueAmount: outstanding,
        lines: lines.map(({ product, quantity }) => ({
          name: product.name,
          quantity,
          unitPrice: effectivePrice(product),
          total: roundMoney(effectivePrice(product) * quantity),
        })),
      };
      setLastReceipt(receipt);
      setQuantities({});
      setCustomerId("");
      setTableId("");
      setDiscount(0);
      setPaidAmount(0);
      setMessage(saleMode === "table" ? "Table order sent to kitchen. Settle it from Tables after service." : "Sale completed. Stock and order records have been updated.");
      if (saleMode === "counter" && posSettings.autoPrint) {
        window.setTimeout(() => window.print(), 120);
      }
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The sale could not be completed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="topbar">
        <div>
          <p className="eyebrow">Fast checkout · {tenant.name}</p>
          <h1>Point of Sale</h1>
        </div>
        <span className="chip active">{tenant.businessType}</span>
      </div>

      {message ? <p className="notice success" role="status">{message}</p> : null}
      {error ? <p className="notice error" role="alert">{error}</p> : null}

      <div className="pos-workspace">
        <section className="card">
          <div className="card-header pos-controls">
            <div>
              <h2>Product catalog</h2>
              <p>{products.length} products available</p>
            </div>
            <label className="pos-field">
              <span>Branch</span>
              <select value={branchId} onChange={(event) => { setBranchId(event.target.value); setTableId(""); setQuantities({}); }} disabled={availableBranches.length < 2}>
                {availableBranches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
              </select>
            </label>
          </div>
          <div className="pos-search">
            <label className="pos-searchbox"><Search size={18} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by product, SKU or scan barcode" aria-label="Search or scan products" /><Barcode size={19} /></label>
            <div className="pos-categories" role="group" aria-label="Product categories">{categories.map((option) => <button type="button" key={option} className={`category-tab ${option === category ? "selected" : ""}`} onClick={() => setCategory(option)}>{option}</button>)}</div>
          </div>
          <div className="product-grid">
            {matchingProducts.map((product) => {
              const stock = stockByProduct.get(product.id) ?? 0;
              return (
                <button
                  className="product-button"
                  key={product.id}
                  type="button"
                  disabled={stock <= (quantities[product.id] ?? 0)}
                  onClick={() => setQuantity(product, (quantities[product.id] ?? 0) + 1)}
                >
                  {product.imageUrl ? <ProductImage className="product-photo" src={product.imageUrl} alt={product.name} /> : <span className="product-photo product-fallback"><Package size={28} /></span>}
                  <strong>{product.name}</strong>
                  <p className="muted">{product.category} · {stock} {product.unit} available</p>
                  <span className="product-price">{formatMoney(effectivePrice(product))}<Plus size={14} /></span>
                </button>
              );
            })}
            {matchingProducts.length === 0 ? <div className="pos-no-results"><Search size={24} /><strong>No matching products</strong><span>Try another product name or barcode.</span></div> : null}
          </div>
        </section>

        <section className="card pos-cart">
          <div className="card-header">
            <div>
              <h2>Current sale</h2>
              <p>{lines.length} product{lines.length === 1 ? "" : "s"}</p>
            </div>
            <button className="icon-button" title="Clear cart" aria-label="Clear cart" type="button" onClick={() => setQuantities({})}><Trash2 size={17} /></button>
          </div>
          <div className="cart-lines">
            {lines.length ? lines.map(({ product, quantity }) => (
              <div className="cart-line" key={product.id}>
                <div>
                  <strong>{product.name}</strong>
                  <p className="muted">{formatMoney(effectivePrice(product))} × {quantity}</p>
                </div>
                <div className="qty-controls">
                  <button type="button" aria-label={`Remove one ${product.name}`} onClick={() => setQuantity(product, quantity - 1)}>−</button>
                  <strong>{quantity}</strong>
                  <button type="button" aria-label={`Add one ${product.name}`} disabled={quantity >= (stockByProduct.get(product.id) ?? 0)} onClick={() => setQuantity(product, quantity + 1)}>+</button>
                </div>
              </div>
            )) : <div className="pos-empty-cart"><ShoppingBag size={29} /><strong>Cart is empty</strong><span>Select products to start a new sale.</span></div>}
          </div>

          <div className="pos-checkout-fields">
            {tables.length > 0 || tenant.enabledModules.includes("restaurantTables") ? <div className="pos-mode" role="group" aria-label="Sale type"><button type="button" className={saleMode === "counter" ? "selected" : ""} onClick={() => { setSaleMode("counter"); setTableId(""); }}>Counter</button><button type="button" className={saleMode === "table" ? "selected" : ""} onClick={() => setSaleMode("table")}>Dine-in table</button></div> : null}
            {saleMode === "table" ? <label className="pos-field"><span>Table</span><select value={tableId} onChange={(event) => setTableId(event.target.value)}><option value="">Select available table</option>{availableTables.map((table) => <option key={table.id} value={table.id}>{table.name} / {table.capacity} seats</option>)}</select>{availableTables.length === 0 ? <small>No available tables at this branch.</small> : null}</label> : null}
            <label className="pos-field">
              <span>Customer</span>
              <select value={customerId} onChange={(event) => setCustomerId(event.target.value)}>
                <option value="">Walk-in customer</option>
                {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name} · {customer.phone}</option>)}
              </select>
            </label>
            {saleMode === "counter" ? <label className="pos-field">
              <span>Payment method</span>
              <select value={paymentMethod} onChange={(event) => {
                const method = paymentMethods.find((candidate) => candidate === event.target.value) ?? "Cash";
                setPaymentMethod(method);
                setPaidAmount(method === "Due" ? 0 : total);
              }}>
                {paymentMethods.map((method) => <option key={method} value={method}>{method}</option>)}
              </select>
            </label> : null}
            <label className="pos-field">
              <span>Discount (BDT)</span>
              <input type="number" min="0" max={subtotal} step="0.01" value={discount} onChange={(event) => setDiscount(clamp(Number(event.target.value), 0, subtotal))} />
            </label>
            {saleMode === "counter" && paymentMethod === "Due" ? (
              <label className="pos-field">
                <span>Paid now (BDT)</span>
                <input type="number" min="0" max={total} step="0.01" value={amountPaid} onChange={(event) => setPaidAmount(clamp(Number(event.target.value), 0, total))} />
              </label>
            ) : null}
          </div>

          <div className="pos-totals">
            <div><span>Subtotal</span><strong>{formatMoney(subtotal)}</strong></div>
            <div><span>VAT / tax</span><strong>{formatMoney(taxAmount)}</strong></div>
            {serviceCharge > 0 ? <div><span>Service charge</span><strong>{formatMoney(serviceCharge)}</strong></div> : null}
            <div><span>Discount</span><strong>−{formatMoney(discount)}</strong></div>
            <div className="grand-total"><span>Total</span><strong>{formatMoney(total)}</strong></div>
            {outstanding > 0 ? <div><span>Due</span><strong>{formatMoney(outstanding)}</strong></div> : null}
            <button className="button primary checkout-button" type="button" disabled={submitting || !branchId || lines.length === 0} onClick={completeSale}>
              {submitting ? "Saving order..." : <><Check size={18} /> {saleMode === "table" ? "Send to kitchen" : "Complete sale"} <span>{formatMoney(total)}</span></>}
            </button>
          </div>

          <div className="pos-device-panel">
            <div className="pos-device-head">
              <span><Printer size={17} /><strong>POS terminal</strong></span>
              <span className={`device-pill ${deviceStatus.browserPrint ? "ready" : ""}`}>{deviceStatus.browserPrint ? "Print ready" : "Print unavailable"}</span>
            </div>
            <div className="device-grid">
              <label className="pos-field">
                <span>Receipt width</span>
                <select value={posSettings.width} onChange={(event) => setPosSettings((current) => ({ ...current, width: event.target.value as ReceiptWidth }))}>
                  <option value="80mm">80mm thermal</option>
                  <option value="58mm">58mm thermal</option>
                </select>
              </label>
              <label className="pos-field">
                <span>Printer profile</span>
                <input value={posSettings.printerName} onChange={(event) => setPosSettings((current) => ({ ...current, printerName: event.target.value }))} />
              </label>
            </div>
            <label className="check-field">
              <input type="checkbox" checked={posSettings.autoPrint} onChange={(event) => setPosSettings((current) => ({ ...current, autoPrint: event.target.checked }))} />
              Print receipt after checkout
            </label>
            <div className="device-actions">
              <button className="button secondary" type="button" onClick={() => detectPosDevices(true)}><RefreshCw size={15} /> Scan</button>
              <button className="button secondary" type="button" onClick={pairPosDevice}><Usb size={15} /> Pair</button>
              <button className="button secondary" type="button" disabled={!lastReceipt} onClick={printReceipt}><Printer size={15} /> Reprint</button>
            </div>
            <div className="device-status">
              <span>USB {deviceStatus.usb ? "supported" : "blocked"}</span>
              <span>Serial {deviceStatus.serial ? "supported" : "blocked"}</span>
              <span>{deviceStatus.pairedUsb + deviceStatus.pairedSerial} paired</span>
            </div>
            {deviceMessage ? <p className="device-message">{deviceMessage}</p> : null}
          </div>
        </section>
      </div>
      <ReceiptPrintArea receipt={lastReceipt} width={posSettings.width} />
    </>
  );
}

function ReceiptPrintArea({ receipt, width }: { receipt: ReceiptData | null; width: ReceiptWidth }) {
  if (!receipt) return null;
  return (
    <div className={`receipt-print-area receipt-${width}`}>
      <div className="receipt-header">
        <strong>{receipt.tenantName}</strong>
        <span>{receipt.branchName}</span>
        <span>Bangladesh</span>
      </div>
      <div className="receipt-rule" />
      <div className="receipt-meta">
        <span>Receipt</span><strong>{receipt.orderNo}</strong>
        <span>Date</span><strong>{new Date(receipt.createdAt).toLocaleString()}</strong>
        <span>Cashier</span><strong>{receipt.cashierName}</strong>
        <span>Customer</span><strong>{receipt.customerName}</strong>
      </div>
      <div className="receipt-rule" />
      <table className="receipt-table">
        <thead><tr><th>Item</th><th>Qty</th><th>Total</th></tr></thead>
        <tbody>{receipt.lines.map((line) => <tr key={`${line.name}-${line.quantity}-${line.total}`}><td><strong>{line.name}</strong><span>{formatMoney(line.unitPrice)}</span></td><td>{line.quantity}</td><td>{formatMoney(line.total)}</td></tr>)}</tbody>
      </table>
      <div className="receipt-rule" />
      <div className="receipt-totals">
        <span>Subtotal</span><strong>{formatMoney(receipt.subtotal)}</strong>
        <span>VAT / tax</span><strong>{formatMoney(receipt.taxAmount)}</strong>
        {receipt.serviceCharge > 0 ? <><span>Service charge</span><strong>{formatMoney(receipt.serviceCharge)}</strong></> : null}
        <span>Discount</span><strong>-{formatMoney(receipt.discount)}</strong>
        <span className="receipt-grand">Total</span><strong className="receipt-grand">{formatMoney(receipt.total)}</strong>
        <span>Paid by {receipt.paymentMethod}</span><strong>{formatMoney(receipt.paidAmount)}</strong>
        {receipt.dueAmount > 0 ? <><span>Due</span><strong>{formatMoney(receipt.dueAmount)}</strong></> : null}
      </div>
      <div className="receipt-rule" />
      <div className="receipt-footer">
        <strong>Thank you</strong>
        <span>Powered by BusinessOS Bangladesh</span>
      </div>
    </div>
  );
}

function effectivePrice(product: SaleProduct) {
  const discountPrice = Number(product.discountPrice);
  return discountPrice > 0 && discountPrice < Number(product.salePrice) ? discountPrice : Number(product.salePrice);
}

function clamp(value: number, min: number, max: number) {
  return Number.isFinite(value) ? Math.min(Math.max(value, min), max) : min;
}
