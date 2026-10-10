import type { BusinessType, ModuleId, OrderStatus, PermissionId, RoleId } from "./index";

export type BusinessTypeInput = BusinessType | "cloud_kitchen" | "super_shop";
export type ProductFieldType = "text" | "number" | "date" | "boolean" | "select";
export type ProductFieldScope = "core" | "attribute";

export interface ProductAttributeDefinition {
  key: string;
  label: string;
  type: ProductFieldType;
  required?: boolean;
  sensitive?: boolean;
  options?: readonly string[];
  placeholder?: string;
}

export interface ProductFieldDefinition extends ProductAttributeDefinition {
  scope: ProductFieldScope;
}

export interface DashboardWidgetDefinition {
  id: string;
  label: string;
  moduleId?: ModuleId;
}

export interface NavigationItemDefinition {
  id: string;
  group: "Overview" | "Sales" | "Catalog" | "Inventory" | "People" | "Operations" | "Growth" | "Admin";
  label: string;
  href: string;
  icon: string;
  moduleId?: ModuleId;
  permission?: PermissionId;
  roles?: RoleId[];
  keywords?: readonly string[];
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  moduleId?: ModuleId;
  steps: readonly string[];
}

export interface ReportDefinition {
  id: string;
  name: string;
  description: string;
  moduleId?: ModuleId;
  metrics: readonly string[];
}

export interface StorefrontThemeDefinition {
  name: string;
  heroTone: string;
  primaryColor: string;
  layout: "menu" | "catalog" | "healthcare" | "market" | "retail";
  defaultSections: ReadonlyArray<{ id: string; type: string; title: string; subtitle?: string; visible: boolean }>;
}

export interface PosConfigurationDefinition {
  saleModes: ReadonlyArray<"counter" | "table" | "takeaway" | "delivery" | "prescription">;
  defaultOrderType: "counter" | "table" | "takeaway" | "delivery";
  serviceRate: number;
  supportsModifiers: boolean;
  supportsKitchenTickets: boolean;
  requiresCustomerForDue: boolean;
  blockedWithoutWorkflow?: string;
}

export interface InventoryBehaviorDefinition {
  tracking: "simple" | "batchExpiry" | "recipe" | "weighted" | "serialized";
  unitStrategy: "piece" | "foodService" | "medicine" | "weightedPack" | "retailVariant";
  allowNegativeStock: boolean;
  lowStockAlerts: boolean;
  expiryAlerts: boolean;
  batchTracking: boolean;
  recipeCosting: boolean;
  cartonConversion: boolean;
  warrantyTracking: boolean;
}

export interface BusinessTypeConfig {
  id: BusinessType;
  code: BusinessType;
  slug: string;
  name: string;
  shortName: string;
  icon: string;
  description: string;
  defaultModules: readonly ModuleId[];
  recommendedModules: ModuleId[];
  defaultNavigation: readonly NavigationItemDefinition[];
  productFields: readonly ProductFieldDefinition[];
  productAttributes: ProductAttributeDefinition[];
  dashboardWidgets: readonly DashboardWidgetDefinition[];
  workflows: readonly WorkflowDefinition[];
  reports: readonly ReportDefinition[];
  storefrontTheme: StorefrontThemeDefinition;
  pos: PosConfigurationDefinition;
  inventory: InventoryBehaviorDefinition;
  orderStatuses: readonly OrderStatus[];
  setupTasks: readonly string[];
}

const coreProductFields: readonly ProductFieldDefinition[] = [
  { scope: "core", key: "name", label: "Product name", type: "text", required: true },
  { scope: "core", key: "sku", label: "SKU", type: "text", required: true },
  { scope: "core", key: "barcode", label: "Barcode", type: "text" },
  { scope: "core", key: "category", label: "Category", type: "text", required: true },
  { scope: "core", key: "brand", label: "Brand", type: "text" },
  { scope: "core", key: "salePrice", label: "Selling price", type: "number", required: true },
  { scope: "core", key: "purchasePrice", label: "Purchase cost", type: "number", required: true },
  { scope: "core", key: "unit", label: "Unit", type: "select", required: true },
  { scope: "core", key: "stock", label: "Opening stock", type: "number", required: true },
  { scope: "core", key: "minimumStock", label: "Reorder level", type: "number", required: true },
];

const baseNavigation: readonly NavigationItemDefinition[] = [
  { id: "dashboard", group: "Overview", label: "Dashboard", href: "/dashboard", icon: "layoutDashboard", permission: "dashboard:view", keywords: ["home", "overview"] },
  { id: "pos", group: "Sales", label: "Point of sale", href: "/pos", icon: "shoppingCart", moduleId: "pos", permission: "sale:create", keywords: ["checkout", "billing", "receipt"] },
  { id: "orders", group: "Sales", label: "Orders", href: "/orders", icon: "clipboardList", moduleId: "pos", permission: "order:view", keywords: ["sales history"] },
  { id: "products", group: "Catalog", label: "Products", href: "/products", icon: "package", moduleId: "inventory", permission: "product:manage", keywords: ["sku", "barcode"] },
  { id: "inventory", group: "Inventory", label: "Stock", href: "/inventory", icon: "boxes", moduleId: "inventory", permission: "inventory:view", keywords: ["movement", "adjustment"] },
  { id: "suppliers", group: "Inventory", label: "Suppliers", href: "/suppliers", icon: "truck", moduleId: "suppliers", permission: "supplier:view", keywords: ["purchase", "vendor"] },
  { id: "customers", group: "People", label: "Customers", href: "/customers", icon: "usersRound", moduleId: "customers", permission: "customer:view", keywords: ["crm", "loyalty"] },
  { id: "staff", group: "People", label: "Staff", href: "/staff", icon: "users", moduleId: "staff", permission: "staff:view", keywords: ["employees", "payroll"] },
  { id: "storefront", group: "Growth", label: "Storefront", href: "/storefront", icon: "store", moduleId: "storefront", permission: "storefront:manage", keywords: ["website", "builder"] },
  { id: "reports", group: "Growth", label: "Reports", href: "/reports", icon: "activity", moduleId: "reports", permission: "report:view", keywords: ["analytics", "export"] },
  { id: "subscription", group: "Growth", label: "Subscription", href: "/subscription", icon: "creditCard", roles: ["owner", "admin"], keywords: ["billing", "modules", "marketplace"] },
  { id: "users", group: "Admin", label: "Users & access", href: "/users", icon: "users", roles: ["owner", "admin"], keywords: ["accounts", "roles", "permissions", "invitations"] },
  { id: "audit", group: "Admin", label: "Audit log", href: "/audit", icon: "fileClock", roles: ["owner", "admin"], keywords: ["activity", "events", "security"] },
];

const kitchenNavigation: NavigationItemDefinition = { id: "kitchen", group: "Operations", label: "Kitchen", href: "/kitchen", icon: "chefHat", moduleId: "restaurantKitchen", permission: "kitchen:view", keywords: ["kds", "kot"] };
const tableNavigation: NavigationItemDefinition = { id: "tables", group: "Operations", label: "Tables", href: "/tables", icon: "table2", moduleId: "restaurantTables", permission: "table:view", keywords: ["floor", "dine in"] };

const commonReports: readonly ReportDefinition[] = [
  { id: "salesSummary", name: "Sales summary", description: "Sales, discounts, tax, service charge, dues, and refunds by date range.", moduleId: "reports", metrics: ["totalSales", "orderCount", "averageOrder", "refundAmount"] },
  { id: "paymentMix", name: "Payment mix", description: "Cash, card, MFS, due, and manual collection totals.", moduleId: "reports", metrics: ["cash", "card", "mobileWallet", "due"] },
  { id: "stockValue", name: "Stock value", description: "Inventory value, low-stock products, and movement counts.", moduleId: "inventory", metrics: ["skuCount", "stockValue", "lowStockCount"] },
];

function theme(name: string, layout: StorefrontThemeDefinition["layout"], primaryColor: string, heroTone: string): StorefrontThemeDefinition {
  return {
    name,
    layout,
    primaryColor,
    heroTone,
    defaultSections: [
      { id: "hero", type: "hero", title: "Welcome", subtitle: "Order online for delivery or pickup.", visible: true },
      { id: "categories", type: "categories", title: "Shop by category", subtitle: "Find what you need quickly.", visible: true },
      { id: "featured", type: "featuredProducts", title: "Featured products", subtitle: "Popular with our customers.", visible: true },
      { id: "products", type: "products", title: "Catalog", subtitle: "Live products from POS inventory.", visible: true },
      { id: "branches", type: "branches", title: "Locations", subtitle: "Choose a branch near you.", visible: true },
    ],
  };
}

function withCoreFields(attributes: readonly ProductAttributeDefinition[]): readonly ProductFieldDefinition[] {
  return [...coreProductFields, ...attributes.map((attribute) => ({ ...attribute, scope: "attribute" as const }))];
}

function config(input: Omit<BusinessTypeConfig, "code" | "recommendedModules" | "productFields" | "productAttributes"> & {
  defaultModules: readonly ModuleId[];
  productAttributes: readonly ProductAttributeDefinition[];
}): BusinessTypeConfig {
  return {
    ...input,
    code: input.id,
    defaultModules: input.defaultModules,
    recommendedModules: [...input.defaultModules],
    productAttributes: [...input.productAttributes],
    productFields: withCoreFields(input.productAttributes),
  };
}

const restaurantProductAttributes: readonly ProductAttributeDefinition[] = [
  { key: "recipe", label: "Recipe", type: "text", placeholder: "Ingredient list or recipe code" },
  { key: "modifier", label: "Modifier", type: "text", placeholder: "Size, spice, add-on set" },
  { key: "prepTime", label: "Preparation time", type: "number" },
  { key: "kitchenStation", label: "Kitchen station", type: "text" },
  { key: "hasRecipe", label: "Recipe enabled", type: "boolean" },
];

const groceryAttributes: readonly ProductAttributeDefinition[] = [
  { key: "barcode", label: "Barcode", type: "text" },
  { key: "weightBased", label: "Weight based", type: "boolean" },
  { key: "weight", label: "Weight", type: "number" },
  { key: "unit", label: "Unit", type: "select", options: ["piece", "kg", "gram", "liter", "pack", "bag", "carton"] },
  { key: "packSize", label: "Pack size", type: "text" },
  { key: "cartonConversion", label: "Carton conversion", type: "number" },
  { key: "mrp", label: "MRP", type: "number" },
];

const retailAttributes: readonly ProductAttributeDefinition[] = [
  { key: "brand", label: "Brand", type: "text" },
  { key: "variant", label: "Variant", type: "text" },
  { key: "warranty", label: "Warranty", type: "text" },
  { key: "model", label: "Model", type: "text" },
];

const baseInventory: InventoryBehaviorDefinition = {
  tracking: "simple",
  unitStrategy: "piece",
  allowNegativeStock: false,
  lowStockAlerts: true,
  expiryAlerts: false,
  batchTracking: false,
  recipeCosting: false,
  cartonConversion: false,
  warrantyTracking: false,
};

export const businessTypeConfigs: Record<BusinessType, BusinessTypeConfig> = {
  restaurant: config({
    id: "restaurant",
    slug: "restaurant",
    name: "Restaurant",
    shortName: "Restaurant",
    icon: "chefHat",
    description: "Full-service food business with dine-in tables, kitchen tickets, menu modifiers, and inventory-backed recipes.",
    defaultModules: ["pos", "inventory", "purchasing", "suppliers", "customers", "restaurant", "restaurantTables", "restaurantKitchen", "storefront", "websiteBuilder", "staff", "reports"],
    defaultNavigation: [...baseNavigation, kitchenNavigation, tableNavigation],
    dashboardWidgets: [
      { id: "sales", label: "Today's Sales" },
      { id: "orders", label: "Open Orders" },
      { id: "kitchen", label: "Kitchen Orders", moduleId: "restaurantKitchen" },
      { id: "tables", label: "Active Tables", moduleId: "restaurantTables" },
      { id: "lowStock", label: "Low Stock", moduleId: "inventory" },
    ],
    productAttributes: restaurantProductAttributes,
    workflows: [
      { id: "dineIn", name: "Dine-in service", description: "Open a table, send items to kitchen, serve, settle, and release the table.", moduleId: "restaurantTables", steps: ["selectTable", "sendToKitchen", "prepare", "serve", "settle"] },
      { id: "recipeCosting", name: "Recipe costing", description: "Track ingredients, modifiers, preparation time, and kitchen station routing.", moduleId: "inventory", steps: ["defineRecipe", "assignModifiers", "monitorUsage"] },
    ],
    reports: [...commonReports, { id: "kitchenPerformance", name: "Kitchen performance", description: "Preparation flow, ready orders, and served ticket counts.", moduleId: "restaurantKitchen", metrics: ["openTickets", "readyTickets", "servedTickets"] }],
    storefrontTheme: theme("Elegant food menu", "menu", "#146c5c", "Fresh dining experience"),
    pos: { saleModes: ["counter", "table", "takeaway", "delivery"], defaultOrderType: "counter", serviceRate: 5, supportsModifiers: true, supportsKitchenTickets: true, requiresCustomerForDue: true },
    inventory: { ...baseInventory, tracking: "recipe", unitStrategy: "foodService", recipeCosting: true },
    orderStatuses: ["Received", "Preparing", "Ready", "Served", "Completed", "Cancelled", "Refunded"],
    setupTasks: ["Create menu items", "Configure kitchen stations", "Add tables", "Publish online menu"],
  }),
  cafe: config({
    id: "cafe",
    slug: "cafe",
    name: "Cafe",
    shortName: "Cafe",
    icon: "coffee",
    description: "Counter-service cafe with beverage modifiers, quick preparation flow, and optional kitchen tickets.",
    defaultModules: ["pos", "inventory", "purchasing", "suppliers", "customers", "restaurant", "restaurantKitchen", "storefront", "websiteBuilder", "staff", "reports"],
    defaultNavigation: [...baseNavigation, kitchenNavigation],
    dashboardWidgets: [{ id: "sales", label: "Today's Sales" }, { id: "topItems", label: "Top Drinks" }, { id: "lowStock", label: "Low Stock", moduleId: "inventory" }],
    productAttributes: [
      { key: "recipe", label: "Recipe", type: "text" },
      { key: "modifier", label: "Modifier", type: "text" },
      { key: "prepTime", label: "Preparation time", type: "number" },
      { key: "temperature", label: "Hot/cold", type: "select", options: ["Hot", "Cold", "Both"] },
    ],
    workflows: [{ id: "quickService", name: "Quick service", description: "Take counter orders, route drinks, and mark ready for pickup.", moduleId: "pos", steps: ["takeOrder", "prepare", "handoff"] }],
    reports: [...commonReports, { id: "topDrinks", name: "Top drinks", description: "Best-selling beverages and add-ons.", moduleId: "reports", metrics: ["quantity", "sales", "modifierAttachRate"] }],
    storefrontTheme: theme("Warm cafe catalog", "menu", "#8b5a2b", "Warm cafe ordering"),
    pos: { saleModes: ["counter", "takeaway", "delivery"], defaultOrderType: "counter", serviceRate: 0, supportsModifiers: true, supportsKitchenTickets: true, requiresCustomerForDue: true },
    inventory: { ...baseInventory, tracking: "recipe", unitStrategy: "foodService", recipeCosting: true },
    orderStatuses: ["Received", "Preparing", "Ready", "Completed", "Cancelled"],
    setupTasks: ["Add drinks", "Add add-ons", "Configure takeaway", "Publish storefront"],
  }),
  cloudKitchen: config({
    id: "cloudKitchen",
    slug: "cloud_kitchen",
    name: "Cloud Kitchen",
    shortName: "Cloud Kitchen",
    icon: "chefHat",
    description: "Delivery-first kitchen with online orders, preparation statuses, and brand/menu routing.",
    defaultModules: ["pos", "inventory", "purchasing", "suppliers", "restaurant", "restaurantKitchen", "delivery", "storefront", "websiteBuilder", "reports"],
    defaultNavigation: [...baseNavigation, kitchenNavigation],
    dashboardWidgets: [{ id: "sales", label: "Today's Sales" }, { id: "onlineOrders", label: "Online Orders", moduleId: "storefront" }, { id: "kitchen", label: "Kitchen Orders", moduleId: "restaurantKitchen" }],
    productAttributes: [{ key: "recipe", label: "Recipe", type: "text" }, { key: "modifier", label: "Modifier", type: "text" }, { key: "prepTime", label: "Preparation time", type: "number" }, { key: "virtualBrand", label: "Virtual brand", type: "text" }],
    workflows: [{ id: "deliveryProduction", name: "Delivery production", description: "Accept storefront orders, prepare items, and hand off for delivery.", moduleId: "restaurantKitchen", steps: ["receiveOnlineOrder", "prepare", "pack", "handoff"] }],
    reports: [...commonReports, { id: "onlineOrderMix", name: "Online order mix", description: "Storefront order sources, delivery volume, and kitchen throughput.", moduleId: "storefront", metrics: ["onlineOrders", "deliveryOrders", "averagePrepTime"] }],
    storefrontTheme: theme("Delivery-first food", "menu", "#c2410c", "Delivery-ready meals"),
    pos: { saleModes: ["takeaway", "delivery", "counter"], defaultOrderType: "delivery", serviceRate: 0, supportsModifiers: true, supportsKitchenTickets: true, requiresCustomerForDue: true },
    inventory: { ...baseInventory, tracking: "recipe", unitStrategy: "foodService", recipeCosting: true },
    orderStatuses: ["Received", "Preparing", "Ready", "Out for delivery", "Completed", "Cancelled"],
    setupTasks: ["Add menu", "Configure delivery zones", "Set prep times", "Publish storefront"],
  }),
  pharmacy: config({
    id: "pharmacy",
    slug: "pharmacy",
    name: "Pharmacy",
    shortName: "Pharmacy",
    icon: "pill",
    description: "Medicine and wellness retail with batch, expiry, manufacturer, and prescription-aware sales behavior.",
    defaultModules: ["pos", "inventory", "purchasing", "suppliers", "customers", "pharmacy", "storefront", "websiteBuilder", "staff", "reports"],
    defaultNavigation: baseNavigation,
    dashboardWidgets: [{ id: "sales", label: "Today's Sales" }, { id: "nearExpiry", label: "Near Expiry", moduleId: "pharmacy" }, { id: "prescriptions", label: "Prescription Orders", moduleId: "pharmacy" }, { id: "lowStock", label: "Low Stock Medicines", moduleId: "inventory" }],
    productAttributes: [
      { key: "genericName", label: "Generic", type: "text", required: true },
      { key: "manufacturer", label: "Manufacturer", type: "text", required: true },
      { key: "batchNo", label: "Batch", type: "text", sensitive: true },
      { key: "expiryDate", label: "Expiry", type: "date", sensitive: true },
      { key: "prescriptionRequired", label: "Prescription required", type: "boolean" },
    ],
    workflows: [{ id: "prescriptionSale", name: "Prescription verification", description: "Flag prescription-required items before dispensing.", moduleId: "pharmacy", steps: ["capturePrescription", "pharmacistReview", "dispense"] }],
    reports: [...commonReports, { id: "expiryRisk", name: "Expiry risk", description: "Batch and expiry risk for medicines.", moduleId: "pharmacy", metrics: ["nearExpiry", "expired", "batchStock"] }],
    storefrontTheme: theme("Clean healthcare", "healthcare", "#0f766e", "Trusted healthcare catalog"),
    pos: { saleModes: ["counter", "prescription", "delivery"], defaultOrderType: "counter", serviceRate: 0, supportsModifiers: false, supportsKitchenTickets: false, requiresCustomerForDue: true, blockedWithoutWorkflow: "Prescription-required medicine needs pharmacist approval." },
    inventory: { ...baseInventory, tracking: "batchExpiry", unitStrategy: "medicine", expiryAlerts: true, batchTracking: true },
    orderStatuses: ["Pending", "Prescription Required", "Awaiting Pharmacist", "Approved", "Rejected", "Completed", "Cancelled"],
    setupTasks: ["Add medicines", "Configure prescription rules", "Set expiry alerts", "Publish pharmacy store"],
  }),
  grocery: groceryConfig("grocery", "grocery", "Grocery Shop", "Grocery", "High-density grocery", "#15803d"),
  superShop: groceryConfig("superShop", "super_shop", "Super Shop", "Super Shop", "Supermarket catalog", "#0369a1"),
  bakery: config({
    id: "bakery",
    slug: "bakery",
    name: "Bakery",
    shortName: "Bakery",
    icon: "cakeSlice",
    description: "Bakery production and retail with recipes, batches, expiry alerts, and storefront ordering.",
    defaultModules: ["pos", "inventory", "purchasing", "suppliers", "restaurant", "restaurantKitchen", "storefront", "websiteBuilder", "staff", "reports"],
    defaultNavigation: [...baseNavigation, kitchenNavigation],
    dashboardWidgets: [{ id: "sales", label: "Today's Sales" }, { id: "production", label: "Production Batches" }, { id: "expiry", label: "Expiry Alerts" }],
    productAttributes: [{ key: "recipe", label: "Recipe", type: "text" }, { key: "productionDate", label: "Production date", type: "date" }, { key: "expiryDate", label: "Expiry date", type: "date" }, { key: "hasRecipe", label: "Recipe enabled", type: "boolean" }],
    workflows: [{ id: "productionBatch", name: "Production batch", description: "Plan batches, produce goods, track freshness, and sell through POS/storefront.", moduleId: "restaurantKitchen", steps: ["planBatch", "produce", "labelExpiry", "sell"] }],
    reports: [...commonReports, { id: "wastage", name: "Wastage", description: "Expired, damaged, and written-off bakery stock.", moduleId: "inventory", metrics: ["wastageQuantity", "wastageCost"] }],
    storefrontTheme: theme("Premium bakery", "menu", "#be123c", "Fresh bakery ordering"),
    pos: { saleModes: ["counter", "takeaway", "delivery"], defaultOrderType: "counter", serviceRate: 0, supportsModifiers: true, supportsKitchenTickets: true, requiresCustomerForDue: true },
    inventory: { ...baseInventory, tracking: "recipe", unitStrategy: "foodService", expiryAlerts: true, recipeCosting: true },
    orderStatuses: ["Received", "Preparing", "Ready", "Completed", "Cancelled"],
    setupTasks: ["Add baked goods", "Set expiry rules", "Add production batches", "Publish bakery store"],
  }),
  retail: retailConfig("retail", "Retail", "Retail", "Visual retail", "#4f46e5"),
  electronics: retailConfig("electronics", "Electronics", "Electronics", "Electronics catalog", "#334155", true),
  cosmetics: retailConfig("cosmetics", "Cosmetics", "Cosmetics", "Lifestyle catalog", "#be185d"),
};

function groceryConfig(id: "grocery" | "superShop", slug: string, name: string, shortName: string, themeName: string, primaryColor: string): BusinessTypeConfig {
  return config({
    id,
    slug,
    name,
    shortName,
    icon: id === "superShop" ? "store" : "shoppingBasket",
    description: "Fast-moving retail with barcode, weight, pack-size, carton conversion, and low-stock controls.",
    defaultModules: ["pos", "inventory", "purchasing", "suppliers", "customers", "grocery", "storefront", "websiteBuilder", "reports"],
    defaultNavigation: baseNavigation,
    dashboardWidgets: [{ id: "sales", label: "Today's Sales" }, { id: "fastMoving", label: "Fast Moving Products" }, { id: "lowStock", label: "Low Stock", moduleId: "inventory" }],
    productAttributes: groceryAttributes,
    workflows: [{ id: "barcodeCheckout", name: "Barcode checkout", description: "Scan items, support weighted products, and convert packs/cartons for stock.", moduleId: "grocery", steps: ["scanBarcode", "weighIfNeeded", "convertPack", "checkout"] }],
    reports: [...commonReports, { id: "fastMoving", name: "Fast-moving products", description: "Highest-velocity products and replenishment needs.", moduleId: "reports", metrics: ["quantity", "sales", "stockDays"] }],
    storefrontTheme: theme(themeName, "market", primaryColor, "Everyday essentials"),
    pos: { saleModes: ["counter", "delivery"], defaultOrderType: "counter", serviceRate: 0, supportsModifiers: false, supportsKitchenTickets: false, requiresCustomerForDue: true },
    inventory: { ...baseInventory, tracking: "weighted", unitStrategy: "weightedPack", cartonConversion: true },
    orderStatuses: ["Pending", "Confirmed", "Processing", "Ready", "Completed", "Cancelled", "Refunded"],
    setupTasks: ["Add barcodes", "Add suppliers", "Set low stock alerts", "Publish storefront"],
  });
}

function retailConfig(id: "retail" | "electronics" | "cosmetics", name: string, shortName: string, themeName: string, primaryColor: string, warrantyTracking = false): BusinessTypeConfig {
  return config({
    id,
    slug: id,
    name,
    shortName,
    icon: id === "electronics" ? "cpu" : id === "cosmetics" ? "sparkles" : "shoppingBag",
    description: warrantyTracking
      ? "Electronics retail with brands, models, variants, warranties, and stock visibility."
      : "Retail catalog with brands, variants, stock controls, customer history, and storefront publishing.",
    defaultModules: ["pos", "inventory", "purchasing", "suppliers", "customers", "retail", "storefront", "websiteBuilder", "reports"],
    defaultNavigation: baseNavigation,
    dashboardWidgets: [{ id: "sales", label: "Today's Sales" }, { id: "returns", label: "Returns" }, { id: "lowStock", label: "Low Stock", moduleId: "inventory" }],
    productAttributes: warrantyTracking ? [...retailAttributes, { key: "serialRequired", label: "Serial required", type: "boolean" }] : retailAttributes,
    workflows: [{ id: "variantSale", name: "Variant sale", description: "Sell by brand, model, variant, barcode, and customer record.", moduleId: "pos", steps: ["selectVariant", "scanBarcode", "checkout", "captureCustomer"] }],
    reports: [...commonReports, { id: "returns", name: "Returns", description: "Returned orders, refund amounts, and stock disposition.", moduleId: "reports", metrics: ["returnCount", "refundAmount", "restockedQuantity"] }],
    storefrontTheme: theme(themeName, "retail", primaryColor, "Curated product catalog"),
    pos: { saleModes: ["counter", "delivery"], defaultOrderType: "counter", serviceRate: 0, supportsModifiers: false, supportsKitchenTickets: false, requiresCustomerForDue: true },
    inventory: { ...baseInventory, tracking: warrantyTracking ? "serialized" : "simple", unitStrategy: "retailVariant", warrantyTracking },
    orderStatuses: ["Pending", "Confirmed", "Processing", "Ready", "Completed", "Cancelled", "Refunded"],
    setupTasks: ["Add products", "Configure variants", "Set return policy", "Publish storefront"],
  });
}

export function normalizeBusinessType(value: BusinessTypeInput): BusinessType {
  if (value === "cloud_kitchen") return "cloudKitchen";
  if (value === "super_shop") return "superShop";
  return value;
}

export function getBusinessTypeConfig(value: BusinessTypeInput): BusinessTypeConfig {
  return businessTypeConfigs[normalizeBusinessType(value)];
}

export function businessTypeOptions() {
  return Object.values(businessTypeConfigs).map(({ id, slug, name, shortName, icon, description }) => ({ id, slug, name, shortName, icon, description }));
}

export function sanitizeProductAttributes(businessType: BusinessTypeInput, attributes: Record<string, unknown>) {
  const definitions = new Map(getBusinessTypeConfig(businessType).productAttributes.map((attribute) => [attribute.key, attribute]));
  return Object.entries(attributes).reduce<Record<string, string | number | boolean | null>>((next, [key, value]) => {
    const definition = definitions.get(key);
    if (!definition) return next;
    if (value === "" || value === undefined) {
      next[key] = null;
      return next;
    }
    if (definition.type === "boolean") next[key] = value === true || value === "true";
    else if (definition.type === "number") next[key] = typeof value === "number" ? value : Number(value);
    else next[key] = value === null ? null : String(value);
    return next;
  }, {});
}

