// @ts-check

import { businessTypes } from "../../config/business-types.js";
import { modules } from "../../config/modules.js";
import { Button, Card, DataTable, Drawer, Input, KPI, Select, StatusBadge } from "../../components/ui.js";
import { formatMoney, sumBy } from "../../utils/format.js";

/**
 * @param {import('../../services/business-os-repository.js').BusinessOSRepository} repo
 */
export function renderAdmin(repo) {
  const state = repo.getState();
  const mrr = sumBy(state.tenants, (tenant) => sumBy(modules.filter((module) => tenant.enabledModules.includes(module.id)), (module) => module.monthlyPrice));
  return `
    <div class="grid metrics">
      ${KPI({ label: "Tenants", value: state.tenants.length, note: "Demo tenant accounts" })}
      ${KPI({ label: "MRR", value: formatMoney(mrr), note: "Module subscription estimate" })}
      ${KPI({ label: "Business templates", value: Object.keys(businessTypes).length, note: "Vertical configs" })}
      ${KPI({ label: "Modules", value: modules.length, note: "Feature flags" })}
    </div>
    <div class="grid two" style="margin-top:16px">
      ${Card({
        title: "Tenant management",
        description: "Super-admin tenant overview. Support access must be audited in production.",
        action: Button({ label: "Add tenant", action: 'data-action="open-tenant-drawer"' }),
        body: DataTable({
          rows: state.tenants,
          emptyTitle: "No tenants",
          columns: [
            { key: "name", label: "Tenant" },
            { key: "businessType", label: "Type", render: (tenant) => businessTypes[tenant.businessType].name },
            { key: "plan", label: "Plan" },
            { key: "enabledModules", label: "Modules", render: (tenant) => String(tenant.enabledModules.length) },
            { key: "storefront", label: "Storefront", render: (tenant) => StatusBadge({ label: tenant.storefront.status, tone: tenant.storefront.status === "published" ? "active" : "warn" }) },
          ],
        }),
      })}
      ${Card({
        title: "Business template management",
        description: "Default modules, fields, workflows, widgets, and themes are configured here.",
        body: DataTable({
          rows: Object.values(businessTypes),
          emptyTitle: "No business templates",
          columns: [
            { key: "name", label: "Business type" },
            { key: "recommendedModules", label: "Default modules", render: (type) => String(type.recommendedModules.length) },
            { key: "productAttributes", label: "Fields", render: (type) => String(type.productAttributes.length) },
            { key: "storefrontTheme", label: "Theme" },
          ],
        }),
      })}
    </div>
  `;
}

export function tenantDrawer() {
  return Drawer({
    id: "tenantDrawer",
    title: "Create tenant",
    body: `
      <form data-form="tenant" class="form-grid">
        ${Input({ name: "name", label: "Business name", required: true })}
        ${Select({ name: "businessType", label: "Business type", value: "restaurant", options: Object.values(businessTypes).map((type) => ({ value: type.id, label: type.name })) })}
        ${Input({ name: "phone", label: "Phone", required: true })}
        ${Input({ name: "email", label: "Email", type: "email" })}
        ${Input({ name: "branch", label: "First branch", required: true })}
        <div class="field full">${Button({ label: "Create tenant", type: "submit" })}</div>
      </form>
    `,
  });
}
