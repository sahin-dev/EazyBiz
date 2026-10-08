export type BusinessType =
  | "restaurant"
  | "cafe"
  | "cloudKitchen"
  | "pharmacy"
  | "grocery"
  | "superShop"
  | "bakery"
  | "retail"
  | "electronics"
  | "cosmetics";

export type ModuleId =
  | "pos"
  | "inventory"
  | "suppliers"
  | "customers"
  | "staff"
  | "reports"
  | "storefront"
  | "websiteBuilder"
  | "restaurantTables"
  | "restaurantKitchen"
  | "pharmacy"
  | "barcodeScale"
  | "crm"
  | "multiBranch"
  | "marketing";

export type RoleId =
  | "owner"
  | "admin"
  | "platformAdmin"
  | "manager"
  | "cashier"
  | "inventoryManager"
  | "salesStaff"
  | "accountant"
  | "kitchenStaff"
  | "pharmacist"
  | "deliveryStaff";

export type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Processing"
  | "Ready"
  | "Out for delivery"
  | "Completed"
  | "Cancelled"
  | "Refunded"
  | "Received"
  | "Preparing"
  | "Served"
  | "Prescription Required"
  | "Awaiting Pharmacist"
  | "Approved"
  | "Rejected";

export type PaymentMethod =
  | "Cash"
  | "Card"
  | "bKash"
  | "Nagad"
  | "Rocket"
  | "Bangla QR"
  | "Bank transfer"
  | "Manual"
  | "Due";

export interface ModuleDefinition {
  id: ModuleId;
  name: string;
  monthlyPrice: number;
  summary: string;
  businessTypes: BusinessType[];
  permissions: string[];
  available: boolean;
}

export type PlanCode = "starter" | "business";
export type BillingInterval = "monthly" | "yearly";

export interface PlanDefinition {
  code: PlanCode;
  name: string;
  monthlyBasePrice: number;
}

export const planCatalog: PlanDefinition[] = [
  { code: "starter", name: "Starter", monthlyBasePrice: 0 },
  { code: "business", name: "Business", monthlyBasePrice: 2490 },
];

export const allBusinessTypes: BusinessType[] = [
  "restaurant",
  "cafe",
  "cloudKitchen",
  "pharmacy",
  "grocery",
  "superShop",
  "bakery",
  "retail",
  "electronics",
  "cosmetics",
];

export const moduleCatalog: ModuleDefinition[] = [
  { id: "pos", name: "POS Core", monthlyPrice: 1200, summary: "Fast billing, tax, discounts, dues, and local payment records.", businessTypes: allBusinessTypes, permissions: ["sale:create"], available: true },
  { id: "inventory", name: "Inventory", monthlyPrice: 900, summary: "Stock levels, adjustments, movement history, and low-stock alerts.", businessTypes: allBusinessTypes, permissions: ["inventory:view", "inventory:adjust"], available: true },
  { id: "suppliers", name: "Suppliers & Purchase", monthlyPrice: 650, summary: "Supplier directory, purchase receipts, and payable balances.", businessTypes: allBusinessTypes, permissions: ["supplier:view", "purchase:create"], available: true },
  { id: "customers", name: "Customers", monthlyPrice: 400, summary: "Customer profiles, balances, and loyalty points.", businessTypes: allBusinessTypes, permissions: ["customer:view", "customer:create"], available: true },
  { id: "staff", name: "Staff Directory", monthlyPrice: 700, summary: "Employee records, roles, shifts, and salary fields.", businessTypes: allBusinessTypes, permissions: ["staff:view", "staff:manage"], available: true },
  { id: "reports", name: "Reports", monthlyPrice: 600, summary: "Sales trends, order totals, and payment mix.", businessTypes: allBusinessTypes, permissions: ["report:view"], available: true },
  { id: "storefront", name: "Online Storefront", monthlyPrice: 1000, summary: "Public catalog and pay-on-delivery or pickup orders.", businessTypes: allBusinessTypes, permissions: ["storefront:view"], available: true },
  { id: "websiteBuilder", name: "Website Builder", monthlyPrice: 700, summary: "Editable sections, themes, and responsive storefront previews.", businessTypes: allBusinessTypes, permissions: ["builder:edit"], available: true },
  { id: "restaurantTables", name: "Table Management", monthlyPrice: 500, summary: "Table availability, dine-in orders, and settlement.", businessTypes: ["restaurant", "cafe"], permissions: ["table:view", "table:manage"], available: true },
  { id: "restaurantKitchen", name: "Kitchen Display", monthlyPrice: 750, summary: "Kitchen tickets and preparation status.", businessTypes: ["restaurant", "cafe", "cloudKitchen", "bakery"], permissions: ["kitchen:view", "kitchen:update"], available: true },
  { id: "pharmacy", name: "Pharmacy Workflow", monthlyPrice: 850, summary: "Prescription verification and batch dispensing (planned).", businessTypes: ["pharmacy"], permissions: ["medicine:view", "prescription:approve"], available: false },
  { id: "barcodeScale", name: "Barcode & Scale", monthlyPrice: 550, summary: "Scale and barcode hardware integration (planned).", businessTypes: ["grocery", "superShop", "retail", "electronics", "cosmetics"], permissions: ["barcode:print", "scale:use"], available: false },
  { id: "crm", name: "CRM & Loyalty", monthlyPrice: 600, summary: "Customer groups and campaigns (planned).", businessTypes: allBusinessTypes, permissions: ["crm:view", "campaign:send"], available: false },
  { id: "multiBranch", name: "Multi-Branch", monthlyPrice: 1200, summary: "Transfers and branch administration (planned).", businessTypes: allBusinessTypes, permissions: ["branch:view", "branch:transfer"], available: false },
  { id: "marketing", name: "Marketing", monthlyPrice: 500, summary: "Promotions and campaigns (planned).", businessTypes: allBusinessTypes, permissions: ["promotion:manage"], available: false },
];

export function calculateSubscriptionAmount(planCode: PlanCode, moduleIds: ModuleId[], interval: BillingInterval) {
  const basePrice = planCatalog.find((plan) => plan.code === planCode)?.monthlyBasePrice;
  if (basePrice === undefined) throw new Error(`Unknown subscription plan: ${planCode}`);
  const modulePrices = new Map(moduleCatalog.map((module) => [module.id, module.monthlyPrice]));
  const moduleTotal = [...new Set(moduleIds)].reduce((total, id) => {
    const price = modulePrices.get(id);
    if (price === undefined) throw new Error(`Unknown subscription module: ${id}`);
    return total + (moduleCatalog.find((module) => module.id === id)?.available ? price : 0);
  }, 0);
  const intervalMultiplier = interval === "yearly" ? 12 : 1;
  return Math.round((basePrice + moduleTotal) * intervalMultiplier * 100) / 100;
}

export interface ProductAttributeDefinition {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "boolean" | "select";
  sensitive?: boolean;
}

export interface DashboardWidgetDefinition {
  id: string;
  label: string;
  moduleId?: ModuleId;
}

export interface BusinessTypeConfig {
  id: BusinessType;
  name: string;
  shortName: string;
  recommendedModules: ModuleId[];
  dashboardWidgets: DashboardWidgetDefinition[];
  productAttributes: ProductAttributeDefinition[];
  orderStatuses: OrderStatus[];
  storefrontTheme: string;
  setupTasks: string[];
}

export interface TenantSummary {
  id: string;
  name: string;
  businessType: BusinessType;
  plan: string;
  enabledModules: ModuleId[];
  storefrontStatus: "draft" | "published";
}

export interface ProductSummary {
  id: string;
  name: string;
  imageUrl?: string | null;
  sku: string;
  barcode?: string | null;
  category: string;
  salePrice: number;
  discountPrice?: number | null;
  stock: number;
  minimumStock: number;
  unit: string;
  featured: boolean;
  attributes: Record<string, string | number | boolean | null>;
}

export function requiresPrescription(attributes: unknown): boolean {
  if (!attributes || typeof attributes !== "object" || Array.isArray(attributes)) return false;
  const value = (attributes as Record<string, unknown>).prescriptionRequired;
  return value === true || value === "true";
}

export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export interface OrderSummary {
  id: string;
  orderNo: string;
  source: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  total: number;
  syncStatus: "queued" | "synced";
  createdAt: string;
}

export const businessTypeConfigs: Record<BusinessType, BusinessTypeConfig> = {
  restaurant: {
    id: "restaurant",
    name: "Restaurant",
    shortName: "Restaurant",
    recommendedModules: ["pos", "inventory", "suppliers", "customers", "restaurantTables", "restaurantKitchen", "storefront", "websiteBuilder", "staff", "reports"],
    dashboardWidgets: [
      { id: "sales", label: "Today's Sales" },
      { id: "orders", label: "Open Orders" },
      { id: "kitchen", label: "Kitchen Orders", moduleId: "restaurantKitchen" },
      { id: "tables", label: "Active Tables", moduleId: "restaurantTables" },
      { id: "lowStock", label: "Low Stock", moduleId: "inventory" },
    ],
    productAttributes: [
      { key: "prepTime", label: "Preparation time", type: "number" },
      { key: "kitchenStation", label: "Kitchen station", type: "text" },
      { key: "hasRecipe", label: "Recipe enabled", type: "boolean" },
    ],
    orderStatuses: ["Received", "Preparing", "Ready", "Served", "Completed", "Cancelled", "Refunded"],
    storefrontTheme: "Elegant food menu",
    setupTasks: ["Create menu items", "Configure kitchen stations", "Add tables", "Publish online menu"],
  },
  cafe: {
    id: "cafe",
    name: "Cafe",
    shortName: "Cafe",
    recommendedModules: ["pos", "inventory", "suppliers", "customers", "restaurantKitchen", "storefront", "websiteBuilder", "staff", "reports"],
    dashboardWidgets: [{ id: "sales", label: "Today's Sales" }, { id: "topItems", label: "Top Drinks" }, { id: "lowStock", label: "Low Stock", moduleId: "inventory" }],
    productAttributes: [{ key: "prepTime", label: "Preparation time", type: "number" }, { key: "temperature", label: "Hot/cold", type: "select" }],
    orderStatuses: ["Received", "Preparing", "Ready", "Completed", "Cancelled"],
    storefrontTheme: "Warm cafe catalog",
    setupTasks: ["Add drinks", "Add add-ons", "Configure takeaway", "Publish storefront"],
  },
  cloudKitchen: {
    id: "cloudKitchen",
    name: "Cloud Kitchen",
    shortName: "Cloud Kitchen",
    recommendedModules: ["pos", "inventory", "suppliers", "restaurantKitchen", "storefront", "websiteBuilder", "reports"],
    dashboardWidgets: [{ id: "sales", label: "Today's Sales" }, { id: "onlineOrders", label: "Online Orders", moduleId: "storefront" }, { id: "kitchen", label: "Kitchen Orders", moduleId: "restaurantKitchen" }],
    productAttributes: [{ key: "prepTime", label: "Preparation time", type: "number" }, { key: "virtualBrand", label: "Virtual brand", type: "text" }],
    orderStatuses: ["Received", "Preparing", "Ready", "Out for delivery", "Completed", "Cancelled"],
    storefrontTheme: "Delivery-first food",
    setupTasks: ["Add menu", "Configure delivery zones", "Set prep times", "Publish storefront"],
  },
  pharmacy: {
    id: "pharmacy",
    name: "Pharmacy",
    shortName: "Pharmacy",
    recommendedModules: ["pos", "inventory", "suppliers", "customers", "pharmacy", "storefront", "websiteBuilder", "staff", "reports"],
    dashboardWidgets: [{ id: "sales", label: "Today's Sales" }, { id: "nearExpiry", label: "Near Expiry", moduleId: "pharmacy" }, { id: "prescriptions", label: "Prescription Orders", moduleId: "pharmacy" }, { id: "lowStock", label: "Low Stock Medicines", moduleId: "inventory" }],
    productAttributes: [
      { key: "genericName", label: "Generic name", type: "text" },
      { key: "manufacturer", label: "Manufacturer", type: "text" },
      { key: "batchNo", label: "Batch number", type: "text", sensitive: true },
      { key: "expiryDate", label: "Expiry date", type: "date", sensitive: true },
      { key: "prescriptionRequired", label: "Prescription required", type: "boolean" },
    ],
    orderStatuses: ["Pending", "Prescription Required", "Awaiting Pharmacist", "Approved", "Rejected", "Completed", "Cancelled"],
    storefrontTheme: "Clean healthcare",
    setupTasks: ["Add medicines", "Configure prescription rules", "Set expiry alerts", "Publish pharmacy store"],
  },
  grocery: groceryConfig("grocery", "Grocery Shop", "Grocery"),
  superShop: groceryConfig("superShop", "Super Shop", "Super Shop"),
  bakery: {
    id: "bakery",
    name: "Bakery",
    shortName: "Bakery",
    recommendedModules: ["pos", "inventory", "suppliers", "restaurantKitchen", "storefront", "websiteBuilder", "staff", "reports"],
    dashboardWidgets: [{ id: "sales", label: "Today's Sales" }, { id: "production", label: "Production Batches" }, { id: "expiry", label: "Expiry Alerts" }],
    productAttributes: [{ key: "productionDate", label: "Production date", type: "date" }, { key: "expiryDate", label: "Expiry date", type: "date" }, { key: "hasRecipe", label: "Recipe enabled", type: "boolean" }],
    orderStatuses: ["Received", "Preparing", "Ready", "Completed", "Cancelled"],
    storefrontTheme: "Premium bakery",
    setupTasks: ["Add baked goods", "Set expiry rules", "Add production batches", "Publish bakery store"],
  },
  retail: retailConfig("retail", "Retail", "Retail"),
  electronics: retailConfig("electronics", "Electronics", "Electronics"),
  cosmetics: retailConfig("cosmetics", "Cosmetics", "Cosmetics"),
};

function groceryConfig(id: "grocery" | "superShop", name: string, shortName: string): BusinessTypeConfig {
  return {
    id,
    name,
    shortName,
    recommendedModules: ["pos", "inventory", "suppliers", "customers", "barcodeScale", "storefront", "websiteBuilder", "reports"],
    dashboardWidgets: [{ id: "sales", label: "Today's Sales" }, { id: "fastMoving", label: "Fast Moving Products" }, { id: "lowStock", label: "Low Stock", moduleId: "inventory" }],
    productAttributes: [{ key: "weightBased", label: "Weight based", type: "boolean" }, { key: "packSize", label: "Pack size", type: "text" }, { key: "mrp", label: "MRP", type: "number" }],
    orderStatuses: ["Pending", "Confirmed", "Processing", "Ready", "Completed", "Cancelled", "Refunded"],
    storefrontTheme: id === "superShop" ? "Supermarket catalog" : "High-density grocery",
    setupTasks: ["Add barcodes", "Add suppliers", "Set low stock alerts", "Publish storefront"],
  };
}

function retailConfig(id: "retail" | "electronics" | "cosmetics", name: string, shortName: string): BusinessTypeConfig {
  return {
    id,
    name,
    shortName,
    recommendedModules: ["pos", "inventory", "suppliers", "customers", "barcodeScale", "storefront", "websiteBuilder", "crm", "reports"],
    dashboardWidgets: [{ id: "sales", label: "Today's Sales" }, { id: "returns", label: "Returns" }, { id: "lowStock", label: "Low Stock", moduleId: "inventory" }],
    productAttributes: [{ key: "brand", label: "Brand", type: "text" }, { key: "variant", label: "Variant", type: "text" }, { key: "warranty", label: "Warranty", type: "text" }],
    orderStatuses: ["Pending", "Confirmed", "Processing", "Ready", "Completed", "Cancelled", "Refunded"],
    storefrontTheme: id === "cosmetics" ? "Lifestyle catalog" : "Visual retail",
    setupTasks: ["Add products", "Configure variants", "Set return policy", "Publish storefront"],
  };
}

export function availableRecommendedModules(businessType: BusinessType): ModuleId[] {
  return businessTypeConfigs[businessType].recommendedModules.filter((id) => moduleCatalog.some((module) => module.id === id && module.available));
}
