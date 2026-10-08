// @ts-check

import { Card, DataTable, Button, StatusBadge } from "../components/ui.js";
import { renderDashboard } from "../features/dashboard/dashboard.view.js";
import { renderPOS } from "../features/pos/pos.view.js";
import { renderOrders } from "../features/orders/orders.view.js";
import { productDrawer, renderProducts } from "../features/products/products.view.js";
import { renderSuppliers, supplierDrawer } from "../features/suppliers/suppliers.view.js";
import { renderStaff, staffDrawer } from "../features/staff/staff.view.js";
import { renderStorefront } from "../features/storefront/storefront.view.js";
import { renderReports } from "../features/reports/reports.view.js";
import { renderSettings, renderSubscription } from "../features/settings/settings.view.js";
import { renderAdmin, tenantDrawer } from "../features/admin/admin.view.js";
import { formatMoney } from "../utils/format.js";

/**
 * @param {import('../services/business-os-repository.js').BusinessOSRepository} repo
 */
export function route(repo) {
  const view = repo.getState().currentView;
  if (view === "dashboard") return { content: renderDashboard(repo), overlays: "" };
  if (view === "pos") return { content: renderPOS(repo), overlays: "" };
  if (view === "orders") return { content: renderOrders(repo), overlays: "" };
  if (view === "products") return { content: renderProducts(repo), overlays: "" };
  if (view === "inventory") return { content: renderInventory(repo), overlays: "" };
  if (view === "suppliers") return { content: renderSuppliers(repo), overlays: "" };
  if (view === "customers") return { content: renderCustomers(repo), overlays: "" };
  if (view === "staff") return { content: renderStaff(repo), overlays: "" };
  if (view === "storefront") return { content: renderStorefront(repo), overlays: "" };
  if (view === "reports") return { content: renderReports(repo), overlays: "" };
  if (view === "subscription") return { content: renderSubscription(repo), overlays: "" };
  if (view === "settings") return { content: renderSettings(repo), overlays: "" };
  if (view === "admin") return { content: renderAdmin(repo), overlays: "" };
  return { content: renderDashboard(repo), overlays: "" };
}

/**
 * @param {import('../services/business-os-repository.js').BusinessOSRepository} repo
 * @param {string} overlay
 */
export function overlayFor(repo, overlay) {
  if (overlay === "product") return productDrawer(repo);
  if (overlay === "supplier") return supplierDrawer();
  if (overlay === "staff") return staffDrawer();
  if (overlay === "tenant") return tenantDrawer();
  return "";
}

/**
 * @param {import('../services/business-os-repository.js').BusinessOSRepository} repo
 */
function renderInventory(repo) {
  const products = repo.tenantProducts();
  const lowStock = products.filter((product) => product.stock <= product.minimumStock);
  return Card({
    title: "Inventory",
    description: "Branch-level stock overview. Stock adjustments are recorded through repository methods and can become audit logs in the API layer.",
    action: Button({ label: "Add product", action: 'data-action="open-product-drawer"' }),
    body: `
      <div class="grid metrics" style="padding:18px">
        <article class="card metric"><span>Products</span><strong>${products.length}</strong><small>Active catalog</small></article>
        <article class="card metric"><span>Low stock</span><strong>${lowStock.length}</strong><small>Needs attention</small></article>
        <article class="card metric"><span>Stock value</span><strong>${formatMoney(products.reduce((total, product) => total + product.purchasePrice * product.stock, 0))}</strong><small>At purchase price</small></article>
      </div>
      ${DataTable({
        rows: products,
        emptyTitle: "No inventory yet",
        emptyAction: Button({ label: "Add product", action: 'data-action="open-product-drawer"' }),
        columns: [
          { key: "name", label: "Product" },
          { key: "category", label: "Category" },
          { key: "purchasePrice", label: "Cost", render: (product) => formatMoney(product.purchasePrice) },
          { key: "stock", label: "Stock", render: (product) => `${product.stock} ${product.unit}` },
          { key: "minimumStock", label: "Status", render: (product) => StatusBadge({ label: product.stock <= product.minimumStock ? "Low stock" : "Healthy", tone: product.stock <= product.minimumStock ? "danger" : "active" }) },
          { key: "id", label: "Action", render: (product) => Button({ label: "+10", variant: "secondary", action: `data-action="adjust-stock" data-product-id="${product.id}"` }) },
        ],
      })}
    `,
  });
}

/**
 * @param {import('../services/business-os-repository.js').BusinessOSRepository} repo
 */
function renderCustomers(repo) {
  const customers = repo.tenantCustomers();
  return Card({
    title: "Customers",
    description: "Customer profiles with phone search, due, spend, and loyalty-ready data.",
    action: Button({ label: "Create customer", variant: "secondary", action: 'data-action="toast" data-message="Customer drawer contract is ready for API implementation."' }),
    body: DataTable({
      rows: customers,
      emptyTitle: "No customers yet",
      columns: [
        { key: "name", label: "Customer" },
        { key: "phone", label: "Phone" },
        { key: "totalSpend", label: "Total spend", render: (customer) => formatMoney(customer.totalSpend) },
        { key: "due", label: "Due", render: (customer) => formatMoney(customer.due) },
        { key: "loyaltyPoints", label: "Points" },
      ],
    }),
  });
}
