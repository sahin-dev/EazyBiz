// @ts-check

import { Button, Card, DataTable, Drawer, Input, Select, StatusBadge } from "../../components/ui.js";
import { formatMoney, sumBy } from "../../utils/format.js";

const roles = ["owner", "admin", "manager", "cashier", "inventoryManager", "salesStaff", "accountant", "kitchenStaff", "pharmacist", "deliveryStaff"];

/**
 * @param {import('../../services/business-os-repository.js').BusinessOSRepository} repo
 */
export function renderStaff(repo) {
  const staff = repo.tenantStaff();
  const payroll = sumBy(staff, (member) => member.salary);

  return Card({
    title: "Staff & roles",
    description: `Monthly payroll estimate: ${formatMoney(payroll)}. Permissions are role-driven.`,
    action: Button({ label: "Add staff", action: 'data-action="open-staff-drawer"' }),
    body: DataTable({
      rows: staff,
      emptyTitle: "No staff yet",
      emptyAction: Button({ label: "Add staff", action: 'data-action="open-staff-drawer"' }),
      columns: [
        { key: "name", label: "Name" },
        { key: "role", label: "Role" },
        { key: "shift", label: "Shift" },
        { key: "salary", label: "Salary", render: (member) => formatMoney(member.salary) },
        { key: "status", label: "Status", render: (member) => StatusBadge({ label: member.status, tone: member.status === "Present" ? "active" : "warn" }) },
        { key: "id", label: "Action", render: (member) => Button({ label: "Toggle", variant: "secondary", action: `data-action="toggle-staff" data-staff-id="${member.id}"` }) },
      ],
    }),
  });
}

export function staffDrawer() {
  return Drawer({
    id: "staffDrawer",
    title: "Add staff",
    body: `
      <form data-form="staff" class="form-grid">
        ${Input({ name: "name", label: "Name", required: true })}
        ${Select({ name: "role", label: "Role", value: "cashier", options: roles.map((role) => ({ value: role, label: role })) })}
        ${Input({ name: "shift", label: "Shift", placeholder: "10:00 AM - 8:00 PM", required: true })}
        ${Input({ name: "salary", label: "Salary", type: "number", min: 0, required: true })}
        <div class="field full">${Button({ label: "Save staff", type: "submit" })}</div>
      </form>
    `,
  });
}
