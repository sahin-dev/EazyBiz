import type { BusinessType, ModuleId, OrderSummary, ProductSummary } from "@businessos/domain";

export interface BranchSummary {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
}

export interface SessionData {
  user: { id: string; tenantId: string | null; branchId: string | null; name: string; email: string; phone?: string | null; role: string; sessionId?: string };

  tenant: {
    id: string;
    name: string;
    businessType: BusinessType;
    plan: string;
    status: string;
    currency: string;
    receiptWidth: string;
    vatRate: number;
    serviceRate: number;
    branches: BranchSummary[];
    enabledModules: ModuleId[];
    moduleEntitlements: Array<{ moduleId: ModuleId; enabled: boolean; featureFlags: Record<string, boolean>; expiresAt: string | null }>;
    storefrontStatus: "draft" | "published";
    subscription: { status: string; currentPeriodEnd: string } | null;
  } | null;
}

export interface SubscriptionData {
  subscription: {
    id: string;
    planCode: string;
    status: string;
    interval: "monthly" | "yearly";
    amount: number | string;
    trialEndsAt: string | null;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    payments: SubscriptionPayment[];
    items: Array<{ id: string; type: string; code: string; name: string; quantity: number; unitAmount: number | string; status: string }>;
    entitlements: Array<{ id: string; key: string; name: string; limit: number | null; used: number; unit: string; source: string }>;
    usageRecords: Array<{ id: string; entitlementKey: string; quantity: number; unit: string; source: string; recordedAt: string }>;
    invoices: InvoiceRecord[];
    trials: Array<{ id: string; status: string; startedAt: string; endsAt: string; convertedAt: string | null; cancelledAt: string | null }>;
  };
  plans: Array<{ code: "starter" | "growth" | "business" | "enterprise"; name: string; monthlyBasePrice: number; description: string; highlighted?: boolean; limits: { branches: number | null; users: number | null; devices: number | null; storageGb: number | null; sms: number | null }; includedModules: ModuleId[] }>;
  pricing: {
    plans: SubscriptionData["plans"];
    modules: SubscriptionData["modules"];
  };
  usage: { branches: number; users: number; devices: number; storageGb: number; sms: number };
  modules: Array<{
    id: ModuleId;
    name: string;
    monthlyPrice: number;
    summary: string;
    entitlement: "included" | "addon" | "planned";
    featureFlags: Record<string, boolean>;
    available: boolean;
    enabled: boolean;
    activatedAt: string | null;
    expiresAt: string | null;
  }>;
}

export interface InvoiceRecord {
  id: string;
  invoiceNo: string;
  status: string;
  currency: string;
  subtotal: number | string;
  taxAmount: number | string;
  total: number | string;
  dueAmount: number | string;
  issuedAt: string;
  dueAt: string;
  paidAt: string | null;
  lines: Array<{ id: string; itemType: string; code: string; description: string; quantity: number; unitAmount: number | string; total: number | string }>;
  payments: SubscriptionPayment[];
}

export interface SubscriptionPayment {
  id: string;
  amount: number | string;
  method: string;
  reference: string | null;
  status: "pending" | "captured" | "failed" | "refunded";
  paidAt: string | null;
  createdAt: string;
  subscription?: {
    tenantId: string;
    planCode: string;
    interval: "monthly" | "yearly";
    tenant: { name: string; businessType: BusinessType };
  };
}

export interface PlatformTenant {
  id: string;
  name: string;
  businessType: BusinessType;
  status: "trial" | "active" | "suspended" | "cancelled";
  plan: string;
  enabledModules: string[];
  branches: Array<{ id: string; name: string; isActive: boolean }>;
  userCount: number;
  subscription: {
    planCode: string;
    status: string;
    interval: "monthly" | "yearly";
    amount: number | string;
    currentPeriodEnd: string;
  } | null;
}

export interface DashboardData {
  metrics: { sales: number; orderCount: number; averageOrder: number; dueAmount: number; returnCount: number; refundAmount: number; lowStockCount: number; stockValue: number; customerCount: number; supplierPayable: number };
  recentOrders: Array<OrderSummary & { customer: { name: string } | null; items: Array<{ quantity: number }> }>;
  topProducts: Array<{ name: string; quantity: number; sales: number }>;
}

export interface CustomerRecord {
  id: string;
  name: string;
  phone: string;
  email?: string;
  totalSpend: number;
  due: number;
  loyaltyPoints: number;
}

export interface SupplierRecord {
  id: string;
  name: string;
  category: string;
  phone: string;
  payable: number;
  lastPurchase: number;
  _count: { purchases: number };
}

export interface PurchaseRecord {
  id: string;
  purchaseNo: string;
  invoiceNo: string | null;
  subtotal: number;
  paid: number;
  due: number;
  status: string;
  createdAt: string;
  supplier: { name: string };
  branch: { name: string };
  items: Array<{ id: string; quantity: number; unitCost: number }>;
}

export interface OrderRecord extends OrderSummary {
  branchId: string;
  paymentStatus: string;
  paidAmount: number;
  dueAmount: number;
  payments: Array<{ id: string; method: string; amount: number; reference: string | null; status: string; createdAt: string }>;
  items: Array<{ id: string; productId: string; name: string; quantity: number; unitPrice: number; total: number }>;
}

export interface RestaurantTableRecord {
  id: string;
  branchId: string;
  name: string;
  capacity: number;
  status: "available" | "occupied" | "reserved";
  branch: { name: string };
  orders: Array<{ id: string; orderNo: string; total: number; dueAmount: number; createdAt: string }>;
}

export interface KitchenTicketRecord {
  id: string;
  branchId: string;
  status: "new" | "preparing" | "ready" | "served";
  createdAt: string;
  branch: { name: string };
  order: { orderNo: string; source: string; orderType: string; status: string; notes: string | null; createdAt: string; items: Array<{ id: string; name: string; quantity: number; note: string | null }>; table: { name: string } | null };
}

export interface InventoryData {
  summary: { skuCount: number; lowStockCount: number; stockValue: number };
  balances: Array<{ id: string; branchId: string; productId: string; quantity: number; minimumStock: number; product: ProductSummary & { purchasePrice: number }; branch: { id: string; name: string } }>;
  movements: Array<{ id: string; type: string; quantity: number; balanceAfter: number; note?: string; createdAt: string; product: { name: string; sku: string }; branch: { name: string } }>;
}

export type InventoryAvailability = Array<{ branchId: string; productId: string; quantity: number }>;

export interface StaffRecord {
  id: string;
  employeeNo: string;
  name: string;
  phone?: string;
  role: string;
  shift: string;
  salary: number;
  status: string;
  branch: { id: string; name: string } | null;
}

export interface TenantUserRecord {
  id: string;
  tenantId: string;
  branchId: string | null;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  status: "invited" | "active" | "suspended";
  lastLoginAt: string | null;
  createdAt: string;
  branch: { id: string; name: string } | null;
}

export interface AuditEvent {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  ipAddress: string | null;
  metadata: unknown;
  createdAt: string;
  user: { id: string; name: string; email: string } | null;
}

export interface AuditPageData {
  items: AuditEvent[];
  nextCursor: string | null;
}

export interface StorefrontSection { id: string; type: string; title: string; subtitle?: string; visible: boolean }

export interface StorefrontData {
  id: string;
  slug: string;
  publishedSlug: string | null;
  heroTitle: string;
  tagline: string;
  status: "draft" | "published";
  theme: string;
  primaryColor: string;
  deliveryEnabled: boolean;
  pickupEnabled: boolean;
  sections: StorefrontSection[];
  updatedAt: string;
}

export interface ReportData {
  range: number;
  daily: Array<{ date: string; sales: number; orders: number; returns: number }>;
  paymentMix: Array<{ method: string; amount: number }>;
  totalSales: number;
  orderCount: number;
  returnCount: number;
  refundAmount: number;
}
