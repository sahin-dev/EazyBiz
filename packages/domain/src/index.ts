import { businessTypeConfigs, normalizeBusinessType, type BusinessTypeInput } from "./business-config";
export * from "./business-config";

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
  | "purchasing"
  | "suppliers"
  | "customers"
  | "staff"
  | "reports"
  | "storefront"
  | "websiteBuilder"
  | "restaurant"
  | "restaurantTables"
  | "restaurantKitchen"
  | "pharmacy"
  | "grocery"
  | "retail"
  | "barcodeScale"
  | "delivery"
  | "crm"
  | "loyalty"
  | "accounting"
  | "payroll"
  | "multiBranch"
  | "api"
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

export type PermissionId =
  | "dashboard:view"
  | "sale:create"
  | "order:view"
  | "product:view"
  | "product:manage"
  | "inventory:view"
  | "inventory:adjust"
  | "supplier:view"
  | "purchase:create"
  | "purchase:view"
  | "customer:view"
  | "customer:create"
  | "staff:view"
  | "staff:manage"
  | "report:view"
  | "storefront:view"
  | "storefront:manage"
  | "builder:edit"
  | "table:view"
  | "table:manage"
  | "kitchen:view"
  | "kitchen:update"
  | "medicine:view"
  | "prescription:approve"
  | "barcode:print"
  | "scale:use"
  | "crm:view"
  | "loyalty:manage"
  | "accounting:view"
  | "payroll:view"
  | "branch:view"
  | "branch:transfer"
  | "api:use"
  | "campaign:send"
  | "promotion:manage";

const managementPermissions: readonly PermissionId[] = [
  "dashboard:view", "sale:create", "order:view", "product:view", "inventory:view",
  "product:manage",
  "supplier:view", "purchase:view", "customer:view", "staff:view", "report:view",
  "storefront:manage", "table:view", "kitchen:view",
  "inventory:adjust", "purchase:create", "customer:create", "staff:manage",
  "storefront:view", "builder:edit", "table:manage", "kitchen:update",
  "medicine:view", "prescription:approve", "barcode:print", "scale:use",
  "crm:view", "loyalty:manage", "accounting:view", "payroll:view",
  "branch:view", "branch:transfer", "api:use", "campaign:send", "promotion:manage",
];

export const rolePermissions: Record<RoleId, readonly PermissionId[]> = {
  owner: managementPermissions,
  admin: managementPermissions,
  platformAdmin: [],
  manager: managementPermissions,
  cashier: ["sale:create", "order:view", "product:view", "customer:view", "table:view"],
  inventoryManager: ["product:view", "product:manage", "inventory:view", "inventory:adjust", "supplier:view", "purchase:view", "purchase:create"],
  salesStaff: ["sale:create", "order:view", "product:view", "customer:view", "customer:create", "table:view"],
  accountant: ["dashboard:view", "order:view", "product:view", "inventory:view", "supplier:view", "purchase:view", "customer:view", "report:view", "accounting:view"],
  kitchenStaff: ["kitchen:view", "kitchen:update"],
  pharmacist: ["sale:create", "order:view", "product:view", "customer:view", "customer:create", "medicine:view", "prescription:approve"],
  deliveryStaff: [],
};

export function hasPermission(role: string, permission: PermissionId): boolean {
  return rolePermissions[role as RoleId]?.includes(permission) ?? false;
}

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
  permissions: PermissionId[];
  featureFlags: Record<string, boolean>;
  entitlement: "included" | "addon" | "planned";
  available: boolean;
}

export type PlanCode = "starter" | "growth" | "business" | "enterprise";
export type BillingInterval = "monthly" | "yearly";

export interface PlanDefinition {
  code: PlanCode;
  name: string;
  monthlyBasePrice: number;
  description: string;
  limits: UsageLimits;
  includedModules: ModuleId[];
  highlighted?: boolean;
}

export interface UsageLimits {
  branches: number | null;
  users: number | null;
  devices: number | null;
  storageGb: number | null;
  sms: number | null;
}

export const planCatalog: PlanDefinition[] = [
  {
    code: "starter",
    name: "Starter",
    monthlyBasePrice: 0,
    description: "Free trial and lightweight operations for a new single-branch business.",
    limits: { branches: 1, users: 3, devices: 2, storageGb: 1, sms: 100 },
    includedModules: ["pos"],
  },
  {
    code: "growth",
    name: "Growth",
    monthlyBasePrice: 1490,
    description: "Growing shops that need inventory, purchasing, customers, and basic reports.",
    limits: { branches: 2, users: 10, devices: 5, storageGb: 5, sms: 1000 },
    includedModules: ["pos", "inventory", "purchasing", "suppliers", "customers", "reports"],
  },
  {
    code: "business",
    name: "Business",
    monthlyBasePrice: 2490,
    description: "Established teams with storefront, staff, analytics, and modular vertical workflows.",
    limits: { branches: 5, users: 30, devices: 15, storageGb: 25, sms: 5000 },
    includedModules: ["pos", "inventory", "purchasing", "suppliers", "customers", "staff", "reports", "storefront", "websiteBuilder"],
    highlighted: true,
  },
  {
    code: "enterprise",
    name: "Enterprise",
    monthlyBasePrice: 7990,
    description: "Multi-location operations with negotiated limits, integrations, and priority support.",
    limits: { branches: null, users: null, devices: null, storageGb: null, sms: null },
    includedModules: ["pos", "inventory", "purchasing", "suppliers", "customers", "staff", "reports", "storefront", "websiteBuilder", "multiBranch", "api"],
  },
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
  { id: "pos", name: "POS", monthlyPrice: 1200, summary: "Fast billing, tax, discounts, dues, and local payment records.", businessTypes: allBusinessTypes, permissions: ["sale:create"], featureFlags: { checkout: true, discounts: true, dueSales: true }, entitlement: "addon", available: true },
  { id: "inventory", name: "Inventory", monthlyPrice: 900, summary: "Stock levels, adjustments, movement history, and low-stock alerts.", businessTypes: allBusinessTypes, permissions: ["inventory:view", "inventory:adjust"], featureFlags: { stockLedger: true, stockAdjustments: true, lowStockAlerts: true }, entitlement: "addon", available: true },
  { id: "purchasing", name: "Purchasing", monthlyPrice: 650, summary: "Purchase receipts, stock receiving, landed cost capture, and payable balances.", businessTypes: allBusinessTypes, permissions: ["purchase:view", "purchase:create"], featureFlags: { purchaseReceiving: true, purchaseLedger: true }, entitlement: "addon", available: true },
  { id: "suppliers", name: "Suppliers", monthlyPrice: 450, summary: "Supplier directory, contact details, balances, and purchase relationship history.", businessTypes: allBusinessTypes, permissions: ["supplier:view"], featureFlags: { supplierDirectory: true }, entitlement: "addon", available: true },
  { id: "customers", name: "Customers", monthlyPrice: 400, summary: "Customer profiles, balances, and sales history.", businessTypes: allBusinessTypes, permissions: ["customer:view", "customer:create"], featureFlags: { customerDirectory: true, dues: true }, entitlement: "addon", available: true },
  { id: "staff", name: "Staff", monthlyPrice: 700, summary: "Employee records, roles, shifts, and salary fields.", businessTypes: allBusinessTypes, permissions: ["staff:view", "staff:manage"], featureFlags: { staffDirectory: true, shiftTracking: true }, entitlement: "addon", available: true },
  { id: "reports", name: "Reports", monthlyPrice: 600, summary: "Sales trends, order totals, returns, inventory, and payment mix.", businessTypes: allBusinessTypes, permissions: ["report:view"], featureFlags: { salesReports: true, inventoryReports: true, paymentReports: true }, entitlement: "addon", available: true },
  { id: "storefront", name: "Storefront", monthlyPrice: 1000, summary: "Public catalog and pay-on-delivery or pickup orders.", businessTypes: allBusinessTypes, permissions: ["storefront:view", "storefront:manage"], featureFlags: { publicCatalog: true, onlineOrders: true }, entitlement: "addon", available: true },
  { id: "websiteBuilder", name: "Website Builder", monthlyPrice: 700, summary: "Editable sections, themes, and responsive storefront previews.", businessTypes: allBusinessTypes, permissions: ["builder:edit"], featureFlags: { sectionBuilder: true, publishFlow: true }, entitlement: "addon", available: true },
  { id: "restaurant", name: "Restaurant", monthlyPrice: 900, summary: "Restaurant workflows, menu prep behavior, table service, and kitchen operations.", businessTypes: ["restaurant", "cafe", "cloudKitchen", "bakery"], permissions: ["table:view", "kitchen:view"], featureFlags: { menuModifiers: true, recipes: true }, entitlement: "addon", available: true },
  { id: "restaurantTables", name: "Restaurant Tables", monthlyPrice: 500, summary: "Table availability, dine-in orders, and settlement.", businessTypes: ["restaurant", "cafe"], permissions: ["table:view", "table:manage"], featureFlags: { tableService: true }, entitlement: "addon", available: true },
  { id: "restaurantKitchen", name: "Kitchen Display", monthlyPrice: 750, summary: "Kitchen tickets and preparation status.", businessTypes: ["restaurant", "cafe", "cloudKitchen", "bakery"], permissions: ["kitchen:view", "kitchen:update"], featureFlags: { kitchenTickets: true, prepStatus: true }, entitlement: "addon", available: true },
  { id: "pharmacy", name: "Pharmacy", monthlyPrice: 850, summary: "Prescription verification, batch dispensing, and expiry-aware medicine workflows.", businessTypes: ["pharmacy"], permissions: ["medicine:view", "prescription:approve"], featureFlags: { prescriptionReview: false, batchExpiry: true }, entitlement: "addon", available: true },
  { id: "grocery", name: "Grocery", monthlyPrice: 550, summary: "Barcode, weighted products, pack size, and carton conversion workflows.", businessTypes: ["grocery", "superShop"], permissions: ["barcode:print", "scale:use"], featureFlags: { weightedItems: true, cartonConversion: true }, entitlement: "addon", available: true },
  { id: "retail", name: "Retail", monthlyPrice: 550, summary: "Brand, variant, warranty, barcode, and return workflows for retail stores.", businessTypes: ["retail", "electronics", "cosmetics"], permissions: ["barcode:print"], featureFlags: { variants: true, warranties: true }, entitlement: "addon", available: true },
  { id: "barcodeScale", name: "Barcode & Scale", monthlyPrice: 550, summary: "Scale and barcode hardware integration.", businessTypes: ["grocery", "superShop", "retail", "electronics", "cosmetics"], permissions: ["barcode:print", "scale:use"], featureFlags: { barcodePrint: false, scaleIntegration: false }, entitlement: "planned", available: false },
  { id: "delivery", name: "Delivery", monthlyPrice: 650, summary: "Delivery assignment, handoff, and out-for-delivery order tracking.", businessTypes: allBusinessTypes, permissions: ["order:view"], featureFlags: { deliveryDispatch: false, deliveryTracking: false }, entitlement: "planned", available: false },
  { id: "crm", name: "CRM", monthlyPrice: 600, summary: "Customer groups, lifecycle notes, and campaign audiences.", businessTypes: allBusinessTypes, permissions: ["crm:view"], featureFlags: { customerSegments: false }, entitlement: "planned", available: false },
  { id: "loyalty", name: "Loyalty", monthlyPrice: 450, summary: "Points, rewards, and customer retention rules.", businessTypes: allBusinessTypes, permissions: ["loyalty:manage"], featureFlags: { points: false, rewards: false }, entitlement: "planned", available: false },
  { id: "accounting", name: "Accounting", monthlyPrice: 900, summary: "Sales ledger, payable tracking, refunds, dues, and financial exports.", businessTypes: allBusinessTypes, permissions: ["accounting:view"], featureFlags: { ledger: false, exports: false }, entitlement: "planned", available: false },
  { id: "payroll", name: "Payroll", monthlyPrice: 700, summary: "Salary records, pay periods, deductions, and staff payout reports.", businessTypes: allBusinessTypes, permissions: ["payroll:view"], featureFlags: { salaryRuns: false }, entitlement: "planned", available: false },
  { id: "multiBranch", name: "Multi-Branch", monthlyPrice: 1200, summary: "Transfers and branch administration.", businessTypes: allBusinessTypes, permissions: ["branch:view", "branch:transfer"], featureFlags: { branchTransfers: false, branchReporting: true }, entitlement: "planned", available: false },
  { id: "api", name: "API", monthlyPrice: 1100, summary: "External API access, integrations, and operational data sync.", businessTypes: allBusinessTypes, permissions: ["api:use"], featureFlags: { publicApi: false, webhooks: false }, entitlement: "planned", available: false },
  { id: "marketing", name: "Marketing", monthlyPrice: 500, summary: "Promotions, campaigns, and storefront merchandising.", businessTypes: allBusinessTypes, permissions: ["promotion:manage", "campaign:send"], featureFlags: { promotions: false, campaigns: false }, entitlement: "planned", available: false },
];

export function calculateSubscriptionAmount(planCode: PlanCode, moduleIds: ModuleId[], interval: BillingInterval) {
  const plan = planCatalog.find((item) => item.code === planCode);
  if (!plan) throw new Error(`Unknown subscription plan: ${planCode}`);
  const modulePrices = new Map(moduleCatalog.map((module) => [module.id, module.monthlyPrice]));
  const included = new Set(plan.includedModules);
  const moduleTotal = [...new Set(moduleIds)].reduce((total, id) => {
    const price = modulePrices.get(id);
    if (price === undefined) throw new Error(`Unknown subscription module: ${id}`);
    return total + (moduleCatalog.find((module) => module.id === id)?.available && !included.has(id) ? price : 0);
  }, 0);
  const intervalMultiplier = interval === "yearly" ? 12 : 1;
  const intervalDiscount = interval === "yearly" ? 0.9 : 1;
  return Math.round((plan.monthlyBasePrice + moduleTotal) * intervalMultiplier * intervalDiscount * 100) / 100;
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

export type SaleProduct = Pick<ProductSummary,
  "id" | "name" | "imageUrl" | "sku" | "barcode" | "category" |
  "salePrice" | "discountPrice" | "unit" | "featured"
>;

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

export function availableRecommendedModules(businessType: BusinessTypeInput): ModuleId[] {
  return businessTypeConfigs[normalizeBusinessType(businessType)].recommendedModules.filter((id) => moduleCatalog.some((module) => module.id === id && module.available));
}

export function isModuleSupportedForBusiness(businessType: BusinessTypeInput, moduleId: ModuleId): boolean {
  return moduleCatalog.some((module) => module.id === moduleId && module.businessTypes.includes(normalizeBusinessType(businessType)));
}

export function defaultModulesForBusiness(businessType: BusinessTypeInput): readonly ModuleId[] {
  return businessTypeConfigs[normalizeBusinessType(businessType)].defaultModules;
}

export function getModuleDefinition(moduleId: ModuleId): ModuleDefinition | undefined {
  return moduleCatalog.find((module) => module.id === moduleId);
}

export function moduleFeatureFlags(moduleId: ModuleId, overrides: Record<string, boolean> = {}): Record<string, boolean> {
  return { ...(getModuleDefinition(moduleId)?.featureFlags ?? {}), ...overrides };
}

export function isFeatureEnabled(moduleId: ModuleId, featureFlag: string, overrides: Record<string, boolean> = {}): boolean {
  return moduleFeatureFlags(moduleId, overrides)[featureFlag] === true;
}

export function planLimits(planCode: PlanCode): UsageLimits {
  const plan = planCatalog.find((item) => item.code === planCode);
  if (!plan) throw new Error(`Unknown subscription plan: ${planCode}`);
  return plan.limits;
}

export function includedModulesForPlan(planCode: PlanCode): readonly ModuleId[] {
  const plan = planCatalog.find((item) => item.code === planCode);
  if (!plan) throw new Error(`Unknown subscription plan: ${planCode}`);
  return plan.includedModules;
}
