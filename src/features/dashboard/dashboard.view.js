// @ts-check

import { businessTypes } from "../../config/business-types.js";
import { Button, Card, DataTable, KPI, StatusBadge } from "../../components/ui.js";
import { formatMoney, sumBy } from "../../utils/format.js";

/**
 * @param {import('../../services/business-os-repository.js').BusinessOSRepository} repo
 */
export function renderDashboard(repo) {
  const tenant = repo.currentTenant();
  const config = businessTypes[tenant.businessType];
  const products = repo.tenantProducts();
  const orders = repo.tenantOrders();
  const suppliers = repo.tenantSuppliers();
  const lowStock = products.filter((product) => product.stock <= product.minimumStock);
  const sales = sumBy(orders, (order) => order.total);
  const supplierDue = sumBy(suppliers, (supplier) => supplier.payable);
  const queued = orders.filter((order) => order.syncStatus === "queued").length;

  return `
    <div class="grid metrics">
      ${KPI({ label: "Today's sales", value: formatMoney(sales), note: `${orders.length} orders`, tone: "success" })}
      ${KPI({ label: "Needs attention", value: lowStock.length + queued, note: `${lowStock.length} low stock, ${queued} queued`, tone: lowStock.length || queued ? "warning" : "success" })}
      ${KPI({ label: "Supplier due", value: formatMoney(supplierDue), note: "Payables across active suppliers", tone: supplierDue ? "warning" : "success" })}
      ${KPI({ label: "Storefront", value: tenant.storefront.status, note: `${tenant.storefront.slug}.businessos.bd`, tone: tenant.storefront.status === "published" ? "success" : "warning" })}
    </div>

    <div class="grid two" style="margin-top:16px">
      ${Card({
        title: `${tenant.name} operating view`,
        description: `${config.name} workspace. Navigation, fields, statuses, and widgets adapt from business configuration.`,
        action: StatusBadge({ label: tenant.plan, tone: "active" }),
        body: `
          <div class="section-list">
            ${config.dashboardWidgets
              .filter((widget) => !widget.moduleId || tenant.enabledModules.includes(widget.moduleId))
              .map((widget) => `<div class="draggable-section"><strong>${widget.label}</strong>${widget.moduleId ? StatusBadge({ label: widget.moduleId, tone: "active" }) : ""}</div>`)
              .join("")}
          </div>
        `,
      })}
      ${Card({
        title: "Setup checklist",
        description: "Keeps first-time users focused on launch-critical tasks.",
        body: `
          <div class="section-list">
            ${config.setupTasks.map((task, index) => `<div class="draggable-section"><strong>${task}</strong>${StatusBadge({ label: index < 2 ? "Done" : "Open", tone: index < 2 ? "active" : "warn" })}</div>`).join("")}
          </div>
        `,
      })}
    </div>

    <div class="grid two" style="margin-top:16px">
      ${Card({
        title: "Recent orders",
        description: "Unified POS and storefront order ledger.",
        action: Button({ label: "Open orders", variant: "secondary", action: 'data-action="nav" data-view="orders"' }),
        body: DataTable({
          rows: orders.slice(-5).reverse(),
          emptyTitle: "No orders yet",
          columns: [
            { key: "orderNo", label: "Order" },
            { key: "source", label: "Source" },
            { key: "status", label: "Status", render: (order) => StatusBadge({ label: order.status, tone: order.syncStatus === "queued" ? "warn" : "active" }) },
            { key: "total", label: "Total", render: (order) => formatMoney(order.total) },
          ],
        }),
      })}
      ${Card({
        title: "Low stock",
        description: "Products below minimum quantity.",
        action: Button({ label: "Add stock", variant: "secondary", action: 'data-action="nav" data-view="inventory"' }),
        body: DataTable({
          rows: lowStock,
          emptyTitle: "No low-stock products",
          columns: [
            { key: "name", label: "Product" },
            { key: "category", label: "Category" },
            { key: "stock", label: "Stock", render: (product) => `${product.stock} ${product.unit}` },
            { key: "minimumStock", label: "Alert" },
          ],
        }),
      })}
    </div>
  `;
}
