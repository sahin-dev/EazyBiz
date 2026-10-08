// @ts-check

import { tenants, products, orders, suppliers, staff, customers } from "./fixtures.js";
import { localDate, slugify } from "../utils/format.js";
import { businessTypes } from "../config/business-types.js";

const STORAGE_KEY = "business-os-state-v2";

/**
 * Realistic local repository. In production, this file is replaced by an API-backed repository
 * without changing UI components or feature modules.
 */
export class BusinessOSRepository {
  constructor() {
    /** @type {import('../domain/types.js').AppState} */
    this.state = this.load();
  }

  load() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    return {
      selectedTenantId: tenants[0].id,
      currentView: "dashboard",
      tenants: structuredClone(tenants),
      products: structuredClone(products),
      orders: structuredClone(orders),
      suppliers: structuredClone(suppliers),
      staff: structuredClone(staff),
      customers: structuredClone(customers),
      cart: { items: [], customerId: null, discount: 0, notes: "" },
      toast: null,
      commandPalette: { open: false, query: "" },
    };
  }

  save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
  }

  getState() {
    return this.state;
  }

  /**
   * @param {Partial<import('../domain/types.js').AppState>} patch
   */
  update(patch) {
    this.state = { ...this.state, ...patch };
    this.save();
    return this.state;
  }

  /**
   * @param {string} tenantId
   */
  selectTenant(tenantId) {
    this.state.selectedTenantId = tenantId;
    this.state.cart = { items: [], customerId: null, discount: 0, notes: "" };
    this.save();
  }

  /**
   * @param {import('../domain/types.js').ViewId} view
   */
  setView(view) {
    this.state.currentView = view;
    this.save();
  }

  /**
   * @param {string} message
   * @param {'success'|'error'|'info'} tone
   */
  toast(message, tone = "success") {
    this.state.toast = { message, tone };
    this.save();
  }

  clearToast() {
    this.state.toast = null;
    this.save();
  }

  currentTenant() {
    return this.state.tenants.find((tenant) => tenant.id === this.state.selectedTenantId) || this.state.tenants[0];
  }

  tenantProducts() {
    const tenant = this.currentTenant();
    return this.state.products.filter((product) => product.tenantId === tenant.id && product.active);
  }

  tenantOrders() {
    const tenant = this.currentTenant();
    return this.state.orders.filter((order) => order.tenantId === tenant.id);
  }

  tenantSuppliers() {
    const tenant = this.currentTenant();
    return this.state.suppliers.filter((supplier) => supplier.tenantId === tenant.id);
  }

  tenantStaff() {
    const tenant = this.currentTenant();
    return this.state.staff.filter((member) => member.tenantId === tenant.id);
  }

  tenantCustomers() {
    const tenant = this.currentTenant();
    return this.state.customers.filter((customer) => customer.tenantId === tenant.id);
  }

  /**
   * @param {string} productId
   */
  addCartItem(productId) {
    const product = this.state.products.find((item) => item.id === productId);
    if (!product || product.stock <= 0) throw new Error("This product is out of stock.");

    const existing = this.state.cart.items.find((item) => item.productId === productId);
    if (existing) {
      if (existing.quantity >= product.stock) throw new Error("No more stock available for this product.");
      existing.quantity += 1;
    } else {
      this.state.cart.items.push({ productId, quantity: 1 });
    }
    this.save();
  }

  /**
   * @param {string} productId
   * @param {number} quantity
   */
  setCartQuantity(productId, quantity) {
    const product = this.state.products.find((item) => item.id === productId);
    if (!product) return;
    if (quantity <= 0) {
      this.state.cart.items = this.state.cart.items.filter((item) => item.productId !== productId);
    } else {
      const existing = this.state.cart.items.find((item) => item.productId === productId);
      if (existing) existing.quantity = Math.min(quantity, product.stock);
    }
    this.save();
  }

  clearCart() {
    this.state.cart = { items: [], customerId: null, discount: 0, notes: "" };
    this.save();
  }

  /**
   * @param {import('../domain/types.js').PaymentMethod} paymentMethod
   * @param {string} source
   */
  checkout(paymentMethod, source = "pos") {
    const tenant = this.currentTenant();
    const cartProducts = this.state.cart.items.map((item) => {
      const product = this.state.products.find((candidate) => candidate.id === item.productId);
      if (!product) throw new Error("A cart product is no longer available.");
      return { product, quantity: item.quantity };
    });
    if (!cartProducts.length) throw new Error("Add a product before completing the sale.");

    const subtotal = cartProducts.reduce((total, line) => total + line.product.salePrice * line.quantity, 0);
    const serviceCharge = subtotal * (tenant.settings.serviceChargeRate / 100);
    const vat = subtotal * (tenant.settings.vatRate / 100);
    const total = subtotal + serviceCharge + vat - this.state.cart.discount;

    cartProducts.forEach(({ product, quantity }) => {
      product.stock = Math.max(0, product.stock - quantity);
    });

    this.state.orders.push({
      id: `o_${Date.now()}`,
      tenantId: tenant.id,
      branchId: tenant.branches[0].id,
      orderNo: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      date: localDate(),
      source,
      status: businessTypes[tenant.businessType].orderStatuses[0],
      paymentMethod,
      total,
      syncStatus: navigator.onLine ? "synced" : "queued",
    });
    this.clearCart();
  }

  syncOrders() {
    this.tenantOrders().forEach((order) => {
      order.syncStatus = "synced";
    });
    this.save();
  }

  /**
   * @param {Partial<import('../domain/types.js').Product>} payload
   */
  createProduct(payload) {
    const tenant = this.currentTenant();
    const name = String(payload.name || "").trim();
    if (!name) throw new Error("Product name is required.");
    const salePrice = Number(payload.salePrice || 0);
    if (salePrice <= 0) throw new Error("Sale price must be greater than zero.");

    this.state.products.push({
      id: `p_${Date.now()}`,
      tenantId: tenant.id,
      name,
      sku: String(payload.sku || `SKU-${Date.now().toString().slice(-5)}`),
      barcode: String(payload.barcode || Date.now().toString().slice(-8)),
      category: String(payload.category || "General"),
      brand: String(payload.brand || tenant.name),
      purchasePrice: Number(payload.purchasePrice || 0),
      salePrice,
      unit: String(payload.unit || "piece"),
      stock: Number(payload.stock || 0),
      minimumStock: Number(payload.minimumStock || 0),
      featured: Boolean(payload.featured),
      active: true,
      attributes: payload.attributes || {},
    });
    this.save();
  }

  /**
   * @param {string} productId
   * @param {number} delta
   */
  adjustStock(productId, delta) {
    const product = this.state.products.find((item) => item.id === productId);
    if (!product) throw new Error("Product not found.");
    product.stock = Math.max(0, product.stock + delta);
    this.save();
  }

  /**
   * @param {{name:string, category:string, phone:string, payable:number}} payload
   */
  createSupplier(payload) {
    const tenant = this.currentTenant();
    this.state.suppliers.push({
      id: `s_${Date.now()}`,
      tenantId: tenant.id,
      name: payload.name,
      category: payload.category,
      phone: payload.phone,
      payable: Number(payload.payable || 0),
      lastPurchase: 0,
    });
    this.save();
  }

  /**
   * @param {string} supplierId
   * @param {number} amount
   */
  paySupplier(supplierId, amount) {
    const supplier = this.state.suppliers.find((item) => item.id === supplierId);
    if (!supplier) throw new Error("Supplier not found.");
    supplier.payable = Math.max(0, supplier.payable - amount);
    this.save();
  }

  /**
   * @param {{name:string, role:import('../domain/types.js').RoleId, shift:string, salary:number}} payload
   */
  createStaff(payload) {
    const tenant = this.currentTenant();
    this.state.staff.push({
      id: `e_${Date.now()}`,
      tenantId: tenant.id,
      name: payload.name,
      role: payload.role,
      shift: payload.shift,
      salary: Number(payload.salary || 0),
      status: "Present",
    });
    this.save();
  }

  /**
   * @param {string} staffId
   */
  toggleStaffStatus(staffId) {
    const member = this.state.staff.find((item) => item.id === staffId);
    if (!member) return;
    member.status = member.status === "Present" ? "Absent" : "Present";
    this.save();
  }

  /**
   * @param {import('../domain/types.js').ModuleId} moduleId
   */
  toggleModule(moduleId) {
    const tenant = this.currentTenant();
    if (moduleId === "pos") throw new Error("POS Core is required for every business.");
    tenant.enabledModules = tenant.enabledModules.includes(moduleId)
      ? tenant.enabledModules.filter((id) => id !== moduleId)
      : [...tenant.enabledModules, moduleId];
    this.save();
  }

  /**
   * @param {string} sectionType
   */
  addStorefrontSection(sectionType) {
    const tenant = this.currentTenant();
    tenant.storefront.sections.push({
      id: `sec_${Date.now()}`,
      type: sectionType,
      title: sectionType.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase()),
      subtitle: "Edit this section from the properties panel.",
      visible: true,
    });
    this.save();
  }

  /**
   * @param {number} from
   * @param {number} to
   */
  moveStorefrontSection(from, to) {
    const sections = this.currentTenant().storefront.sections;
    const [section] = sections.splice(from, 1);
    sections.splice(to, 0, section);
    this.save();
  }

  /**
   * @param {number} index
   */
  removeStorefrontSection(index) {
    this.currentTenant().storefront.sections.splice(index, 1);
    this.save();
  }

  publishStorefront() {
    const tenant = this.currentTenant();
    if (!this.tenantProducts().length) throw new Error("Add products before publishing the storefront.");
    tenant.storefront.status = "published";
    this.save();
  }

  /**
   * @param {{name:string, businessType:import('../domain/types.js').BusinessType, phone:string, email:string, branch:string}} payload
   */
  createTenant(payload) {
    const config = businessTypes[payload.businessType];
    const id = `t_${Date.now()}`;
    this.state.tenants.push({
      id,
      name: payload.name,
      businessType: payload.businessType,
      phone: payload.phone,
      email: payload.email,
      plan: "Starter",
      branches: [{ id: `${id}_b1`, name: payload.branch, address: `${payload.branch}, Bangladesh` }],
      enabledModules: [...config.recommendedModules],
      settings: {
        vatRate: 5,
        serviceChargeRate: payload.businessType === "restaurant" ? 5 : 0,
        currency: "BDT",
        language: "Bangla + English",
        receiptWidth: "80mm",
        paymentMethods: ["Cash", "Card", "bKash", "Nagad", "Rocket", "Bangla QR", "Bank transfer", "Due"],
      },
      storefront: {
        slug: slugify(payload.name),
        heroTitle: payload.name,
        tagline: "Sell online from your BusinessOS storefront.",
        status: "draft",
        sections: [{ id: `${id}_hero`, type: "hero", title: payload.name, subtitle: "Welcome to our store.", visible: true }],
      },
    });
    this.state.selectedTenantId = id;
    this.save();
  }
}
