// @ts-check

/** @type {import('../domain/types.js').ModuleDefinition[]} */
export const modules = [
  {
    id: "pos",
    name: "POS Core",
    monthlyPrice: 1200,
    summary: "Fast billing, returns, payments, local receipt, offline queue.",
    businessTypes: ["restaurant", "cafe", "cloudKitchen", "pharmacy", "grocery", "superShop", "bakery", "retail", "electronics", "cosmetics"],
    permissions: ["sale:create", "sale:refund", "register:close"],
  },
  {
    id: "inventory",
    name: "Inventory",
    monthlyPrice: 900,
    summary: "Branch stock, movement history, transfer, low-stock, wastage.",
    businessTypes: ["restaurant", "cafe", "cloudKitchen", "pharmacy", "grocery", "superShop", "bakery", "retail", "electronics", "cosmetics"],
    permissions: ["inventory:view", "inventory:adjust", "purchase:receive"],
  },
  {
    id: "suppliers",
    name: "Suppliers & Purchase",
    monthlyPrice: 650,
    summary: "Supplier ledger, payables, purchase orders, receive notes.",
    businessTypes: ["restaurant", "cafe", "cloudKitchen", "pharmacy", "grocery", "superShop", "bakery", "retail", "electronics", "cosmetics"],
    permissions: ["supplier:view", "supplier:pay", "purchase:create"],
  },
  {
    id: "customers",
    name: "Customers",
    monthlyPrice: 400,
    summary: "Customer profiles, dues, order history, loyalty-ready CRM.",
    businessTypes: ["restaurant", "cafe", "cloudKitchen", "pharmacy", "grocery", "superShop", "bakery", "retail", "electronics", "cosmetics"],
    permissions: ["customer:view", "customer:create"],
  },
  {
    id: "storefront",
    name: "Online Storefront",
    monthlyPrice: 1000,
    summary: "Public catalog, cart, checkout, order tracking, branch-aware stock.",
    businessTypes: ["restaurant", "cafe", "cloudKitchen", "pharmacy", "grocery", "superShop", "bakery", "retail", "electronics", "cosmetics"],
    permissions: ["storefront:view", "storefront:publish"],
  },
  {
    id: "websiteBuilder",
    name: "Website Builder",
    monthlyPrice: 700,
    summary: "Drag-and-drop sections, theme presets, responsive previews.",
    businessTypes: ["restaurant", "cafe", "cloudKitchen", "pharmacy", "grocery", "superShop", "bakery", "retail", "electronics", "cosmetics"],
    permissions: ["builder:edit"],
  },
  {
    id: "restaurantTables",
    name: "Tables",
    monthlyPrice: 500,
    summary: "Floor plan, table merge/split, waiter assignment, active covers.",
    businessTypes: ["restaurant", "cafe"],
    permissions: ["table:view", "table:manage"],
  },
  {
    id: "restaurantKitchen",
    name: "Kitchen Display",
    monthlyPrice: 750,
    summary: "KOT routing, stations, prep statuses, kitchen performance.",
    businessTypes: ["restaurant", "cafe", "cloudKitchen", "bakery"],
    permissions: ["kitchen:view", "kitchen:update"],
  },
  {
    id: "pharmacy",
    name: "Pharmacy Workflow",
    monthlyPrice: 850,
    summary: "Batch, expiry, generic, manufacturer, prescription workflow.",
    businessTypes: ["pharmacy"],
    permissions: ["medicine:view", "prescription:approve"],
  },
  {
    id: "barcodeScale",
    name: "Barcode & Scale",
    monthlyPrice: 550,
    summary: "Barcode labels, fast scan checkout, weight products, unit conversion.",
    businessTypes: ["grocery", "superShop", "retail", "electronics", "cosmetics"],
    permissions: ["barcode:print", "scale:use"],
  },
  {
    id: "staff",
    name: "Staff & Payroll",
    monthlyPrice: 700,
    summary: "Employees, roles, attendance, shifts, payroll-ready records.",
    businessTypes: ["restaurant", "cafe", "cloudKitchen", "pharmacy", "grocery", "superShop", "bakery", "retail", "electronics", "cosmetics"],
    permissions: ["staff:view", "staff:manage", "payroll:view"],
  },
  {
    id: "reports",
    name: "Reports",
    monthlyPrice: 600,
    summary: "Sales, profit, products, stock, suppliers, branch summaries.",
    businessTypes: ["restaurant", "cafe", "cloudKitchen", "pharmacy", "grocery", "superShop", "bakery", "retail", "electronics", "cosmetics"],
    permissions: ["report:view", "profit:view"],
  },
  {
    id: "crm",
    name: "CRM & Loyalty",
    monthlyPrice: 600,
    summary: "Customer groups, points, coupons, SMS campaign hooks.",
    businessTypes: ["restaurant", "cafe", "cloudKitchen", "pharmacy", "grocery", "superShop", "bakery", "retail", "electronics", "cosmetics"],
    permissions: ["crm:view", "campaign:send"],
  },
  {
    id: "multiBranch",
    name: "Multi-Branch",
    monthlyPrice: 1200,
    summary: "Central catalog, branch stock, transfers, consolidated reporting.",
    businessTypes: ["restaurant", "cafe", "cloudKitchen", "pharmacy", "grocery", "superShop", "bakery", "retail", "electronics", "cosmetics"],
    permissions: ["branch:view", "branch:transfer"],
  },
  {
    id: "marketing",
    name: "Marketing",
    monthlyPrice: 500,
    summary: "Promotions, coupons, campaigns, storefront banners.",
    businessTypes: ["restaurant", "cafe", "cloudKitchen", "pharmacy", "grocery", "superShop", "bakery", "retail", "electronics", "cosmetics"],
    permissions: ["promotion:manage"],
  },
];

/**
 * @param {import('../domain/types.js').ModuleId} id
 */
export function getModule(id) {
  return modules.find((module) => module.id === id);
}
