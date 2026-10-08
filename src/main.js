// @ts-check

import { AppShell } from "./app/app-shell.js";
import { overlayFor, route } from "./app/router.js";
import { BusinessOSRepository } from "./services/business-os-repository.js";
import { businessTypes } from "./config/business-types.js";
import { isBangladeshPhone, slugify } from "./utils/format.js";

const repo = new BusinessOSRepository();
const root = document.querySelector("#app");
let activeOverlay = "";

function render() {
  if (!root) return;
  const { content } = route(repo);
  root.innerHTML = AppShell(repo, content, overlayFor(repo, activeOverlay));
  if (repo.getState().toast) {
    window.clearTimeout(render.toastTimer);
    render.toastTimer = window.setTimeout(() => {
      repo.clearToast();
      render();
    }, 2600);
  }
}

render.toastTimer = 0;

/**
 * @param {string} message
 * @param {'success'|'error'|'info'} tone
 */
function notify(message, tone = "success") {
  repo.toast(message, tone);
  render();
}

document.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) return;
  const target = event.target.closest("[data-action]");
  if (!(target instanceof HTMLElement)) return;
  const action = target.dataset.action;

  try {
    if (action === "nav") {
      repo.setView(/** @type {import('./domain/types.js').ViewId} */ (target.dataset.view));
      activeOverlay = "";
      render();
    }
    if (action === "add-cart") {
      repo.addCartItem(String(target.dataset.productId));
      notify("Product added to cart.");
    }
    if (action === "cart-qty") {
      repo.setCartQuantity(String(target.dataset.productId), Number(target.dataset.qty));
      render();
    }
    if (action === "clear-cart") {
      repo.clearCart();
      notify("Cart cleared.", "info");
    }
    if (action === "open-product-drawer") {
      activeOverlay = "product";
      render();
    }
    if (action === "open-supplier-drawer") {
      activeOverlay = "supplier";
      render();
    }
    if (action === "open-staff-drawer") {
      activeOverlay = "staff";
      render();
    }
    if (action === "open-tenant-drawer") {
      activeOverlay = "tenant";
      render();
    }
    if (action === "close-modal") {
      activeOverlay = "";
      render();
    }
    if (action === "sync-orders") {
      repo.syncOrders();
      notify("Queued orders synced.");
    }
    if (action === "adjust-stock") {
      repo.adjustStock(String(target.dataset.productId), 10);
      notify("Stock adjusted by 10 units.");
    }
    if (action === "pay-supplier") {
      repo.paySupplier(String(target.dataset.supplierId), 1000);
      notify("Supplier payment recorded.");
    }
    if (action === "toggle-staff") {
      repo.toggleStaffStatus(String(target.dataset.staffId));
      render();
    }
    if (action === "toggle-module") {
      repo.toggleModule(/** @type {import('./domain/types.js').ModuleId} */ (target.dataset.moduleId));
      notify("Module subscription updated.");
    }
    if (action === "add-section") {
      repo.addStorefrontSection(String(target.dataset.sectionType));
      notify("Storefront section added.");
    }
    if (action === "move-section") {
      repo.moveStorefrontSection(Number(target.dataset.from), Number(target.dataset.to));
      render();
    }
    if (action === "remove-section") {
      repo.removeStorefrontSection(Number(target.dataset.index));
      notify("Section removed.", "info");
    }
    if (action === "publish-storefront") {
      repo.publishStorefront();
      notify("Storefront published.");
    }
    if (action === "toast") {
      notify(String(target.dataset.message || "Action completed."), "info");
    }
  } catch (error) {
    notify(error instanceof Error ? error.message : "Something went wrong.", "error");
  }
});

document.addEventListener("change", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLSelectElement)) return;
  if (target.dataset.action === "tenant-select") {
    repo.selectTenant(target.value);
    activeOverlay = "";
    render();
  }
});

document.addEventListener("submit", (event) => {
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) return;
  event.preventDefault();
  const data = /** @type {Record<string, FormDataEntryValue>} */ ({});
  new FormData(form).forEach((value, key) => {
    data[key] = value;
  });
  const formName = form.dataset.form;

  try {
    if (formName === "checkout") {
      repo.checkout(/** @type {import('./domain/types.js').PaymentMethod} */ (String(data.paymentMethod)));
      notify("Sale completed.");
    }
    if (formName === "product") {
      const tenant = repo.currentTenant();
      const config = businessTypes[tenant.businessType];
      const attributes = Object.fromEntries(
        config.productAttributes.map((attribute) => {
          const raw = data[`attr_${attribute.key}`];
          return [attribute.key, attribute.type === "number" ? Number(raw || 0) : attribute.type === "boolean" ? String(raw).toLowerCase() === "true" : String(raw || "")];
        }),
      );
      repo.createProduct({
        name: String(data.name),
        sku: String(data.sku || ""),
        barcode: String(data.barcode || ""),
        category: String(data.category),
        brand: String(data.brand || ""),
        purchasePrice: Number(data.purchasePrice || 0),
        salePrice: Number(data.salePrice || 0),
        stock: Number(data.stock || 0),
        minimumStock: Number(data.minimumStock || 0),
        unit: String(data.unit || "piece"),
        attributes,
      });
      activeOverlay = "";
      notify("Product saved.");
    }
    if (formName === "supplier") {
      if (!isBangladeshPhone(String(data.phone))) throw new Error("Use a valid Bangladesh phone number.");
      repo.createSupplier({ name: String(data.name), category: String(data.category), phone: String(data.phone), payable: Number(data.payable || 0) });
      activeOverlay = "";
      notify("Supplier saved.");
    }
    if (formName === "staff") {
      repo.createStaff({
        name: String(data.name),
        role: /** @type {import('./domain/types.js').RoleId} */ (String(data.role)),
        shift: String(data.shift),
        salary: Number(data.salary || 0),
      });
      activeOverlay = "";
      notify("Staff profile saved.");
    }
    if (formName === "tenant") {
      if (!isBangladeshPhone(String(data.phone))) throw new Error("Use a valid Bangladesh phone number.");
      repo.createTenant({
        name: String(data.name),
        businessType: /** @type {import('./domain/types.js').BusinessType} */ (String(data.businessType)),
        phone: String(data.phone),
        email: String(data.email || ""),
        branch: String(data.branch),
      });
      activeOverlay = "";
      notify("Tenant created.");
    }
    if (formName === "settings") {
      const tenant = repo.currentTenant();
      tenant.name = String(data.name);
      tenant.businessType = /** @type {import('./domain/types.js').BusinessType} */ (String(data.businessType));
      tenant.phone = String(data.phone);
      tenant.email = String(data.email || "");
      tenant.settings.vatRate = Number(data.vatRate || 0);
      tenant.settings.serviceChargeRate = Number(data.serviceChargeRate || 0);
      tenant.settings.language = String(data.language);
      tenant.settings.receiptWidth = String(data.receiptWidth);
      tenant.storefront.slug = slugify(String(data.slug));
      tenant.storefront.heroTitle = String(data.heroTitle);
      tenant.storefront.tagline = String(data.tagline);
      repo.save();
      notify("Settings saved.");
    }
  } catch (error) {
    notify(error instanceof Error ? error.message : "Something went wrong while saving.", "error");
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    activeOverlay = "";
    render();
  }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    notify("Command palette contract is ready for global search.", "info");
  }
  if (event.key === "F5") {
    event.preventDefault();
    repo.setView("pos");
    render();
  }
});
