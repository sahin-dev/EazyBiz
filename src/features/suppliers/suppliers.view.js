// @ts-check

import { Button, Card, DataTable, Drawer, Input } from "../../components/ui.js";
import { formatMoney, sumBy } from "../../utils/format.js";

/**
 * @param {import('../../services/business-os-repository.js').BusinessOSRepository} repo
 */
export function renderSuppliers(repo) {
  const suppliers = repo.tenantSuppliers();
  const totalDue = sumBy(suppliers, (supplier) => supplier.payable);

  return Card({
    title: "Suppliers",
    description: `Total payable: ${formatMoney(totalDue)}. Manage purchase relationships without exposing other tenant data.`,
    action: Button({ label: "Add supplier", action: 'data-action="open-supplier-drawer"' }),
    body: DataTable({
      rows: suppliers,
      emptyTitle: "No suppliers yet",
      emptyAction: Button({ label: "Add supplier", action: 'data-action="open-supplier-drawer"' }),
      columns: [
        { key: "name", label: "Supplier" },
        { key: "category", label: "Category" },
        { key: "phone", label: "Phone" },
        { key: "lastPurchase", label: "Last Purchase", render: (supplier) => formatMoney(supplier.lastPurchase) },
        { key: "payable", label: "Due", render: (supplier) => formatMoney(supplier.payable) },
        { key: "id", label: "Action", render: (supplier) => Button({ label: "Pay ৳1,000", variant: "secondary", action: `data-action="pay-supplier" data-supplier-id="${supplier.id}"` }) },
      ],
    }),
  });
}

export function supplierDrawer() {
  return Drawer({
    id: "supplierDrawer",
    title: "Add supplier",
    body: `
      <form data-form="supplier" class="form-grid">
        ${Input({ name: "name", label: "Supplier name", required: true })}
        ${Input({ name: "category", label: "Category", required: true })}
        ${Input({ name: "phone", label: "Phone", required: true, placeholder: "017XXXXXXXX" })}
        ${Input({ name: "payable", label: "Opening due", type: "number", min: 0 })}
        <div class="field full">${Button({ label: "Save supplier", type: "submit" })}</div>
      </form>
    `,
  });
}
