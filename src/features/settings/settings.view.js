// @ts-check

import { businessTypes } from "../../config/business-types.js";
import { modules } from "../../config/modules.js";
import { Button, Card, Input, Select, StatusBadge, Textarea } from "../../components/ui.js";
import { formatMoney, sumBy } from "../../utils/format.js";

/**
 * @param {import('../../services/business-os-repository.js').BusinessOSRepository} repo
 */
export function renderSubscription(repo) {
  const tenant = repo.currentTenant();
  const monthly = sumBy(modules.filter((module) => tenant.enabledModules.includes(module.id)), (module) => module.monthlyPrice);

  return `
    <div class="grid two">
      ${Card({
        title: "Subscription",
        description: `${tenant.plan} plan with modular add-ons. Transparent pricing for branches, users, and modules can be added here.`,
        body: `<div class="metric"><span>Monthly estimate</span><strong>${formatMoney(monthly)}</strong><small>${tenant.enabledModules.length} active modules</small></div>`,
      })}
      ${Card({
        title: "Module catalog",
        description: "Feature flags control functionality and navigation.",
        body: `<div class="section-list">${modules
          .map((module) => {
            const active = tenant.enabledModules.includes(module.id);
            return `<div class="draggable-section"><span><strong>${module.name}</strong><span class="muted">${module.summary}</span></span><span class="button-row">${StatusBadge({ label: formatMoney(module.monthlyPrice), tone: "active" })}${Button({ label: active ? "Disable" : "Enable", variant: active ? "secondary" : "primary", action: `data-action="toggle-module" data-module-id="${module.id}"` })}</span></div>`;
          })
          .join("")}</div>`,
      })}
    </div>
  `;
}

/**
 * @param {import('../../services/business-os-repository.js').BusinessOSRepository} repo
 */
export function renderSettings(repo) {
  const tenant = repo.currentTenant();
  return Card({
    title: "Business settings",
    description: "Settings are grouped by business, payments, tax, POS, storefront, and localization.",
    body: `
      <form data-form="settings" class="form-grid" style="padding:18px">
        ${Input({ name: "name", label: "Business name", value: tenant.name, required: true })}
        ${Select({ name: "businessType", label: "Business type", value: tenant.businessType, options: Object.values(businessTypes).map((type) => ({ value: type.id, label: type.name })) })}
        ${Input({ name: "phone", label: "Phone", value: tenant.phone, required: true })}
        ${Input({ name: "email", label: "Email", type: "email", value: tenant.email })}
        ${Input({ name: "vatRate", label: "VAT/tax rate (%)", type: "number", value: tenant.settings.vatRate, min: 0, step: "0.01" })}
        ${Input({ name: "serviceChargeRate", label: "Service charge (%)", type: "number", value: tenant.settings.serviceChargeRate, min: 0, step: "0.01" })}
        ${Select({ name: "language", label: "Language", value: tenant.settings.language, options: ["Bangla + English", "English", "Bangla"].map((item) => ({ value: item, label: item })) })}
        ${Select({ name: "receiptWidth", label: "Receipt", value: tenant.settings.receiptWidth, options: ["80mm", "A4"].map((item) => ({ value: item, label: item })) })}
        ${Input({ name: "slug", label: "Storefront slug", value: tenant.storefront.slug, required: true })}
        ${Input({ name: "heroTitle", label: "Storefront title", value: tenant.storefront.heroTitle, required: true })}
        ${Textarea({ name: "tagline", label: "Storefront tagline", value: tenant.storefront.tagline })}
        <div class="field full">${Button({ label: "Save settings", type: "submit" })}</div>
      </form>
    `,
  });
}
