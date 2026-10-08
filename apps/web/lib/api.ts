import type { OrderSummary, ProductSummary, TenantSummary } from "@businessos/domain";
import { cookies } from "next/headers";
import type { AuditPageData, CustomerRecord, DashboardData, InventoryData, KitchenTicketRecord, OrderRecord, PlatformTenant, PurchaseRecord, ReportData, RestaurantTableRecord, SessionData, StaffRecord, StorefrontData, SubscriptionData, SubscriptionPayment, SupplierRecord, TenantUserRecord } from "./types";

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = cookies().get("businessos_token")?.value;
  const response = await fetch(`${API_URL}/api${path}`, {
    ...init,
    headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}), ...init?.headers },
    cache: "no-store",
  });
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(payload?.message ?? `API request failed with status ${response.status}.`);
  }
  return response.json() as Promise<T>;
}

export const api = {
  session: () => request<SessionData>("/auth/me"),
  tenants: () => request<TenantSummary[]>("/tenants"),
  platformTenants: () => request<PlatformTenant[]>("/platform-admin/tenants"),
  platformPayments: () => request<SubscriptionPayment[]>("/platform-admin/payments"),
  tenant: (tenantId: string) => request<TenantSummary & { branches: { id: string; name: string }[] }>(`/tenants/${tenantId}`),
  subscription: (tenantId: string) => request<SubscriptionData>(`/tenants/${tenantId}/subscription`),
  dashboard: (tenantId: string, branchId?: string) => request<DashboardData>(`/tenants/${tenantId}/dashboard${branchId ? `?branchId=${branchId}` : ""}`),
  products: (tenantId: string) => request<ProductSummary[]>(`/tenants/${tenantId}/products`),
  orders: (tenantId: string, branchId?: string) => request<OrderRecord[]>(`/tenants/${tenantId}/orders${branchId ? `?branchId=${branchId}` : ""}`),
  customers: (tenantId: string) => request<CustomerRecord[]>(`/tenants/${tenantId}/customers`),
  suppliers: (tenantId: string) => request<SupplierRecord[]>(`/tenants/${tenantId}/suppliers`),
  purchases: (tenantId: string, branchId?: string) => request<PurchaseRecord[]>(`/tenants/${tenantId}/purchases${branchId ? `?branchId=${branchId}` : ""}`),
  tables: (tenantId: string) => request<RestaurantTableRecord[]>(`/tenants/${tenantId}/tables`),
  kitchen: (tenantId: string) => request<KitchenTicketRecord[]>(`/tenants/${tenantId}/kitchen`),
  inventory: (tenantId: string, branchId?: string) => request<InventoryData>(`/tenants/${tenantId}/inventory${branchId ? `?branchId=${branchId}` : ""}`),
  staff: (tenantId: string) => request<StaffRecord[]>(`/tenants/${tenantId}/staff`),
  users: (tenantId: string) => request<TenantUserRecord[]>(`/tenants/${tenantId}/users`),
  auditLogs: (tenantId: string) => request<AuditPageData>(`/tenants/${tenantId}/audit-logs`),
  storefront: (tenantId: string) => request<StorefrontData>(`/tenants/${tenantId}/storefront`),
  report: (tenantId: string, days = 30, branchId?: string) => request<ReportData>(`/tenants/${tenantId}/reports/overview?days=${days}${branchId ? `&branchId=${branchId}` : ""}`),
};
