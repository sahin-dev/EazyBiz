// @ts-check

import { getVisibleNavigation } from "../config/navigation.js";
import { businessTypes } from "../config/business-types.js";
import { Toast } from "../components/ui.js";
import { escapeHtml } from "../utils/format.js";

/**
 * @param {import('../services/business-os-repository.js').BusinessOSRepository} repo
 * @param {string} content
 * @param {string} overlays
 */
export function AppShell(repo, content, overlays = "") {
  const state = repo.getState();
  const tenant = repo.currentTenant();
  const nav = getVisibleNavigation(tenant, "owner");
  const config = businessTypes[tenant.businessType];

  return `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="brand">
          <div class="brand-mark">B</div>
          <div>
            <strong>BusinessOS</strong>
            <span>One platform, many businesses</span>
          </div>
        </div>

        <nav class="nav" aria-label="Primary navigation">
          ${nav.map((item) => `<button class="nav-item ${state.currentView === item.id ? "active" : ""}" data-action="nav" data-view="${item.id}">${escapeHtml(item.label)}</button>`).join("")}
        </nav>

        <div class="sidebar-card">
          <span class="eyebrow">Business config</span>
          <p>${escapeHtml(config.name)}: ${config.recommendedModules.length} recommended modules, ${config.productAttributes.length} dynamic fields.</p>
        </div>
      </aside>

      <main class="workspace">
        <header class="topbar">
          <div>
            <p class="eyebrow">Bangladesh-localized multi-tenant SaaS</p>
            <h1>${escapeHtml(pageTitle(state.currentView))}</h1>
          </div>
          <div class="tenant-switcher">
            <label for="tenantSelect">Business</label>
            <select id="tenantSelect" data-action="tenant-select">
              ${state.tenants.map((item) => `<option value="${escapeHtml(item.id)}" ${item.id === tenant.id ? "selected" : ""}>${escapeHtml(item.name)} - ${escapeHtml(businessTypes[item.businessType].shortName)}</option>`).join("")}
            </select>
          </div>
        </header>

        <section class="view active">${content}</section>
      </main>
    </div>
    ${Toast(state.toast)}
    ${overlays}
  `;
}

/**
 * @param {import('../domain/types.js').ViewId} view
 */
function pageTitle(view) {
  return {
    dashboard: "Dashboard",
    pos: "Point of Sale",
    orders: "Orders",
    products: "Products",
    inventory: "Inventory",
    suppliers: "Suppliers",
    customers: "Customers",
    staff: "Staff",
    storefront: "Storefront Builder",
    reports: "Reports",
    subscription: "Subscription",
    settings: "Settings",
    admin: "Super Admin",
  }[view] || "BusinessOS";
}
