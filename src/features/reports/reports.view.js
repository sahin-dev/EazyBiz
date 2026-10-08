// @ts-check

import { Card, DataTable, KPI } from "../../components/ui.js";
import { formatMoney, sumBy } from "../../utils/format.js";

/**
 * @param {import('../../services/business-os-repository.js').BusinessOSRepository} repo
 */
export function renderReports(repo) {
  const products = repo.tenantProducts();
  const orders = repo.tenantOrders();
  const suppliers = repo.tenantSuppliers();
  const sales = sumBy(orders, (order) => order.total);
  const costValue = sumBy(products, (product) => product.purchasePrice * product.stock);
  const payable = sumBy(suppliers, (supplier) => supplier.payable);
  const paymentRows = Object.entries(
    orders.reduce((acc, order) => {
      acc[order.paymentMethod] = (acc[order.paymentMethod] || 0) + order.total;
      return acc;
    }, /** @type {Record<string, number>} */ ({})),
  ).map(([method, total]) => ({ method, total }));

  return `
    <div class="grid metrics">
      ${KPI({ label: "Sales", value: formatMoney(sales), note: "Selected tenant" })}
      ${KPI({ label: "Stock value", value: formatMoney(costValue), note: "At purchase price" })}
      ${KPI({ label: "Supplier due", value: formatMoney(payable), note: "Outstanding payable", tone: payable ? "warning" : "success" })}
      ${KPI({ label: "Average order", value: formatMoney(sales / Math.max(1, orders.length)), note: "Across all channels" })}
    </div>
    <div class="grid two" style="margin-top:16px">
      ${Card({
        title: "Payment mix",
        description: "Cash closing and MFS reconciliation.",
        body: DataTable({
          rows: paymentRows,
          emptyTitle: "No payments yet",
          columns: [
            { key: "method", label: "Method" },
            { key: "total", label: "Total", render: (row) => formatMoney(row.total) },
          ],
        }),
      })}
      ${Card({
        title: "Top products by stock value",
        description: "A simple report designed for non-accountants.",
        body: DataTable({
          rows: products.slice().sort((a, b) => b.purchasePrice * b.stock - a.purchasePrice * a.stock).slice(0, 5),
          emptyTitle: "No products to report",
          columns: [
            { key: "name", label: "Product" },
            { key: "stock", label: "Stock", render: (product) => `${product.stock} ${product.unit}` },
            { key: "value", label: "Value", render: (product) => formatMoney(product.purchasePrice * product.stock) },
          ],
        }),
      })}
    </div>
  `;
}
