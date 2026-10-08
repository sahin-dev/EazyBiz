// @ts-check

import { Button, Card, CustomerSelector, PaymentSelector, ProductSelector } from "../../components/ui.js";
import { escapeHtml, formatMoney, sumBy } from "../../utils/format.js";

/**
 * @param {import('../../services/business-os-repository.js').BusinessOSRepository} repo
 */
export function renderPOS(repo) {
  const tenant = repo.currentTenant();
  const products = repo.tenantProducts();
  const customers = repo.tenantCustomers();
  const cartLines = repo.getState().cart.items.flatMap((item) => {
    const product = products.find((candidate) => candidate.id === item.productId);
    return product ? [{ product, quantity: item.quantity }] : [];
  });
  const subtotal = sumBy(cartLines, (line) => line.product.salePrice * line.quantity);
  const serviceCharge = subtotal * (tenant.settings.serviceChargeRate / 100);
  const vat = subtotal * (tenant.settings.vatRate / 100);
  const total = subtotal + serviceCharge + vat;

  return `
    <div class="grid pos-layout">
      ${Card({
        title: `${tenant.name} POS`,
        description: "Fast sale flow with tenant isolation, module-aware payments, offline queue, and stock protection.",
        action: `<span class="chip ${navigator.onLine ? "active" : "warn"}">${navigator.onLine ? "Online" : "Offline"}</span>`,
        body: `
          <div class="filter-row">
            <input type="search" aria-label="Search products" placeholder="Search product, SKU, barcode, medicine, menu item..." data-action="noop" />
            ${Button({ label: "Scan barcode", variant: "secondary", action: 'data-action="toast" data-message="Barcode scanner interface is ready for device integration."' })}
          </div>
          ${ProductSelector({ products, action: "add-cart" })}
        `,
      })}

      <article class="card cart">
        <div class="card-header">
          <div>
            <h2>Current sale</h2>
            <p>F1 search, F2 customer, F5 payment, ESC cancel.</p>
          </div>
          ${Button({ label: "Clear", variant: "secondary", action: 'data-action="clear-cart"' })}
        </div>
        <form data-form="checkout">
          <div class="cart-lines">
            ${
              cartLines.length
                ? cartLines
                    .map(
                      (line) => `
                        <div class="cart-line">
                          <div>
                            <strong>${escapeHtml(line.product.name)}</strong>
                            <div class="muted">${formatMoney(line.product.salePrice)} x ${line.quantity}</div>
                          </div>
                          <div class="qty-controls">
                            <button type="button" data-action="cart-qty" data-product-id="${line.product.id}" data-qty="${line.quantity - 1}">-</button>
                            <strong>${line.quantity}</strong>
                            <button type="button" data-action="cart-qty" data-product-id="${line.product.id}" data-qty="${line.quantity + 1}">+</button>
                          </div>
                        </div>
                      `,
                    )
                    .join("")
                : `<div class="empty-state"><strong>No items in cart</strong><p>Add products from the left to start selling.</p></div>`
            }
          </div>
          <div class="cart-footer">
            ${CustomerSelector({ customers, selectedId: repo.getState().cart.customerId })}
            ${PaymentSelector({ methods: tenant.settings.paymentMethods })}
            <div class="total-row"><span>Subtotal</span><strong>${formatMoney(subtotal)}</strong></div>
            <div class="total-row"><span>Service charge</span><strong>${formatMoney(serviceCharge)}</strong></div>
            <div class="total-row"><span>VAT/tax</span><strong>${formatMoney(vat)}</strong></div>
            <div class="total-row grand"><span>Total</span><strong>${formatMoney(total)}</strong></div>
            ${Button({ label: "Complete sale", type: "submit", attrs: cartLines.length ? "" : "disabled" })}
          </div>
        </form>
      </article>
    </div>
  `;
}
