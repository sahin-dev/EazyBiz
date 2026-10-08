// @ts-check

import { businessTypes } from "../config/business-types.js";

/** @type {import('../domain/types.js').Tenant[]} */
export const tenants = [
  tenant("t_restaurant", "ABC Restaurant", "restaurant", "Dhanmondi", "01711112222", "hello@abcrestaurant.bd"),
  tenant("t_pharmacy", "ABC Pharmacy", "pharmacy", "Mirpur", "01733334444", "care@abcpharmacy.bd"),
  tenant("t_grocery", "ABC Grocery", "grocery", "Chattogram", "01855556666", "shop@abcgrocery.bd"),
  tenant("t_retail", "ABC Retail", "retail", "Uttara", "01977778888", "hello@abcretail.bd"),
];

/**
 * @param {string} id
 * @param {string} name
 * @param {import('../domain/types.js').BusinessType} businessType
 * @param {string} branch
 * @param {string} phone
 * @param {string} email
 * @returns {import('../domain/types.js').Tenant}
 */
function tenant(id, name, businessType, branch, phone, email) {
  const config = businessTypes[businessType];
  return {
    id,
    name,
    businessType,
    phone,
    email,
    plan: businessType === "retail" ? "Growth" : "Business",
    branches: [{ id: `${id}_b1`, name: branch, address: `${branch}, Bangladesh` }],
    enabledModules: [...config.recommendedModules],
    settings: {
      vatRate: 5,
      serviceChargeRate: businessType === "restaurant" ? 5 : 0,
      currency: "BDT",
      language: "Bangla + English",
      receiptWidth: "80mm",
      paymentMethods: ["Cash", "Card", "bKash", "Nagad", "Rocket", "Bangla QR", "Bank transfer", "Due"],
    },
    storefront: {
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      heroTitle: name,
      tagline: storefrontTagline(businessType),
      status: "draft",
      sections: [
        { id: `${id}_hero`, type: "hero", title: name, subtitle: storefrontTagline(businessType), visible: true },
        { id: `${id}_categories`, type: "categories", title: "Shop by category", subtitle: "Products are synced from POS", visible: true },
        { id: `${id}_featured`, type: "featured", title: "Featured products", subtitle: "Recommended for your business", visible: true },
        { id: `${id}_branches`, type: "branches", title: "Branches", subtitle: "Pickup and delivery availability", visible: true },
      ],
    },
  };
}

/**
 * @param {import('../domain/types.js').BusinessType} type
 */
function storefrontTagline(type) {
  const taglines = /** @type {Partial<Record<import('../domain/types.js').BusinessType, string>>} */ ({
    restaurant: "Fresh meals, dine-in, takeaway, and delivery.",
    cafe: "Coffee, snacks, and a welcoming local cafe.",
    cloudKitchen: "Fresh meals prepared for pickup and delivery.",
    pharmacy: "Medicines, wellness products, and prescription support.",
    grocery: "Daily essentials delivered from local stock.",
    superShop: "Everyday shopping from a wide local selection.",
    bakery: "Freshly baked treats made every day.",
    retail: "Curated products, fast checkout, and reliable service.",
    electronics: "Trusted electronics, accessories, and service.",
    cosmetics: "Beauty and lifestyle essentials for every day.",
  });
  return taglines[type] || "Run your business and sell online from one platform.";
}

/** @type {import('../domain/types.js').Product[]} */
export const products = [
  product("p_r_1", "t_restaurant", "Chicken Biryani", "RES-001", "Rice", "ABC Kitchen", 165, 280, "plate", 42, 10, true, { prepTime: 18, kitchenStation: "Hot kitchen", hasRecipe: true, availableOnline: true }),
  product("p_r_2", "t_restaurant", "Beef Burger", "RES-002", "Fast Food", "ABC Kitchen", 120, 220, "piece", 28, 8, true, { prepTime: 12, kitchenStation: "Grill", hasRecipe: true, availableOnline: true }),
  product("p_r_3", "t_restaurant", "Cold Coffee", "RES-003", "Beverage", "ABC Kitchen", 55, 140, "glass", 18, 10, true, { prepTime: 6, kitchenStation: "Beverage", hasRecipe: true, availableOnline: true }),
  product("p_p_1", "t_pharmacy", "Paracetamol 500mg", "MED-001", "Tablet", "Square", 1.4, 2, "piece", 2200, 300, true, { genericName: "Paracetamol", manufacturer: "Square", batchNo: "NP-26A", expiryDate: "2027-08-31", prescriptionRequired: false, strength: "500mg" }),
  product("p_p_2", "t_pharmacy", "Omeprazole 20mg", "MED-002", "Capsule", "Beximco", 4.9, 7, "piece", 780, 120, true, { genericName: "Omeprazole", manufacturer: "Beximco", batchNo: "OM-14B", expiryDate: "2027-03-31", prescriptionRequired: false, strength: "20mg" }),
  product("p_p_3", "t_pharmacy", "Vitamin C", "MED-003", "Supplement", "ACI", 3.5, 6, "piece", 95, 100, true, { genericName: "Ascorbic Acid", manufacturer: "ACI", batchNo: "VC-10", expiryDate: "2026-12-31", prescriptionRequired: false, strength: "250mg" }),
  product("p_g_1", "t_grocery", "Miniket Rice 5kg", "GRO-001", "Rice", "Local", 370, 420, "bag", 31, 12, true, { weightBased: false, packSize: "5kg", cartonQty: 0, mrp: 430 }),
  product("p_g_2", "t_grocery", "Fresh Milk 1L", "GRO-002", "Dairy", "Pran", 82, 95, "bottle", 21, 15, true, { weightBased: false, packSize: "1L", cartonQty: 12, mrp: 100 }),
  product("p_g_3", "t_grocery", "Soybean Oil 5L", "GRO-003", "Oil", "Rupchanda", 760, 820, "bottle", 7, 10, true, { weightBased: false, packSize: "5L", cartonQty: 4, mrp: 840 }),
  product("p_t_1", "t_retail", "Cotton T-Shirt", "RET-001", "Apparel", "Aarong", 520, 850, "piece", 16, 6, true, { color: "Navy", size: "M", warranty: "N/A", serialRequired: false }),
  product("p_t_2", "t_retail", "Bluetooth Earbuds", "RET-002", "Accessories", "Oraimo", 1350, 1890, "piece", 11, 5, true, { color: "Black", size: "Standard", warranty: "6 months", serialRequired: true }),
];

/**
 * @param {string} id
 * @param {string} tenantId
 * @param {string} name
 * @param {string} sku
 * @param {string} category
 * @param {string} brand
 * @param {number} purchasePrice
 * @param {number} salePrice
 * @param {string} unit
 * @param {number} stock
 * @param {number} minimumStock
 * @param {boolean} featured
 * @param {import('../domain/types.js').Product['attributes']} attributes
 * @returns {import('../domain/types.js').Product}
 */
function product(id, tenantId, name, sku, category, brand, purchasePrice, salePrice, unit, stock, minimumStock, featured, attributes) {
  return {
    id,
    tenantId,
    name,
    sku,
    barcode: sku.replace(/\D/g, "").padStart(8, "0"),
    category,
    brand,
    purchasePrice,
    salePrice,
    unit,
    stock,
    minimumStock,
    featured,
    active: true,
    attributes,
  };
}

/** @type {import('../domain/types.js').Order[]} */
export const orders = [
  order("o_1", "t_restaurant", "ORD-1001", "Received", "Cash", 1280, "synced"),
  order("o_2", "t_restaurant", "ORD-1002", "Preparing", "bKash", 720, "queued"),
  order("o_3", "t_pharmacy", "ORD-2001", "Awaiting Pharmacist", "Nagad", 1120, "queued"),
  order("o_4", "t_grocery", "ORD-3001", "Completed", "Bangla QR", 960, "synced"),
  order("o_5", "t_retail", "ORD-4001", "Completed", "Card", 1890, "synced"),
];

/**
 * @param {string} id
 * @param {string} tenantId
 * @param {string} orderNo
 * @param {import('../domain/types.js').OrderStatus} status
 * @param {import('../domain/types.js').PaymentMethod} paymentMethod
 * @param {number} total
 * @param {'queued'|'synced'} syncStatus
 * @returns {import('../domain/types.js').Order}
 */
function order(id, tenantId, orderNo, status, paymentMethod, total, syncStatus) {
  return { id, tenantId, branchId: `${tenantId}_b1`, orderNo, date: "2026-10-07", source: orderNo.startsWith("ORD-2") ? "storefront" : "pos", status, paymentMethod, total, syncStatus };
}

/** @type {import('../domain/types.js').Supplier[]} */
export const suppliers = [
  supplier("s_1", "t_restaurant", "Fresh Meat BD", "Meat and poultry", "01710000001", 32000, 76500),
  supplier("s_2", "t_restaurant", "Spice Market", "Rice and spice", "01710000002", 12800, 33400),
  supplier("s_3", "t_pharmacy", "Square Distribution", "Medicine", "01710000003", 52000, 118000),
  supplier("s_4", "t_grocery", "Daily Bazaar Wholesale", "Grocery", "01710000004", 27800, 85000),
  supplier("s_5", "t_retail", "Fashion Wholesale", "Apparel", "01710000005", 9400, 19200),
];

/**
 * @param {string} id
 * @param {string} tenantId
 * @param {string} name
 * @param {string} category
 * @param {string} phone
 * @param {number} payable
 * @param {number} lastPurchase
 * @returns {import('../domain/types.js').Supplier}
 */
function supplier(id, tenantId, name, category, phone, payable, lastPurchase) {
  return { id, tenantId, name, category, phone, payable, lastPurchase };
}

/** @type {import('../domain/types.js').StaffMember[]} */
export const staff = [
  staffMember("e_1", "t_restaurant", "Nusrat Jahan", "manager", "10:00 AM - 8:00 PM", 32000, "Present"),
  staffMember("e_2", "t_restaurant", "Mamun Chef", "kitchenStaff", "11:00 AM - 11:00 PM", 38000, "Present"),
  staffMember("e_3", "t_pharmacy", "Dr. Imran Kabir", "pharmacist", "9:00 AM - 5:00 PM", 42000, "Present"),
  staffMember("e_4", "t_grocery", "Arif Hossain", "cashier", "12:00 PM - 10:00 PM", 22000, "On break"),
  staffMember("e_5", "t_retail", "Jamal Uddin", "salesStaff", "10:00 AM - 8:00 PM", 18000, "Present"),
];

/**
 * @param {string} id
 * @param {string} tenantId
 * @param {string} name
 * @param {import('../domain/types.js').RoleId} role
 * @param {string} shift
 * @param {number} salary
 * @param {'Present'|'Absent'|'On break'} status
 * @returns {import('../domain/types.js').StaffMember}
 */
function staffMember(id, tenantId, name, role, shift, salary, status) {
  return { id, tenantId, name, role, shift, salary, status };
}

/** @type {import('../domain/types.js').Customer[]} */
export const customers = [
  { id: "c_1", tenantId: "t_restaurant", name: "Rahim Ahmed", phone: "01712345678", totalSpend: 15400, due: 0, loyaltyPoints: 180 },
  { id: "c_2", tenantId: "t_pharmacy", name: "Sabina Akter", phone: "01812345678", totalSpend: 6400, due: 300, loyaltyPoints: 72 },
  { id: "c_3", tenantId: "t_grocery", name: "Mizanur Rahman", phone: "01912345678", totalSpend: 22100, due: 850, loyaltyPoints: 220 },
  { id: "c_4", tenantId: "t_retail", name: "Nabila Khan", phone: "01612345678", totalSpend: 12890, due: 0, loyaltyPoints: 99 },
];
