// @ts-check

import { businessTypes } from "../../config/business-types.js";
import { Button, Card, StatusBadge } from "../../components/ui.js";
import { escapeHtml, formatMoney } from "../../utils/format.js";

export const sectionLibrary = [
  "hero",
  "categoryGrid",
  "featuredProducts",
  "bestSellers",
  "newArrivals",
  "offerBanner",
  "productCarousel",
  "testimonials",
  "branches",
  "contact",
  "deliveryNotice",
  "footer",
];

/**
 * @param {import('../../services/business-os-repository.js').BusinessOSRepository} repo
 */
export function renderStorefront(repo) {
  const tenant = repo.currentTenant();
  const config = businessTypes[tenant.businessType];
  const products = repo.tenantProducts();

  return `
    <div class="builder-toolbar">
      <div class="button-row">
        ${StatusBadge({ label: tenant.storefront.status, tone: tenant.storefront.status === "published" ? "active" : "warn" })}
        ${StatusBadge({ label: config.storefrontTheme, tone: "active" })}
      </div>
      <div class="button-row">
        ${Button({ label: "Desktop", variant: "secondary", action: 'data-action="toast" data-message="Desktop preview selected."' })}
        ${Button({ label: "Tablet", variant: "secondary", action: 'data-action="toast" data-message="Tablet preview selected."' })}
        ${Button({ label: "Mobile", variant: "secondary", action: 'data-action="toast" data-message="Mobile preview selected."' })}
        ${Button({ label: "Publish", action: 'data-action="publish-storefront"' })}
      </div>
    </div>
    <div class="storefront-layout builder-layout">
      ${Card({
        title: "Section library",
        description: "Drag-ready section blocks for non-technical owners.",
        body: `<div class="section-palette">${sectionLibrary.map((section) => `<button class="draggable-section" data-action="add-section" data-section-type="${section}"><strong>${section}</strong><span class="chip">Add</span></button>`).join("")}</div>`,
      })}
      <article class="store-preview">
        ${tenant.storefront.sections
          .filter((section) => section.visible)
          .map((section, index) => renderPreviewSection(section, index, products, tenant))
          .join("")}
      </article>
      ${Card({
        title: "Properties",
        description: "Select a section to edit title, products, layout, visibility, and mobile behavior.",
        body: `
          <div class="section-list">
            ${tenant.storefront.sections
              .map(
                (section, index) => `
                  <div class="draggable-section">
                    <span><strong>${section.title}</strong><span class="muted">${section.type}</span></span>
                    <span class="button-row">
                      <button class="icon-button" data-action="move-section" data-from="${index}" data-to="${Math.max(0, index - 1)}" aria-label="Move up">↑</button>
                      <button class="icon-button" data-action="move-section" data-from="${index}" data-to="${Math.min(tenant.storefront.sections.length - 1, index + 1)}" aria-label="Move down">↓</button>
                      <button class="icon-button" data-action="remove-section" data-index="${index}" aria-label="Remove">x</button>
                    </span>
                  </div>
                `,
              )
              .join("")}
          </div>
        `,
      })}
    </div>
  `;
}

/**
 * @param {import('../../domain/types.js').StorefrontSection} section
 * @param {number} index
 * @param {import('../../domain/types.js').Product[]} products
 * @param {import('../../domain/types.js').Tenant} tenant
 */
function renderPreviewSection(section, index, products, tenant) {
  if (section.type === "hero") {
    return `
      <section class="store-hero">
        <p class="eyebrow" style="color:#f6d478">${tenant.storefront.status === "published" ? "Live storefront" : "Draft storefront"}</p>
        <h2>${escapeHtml(section.title)}</h2>
        <p>${escapeHtml(section.subtitle)}</p>
      </section>
    `;
  }

  const featured = products.filter((product) => product.featured).slice(0, 4);
  return `
    <section class="preview-section" data-section-index="${index}">
      <div class="total-row">
        <div>
          <h2>${escapeHtml(section.title)}</h2>
          <p class="muted">${escapeHtml(section.subtitle)}</p>
        </div>
        ${StatusBadge({ label: section.type, tone: "active" })}
      </div>
      <div class="preview-products">
        ${featured
          .map(
            (product) => `
              <div class="preview-product">
                <strong>${escapeHtml(product.name)}</strong>
                <p class="muted">${escapeHtml(product.category)}</p>
                ${StatusBadge({ label: product.stock > 0 ? formatMoney(product.salePrice) : "Out of stock", tone: product.stock > 0 ? "active" : "danger" })}
              </div>
            `,
          )
          .join("")}
      </div>
    </section>
  `;
}
