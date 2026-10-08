// @ts-check

import { businessTypes } from "../../config/business-types.js";
import { Button, Card, DataTable, StatusBadge } from "../../components/ui.js";
import { formatMoney } from "../../utils/format.js";

/**
 * @param {import('../../services/business-os-repository.js').BusinessOSRepository} repo
 */
export function renderOrders(repo) {
  const tenant = repo.currentTenant();
  const config = businessTypes[tenant.businessType];
  const orders = repo.tenantOrders();

  return `
    ${Card({
      title: "Orders",
      description: `Statuses adapt for ${config.name}: ${config.orderStatuses.join(", ")}.`,
      action: Button({ label: "Sync queued", variant: "secondary", action: 'data-action="sync-orders"' }),
      body: DataTable({
        rows: orders.slice().reverse(),
        emptyTitle: "No orders yet",
        columns: [
          { key: "orderNo", label: "Order" },
          { key: "date", label: "Date" },
          { key: "source", label: "Source" },
          { key: "status", label: "Status", render: (order) => StatusBadge({ label: order.status, tone: order.syncStatus === "queued" ? "warn" : "active" }) },
          { key: "paymentMethod", label: "Payment" },
          { key: "total", label: "Total", render: (order) => formatMoney(order.total) },
          { key: "syncStatus", label: "Sync", render: (order) => StatusBadge({ label: order.syncStatus, tone: order.syncStatus === "queued" ? "warn" : "active" }) },
        ],
      }),
    })}
  `;
}
