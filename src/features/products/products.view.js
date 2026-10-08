// @ts-check

import { businessTypes } from "../../config/business-types.js";
import { Button, Card, DataTable, Drawer, Input, Select, StatusBadge } from "../../components/ui.js";
import { formatMoney } from "../../utils/format.js";

/**
 * @param {import('../../services/business-os-repository.js').BusinessOSRepository} repo
 */
export function renderProducts(repo) {
  const tenant = repo.currentTenant();
  const config = businessTypes[tenant.businessType];
  const products = repo.tenantProducts();

  return Card({
    title: "Products",
    description: "Universal catalog with business-specific attributes from configuration.",
    action: Button({ label: "Add product", action: 'data-action="open-product-drawer"' }),
    body: DataTable({
      rows: products,
      emptyTitle: "No products yet",
      emptyAction: Button({ label: "Add first product", action: 'data-action="open-product-drawer"' }),
      columns: [
        { key: "name", label: "Product" },
        { key: "sku", label: "SKU" },
        { key: "category", label: "Category" },
        { key: "salePrice", label: "Price", render: (product) => formatMoney(product.salePrice) },
        { key: "stock", label: "Stock", render: (product) => `${product.stock} ${product.unit}` },
        { key: "active", label: "Status", render: (product) => StatusBadge({ label: product.active ? "Active" : "Inactive", tone: product.active ? "active" : "warn" }) },
      ],
    }) + `
      <div class="card-header">
        <div>
          <h2>${config.name} fields</h2>
          <p>These fields come from the business-type configuration, not hardcoded screens.</p>
        </div>
      </div>
      <div class="section-list">
        ${config.productAttributes.map((attribute) => `<div class="draggable-section"><strong>${attribute.label}</strong>${StatusBadge({ label: attribute.type, tone: attribute.sensitive ? "warn" : "active" })}</div>`).join("")}
      </div>
    `,
  });
}

/**
 * @param {import('../../services/business-os-repository.js').BusinessOSRepository} repo
 */
export function productDrawer(repo) {
  const tenant = repo.currentTenant();
  const config = businessTypes[tenant.businessType];
  return Drawer({
    id: "productDrawer",
    title: "Add product",
    body: `
      <form data-form="product" class="form-grid">
        ${Input({ name: "name", label: "Product name", required: true })}
        ${Input({ name: "sku", label: "SKU", placeholder: "Auto if blank" })}
        ${Input({ name: "barcode", label: "Barcode", placeholder: "Scan or enter code" })}
        ${Input({ name: "category", label: "Category", required: true })}
        ${Input({ name: "brand", label: "Brand" })}
        ${Input({ name: "purchasePrice", label: "Purchase price", type: "number", min: 0 })}
        ${Input({ name: "salePrice", label: "Sale price", type: "number", min: 0, required: true })}
        ${Input({ name: "stock", label: "Opening stock", type: "number", min: 0 })}
        ${Input({ name: "minimumStock", label: "Low stock alert", type: "number", min: 0 })}
        ${Select({ name: "unit", label: "Unit", value: "piece", options: ["piece", "kg", "gram", "liter", "ml", "plate", "pack", "bottle"].map((unit) => ({ value: unit, label: unit })) })}
        <div class="field full"><span>Business-specific attributes</span></div>
        ${config.productAttributes
          .map((attribute) => Input({ name: `attr_${attribute.key}`, label: attribute.label, type: attribute.type === "boolean" ? "text" : attribute.type, placeholder: attribute.type === "boolean" ? "true / false" : "" }))
          .join("")}
        <div class="field full">${Button({ label: "Save product", type: "submit" })}</div>
      </form>
    `,
  });
}
