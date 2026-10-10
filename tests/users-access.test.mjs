import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { test } from "node:test";
import { UsersService } from "../apps/api/src/modules/users/users.service.ts";
import { AllowPlatform } from "../apps/api/src/common/auth/allow-platform.decorator.ts";
import { TenantAccessGuard } from "../apps/api/src/common/auth/tenant-access.guard.ts";
import { PermissionGuard } from "../apps/api/src/common/auth/permission.guard.ts";
import { PERMISSION_KEY } from "../apps/api/src/common/auth/require-permission.decorator.ts";
import { DashboardController } from "../apps/api/src/modules/dashboard/dashboard.controller.ts";
import { InventoryController } from "../apps/api/src/modules/inventory/inventory.controller.ts";
import { InventoryService } from "../apps/api/src/modules/inventory/inventory.service.ts";
import { OrdersController } from "../apps/api/src/modules/orders/orders.controller.ts";
import { ProductsController } from "../apps/api/src/modules/products/products.controller.ts";
import { ProductsService } from "../apps/api/src/modules/products/products.service.ts";
import { PurchasesController } from "../apps/api/src/modules/purchases/purchases.controller.ts";
import { CustomersController } from "../apps/api/src/modules/customers/customers.controller.ts";
import { StorefrontsController } from "../apps/api/src/modules/storefronts/storefronts.controller.ts";

const apiRequire = createRequire(new URL("../apps/api/package.json", import.meta.url));
const { compare } = apiRequire("bcryptjs");
const { Reflector } = apiRequire("@nestjs/core");

const owner = { id: "owner-1", tenantId: "tenant-1", branchId: null, role: "owner" };
const admin = { id: "admin-1", tenantId: "tenant-1", branchId: null, role: "admin" };

function fixture() {
  const records = new Map();
  const memberships = new Map();
  const audit = [];
  let nextId = 1;
  const db = {
    user: {
      async create({ data }) {
        const record = { ...data, id: `user-${nextId++}`, lastLoginAt: null, createdAt: new Date(), branch: data.branchId ? { id: data.branchId, name: "Main" } : null };
        records.set(record.id, record);
        return record;
      },
      async findMany({ where }) { return [...records.values()].filter((record) => record.tenantId === where.tenantId); },
      async findFirst({ where }) {
        const record = records.get(where.id);
        if (!record || (where.tenantId && record.tenantId !== where.tenantId) || (where.status && record.status !== where.status)) return null;
        return record;
      },
      async updateMany({ where, data }) {
        const record = records.get(where.id);
        if (!record || (where.tenantId && record.tenantId !== where.tenantId) || (where.status && record.status !== where.status) || (where.passwordHash && record.passwordHash !== where.passwordHash)) return { count: 0 };
        Object.assign(record, data);
        return { count: 1 };
      },
      async update({ where, data }) {
        const record = records.get(where.id);
        Object.assign(record, data);
        return record;
      },
      async findUniqueOrThrow({ where }) { return records.get(where.id); },
    },
    tenantMembership: {
      async create({ data }) { const record = { ...data }; memberships.set(`${data.userId}:${data.tenantId}`, record); return record; },
      async findUnique({ where }) { const { userId, tenantId } = where.userId_tenantId; const item = memberships.get(`${userId}:${tenantId}`); return item ? { ...item, user: records.get(userId) } : null; },
      async update({ where, data }) { const { userId, tenantId } = where.userId_tenantId; const item = memberships.get(`${userId}:${tenantId}`); Object.assign(item, data); return item; },
      async findMany({ where }) { return [...memberships.values()].filter((item) => item.tenantId === where.tenantId).map((item) => ({ ...item, user: records.get(item.userId), branch: item.branchId ? { id: item.branchId, name: "Main" } : null })); },
    },
    authSession: { async updateMany() { return { count: 0 }; } },
    branch: { async findFirst({ where }) { return where.id === "branch-1" && where.tenantId === "tenant-1" ? { id: "branch-1" } : null; } },
    auditLog: { async create({ data }) { audit.push(data); } },
    async $transaction(callback) { return callback(db); },
  };
  return { service: new UsersService(db), records, memberships, audit };
}

test("invitation requires acceptance, sets a password, and cannot be reused", async () => {
  const { service, records, audit } = fixture();
  const result = await service.invite("tenant-1", owner, { name: "  Mira Das  ", email: "MIRA@example.com", role: "cashier", branchId: "branch-1" });
  const invited = records.get(result.user.id);
  assert.equal(invited.name, "Mira Das");
  assert.equal(invited.email, "mira@example.com");
  assert.equal(invited.status, "invited");
  assert.equal(invited.branchId, "branch-1");
  await assert.rejects(service.accept({ token: `${result.invitationToken}x`, password: "another long password" }), /invalid or has expired/i);
  const accepted = await service.accept({ token: result.invitationToken, password: "correct horse staple 2026" });
  assert.equal(accepted.email, "mira@example.com");
  assert.equal(invited.status, "active");
  assert.equal(await compare("correct horse staple 2026", invited.passwordHash), true);
  await assert.rejects(service.accept({ token: result.invitationToken, password: "another long password" }), /invalid or has expired/i);
  assert.deepEqual(audit.map((event) => event.action), ["user.invited", "user.invitation_accepted"]);
});

test("renewing an invitation revokes the earlier link", async () => {
  const { service } = fixture();
  const first = await service.invite("tenant-1", owner, { name: "Mira Das", email: "mira@example.com", role: "manager" });
  const second = await service.reissue("tenant-1", first.user.id, owner);
  await assert.rejects(service.accept({ token: first.invitationToken, password: "another long password" }), /invalid or has expired/i);
  await service.accept({ token: second.invitationToken, password: "another long password" });
  await assert.rejects(service.reissue("tenant-1", first.user.id, owner), /Only pending invitations/i);
});

test("access management enforces owner-only administration and tenant scope", async () => {
  const { service, memberships, records } = fixture();
  await assert.rejects(service.invite("tenant-1", admin, { name: "New Admin", email: "admin@example.com", role: "admin" }), /Only the owner/i);
  await assert.rejects(service.invite("tenant-1", owner, { name: "New Admin", email: "admin@example.com", role: "admin", branchId: "branch-1" }), /whole workspace/i);
  await assert.rejects(service.invite("tenant-1", owner, { name: "Wrong Branch", email: "wrong@example.com", role: "manager", branchId: "branch-2" }), /active branch/i);
  const invited = await service.invite("tenant-1", owner, { name: "New Admin", email: "admin@example.com", role: "admin" });
  await assert.rejects(service.updateAccess("tenant-1", invited.user.id, admin, { role: "cashier" }), /Only the owner/i);
  await assert.rejects(service.updateStatus("tenant-2", invited.user.id, owner, { status: "suspended" }), /Account not found/i);
  await assert.rejects(service.updateStatus("tenant-1", invited.user.id, owner, { status: "active" }), /Pending invitations/i);
  await service.accept({ token: invited.invitationToken, password: "another long password" });
  await service.updateStatus("tenant-1", invited.user.id, owner, { status: "suspended" });
  assert.equal(memberships.get(`${invited.user.id}:tenant-1`).status, "suspended");
  records.get(invited.user.id).status = "suspended";
  await service.updateStatus("tenant-1", invited.user.id, owner, { status: "active" });
  assert.equal(records.get(invited.user.id).status, "active");
});

test("platform access is limited to explicitly authorized routes", () => {
  const guard = new TenantAccessGuard(new Reflector());
  class OrdinaryController {}
  class PlatformController {}
  AllowPlatform()(PlatformController);
  const context = (controller, user, tenantId = "tenant-1") => ({
    getClass: () => controller,
    getHandler: () => context,
    switchToHttp: () => ({ getRequest: () => ({ user, params: { tenantId } }) }),
  });
  const platformUser = { id: "platform-1", role: "platformAdmin", tenantId: null };
  assert.throws(() => guard.canActivate(context(OrdinaryController, platformUser)), /authorized platform administration route/i);
  assert.equal(guard.canActivate(context(PlatformController, platformUser)), true);
  assert.equal(guard.canActivate(context(OrdinaryController, owner)), true);
  assert.throws(() => guard.canActivate(context(OrdinaryController, owner, "tenant-2")), /Cross-tenant/i);
});

test("sensitive read routes enforce role permissions", () => {
  const reflector = new Reflector();
  const guard = new PermissionGuard(reflector);
  const protectedRoutes = [
    [DashboardController, "summary", "dashboard:view"],
    [DashboardController, "report", "report:view"],
    [InventoryController, "overview", "inventory:view"],
    [InventoryController, "availability", "sale:create"],
    [OrdersController, "list", "order:view"],
    [ProductsController, "list", "product:manage"],
    [ProductsController, "catalog", "product:view"],
    [PurchasesController, "list", "purchase:view"],
    [CustomersController, "list", "customer:view"],
    [StorefrontsController, "get", "storefront:manage"],
  ];
  for (const [controller, methodName, permission] of protectedRoutes) {
    const handler = controller.prototype[methodName];
    assert.equal(reflector.getAllAndOverride(PERMISSION_KEY, [handler, controller]), permission);
    const context = (role) => ({
      getClass: () => controller,
      getHandler: () => handler,
      switchToHttp: () => ({ getRequest: () => ({ user: { role, tenantId: "tenant-1" } }) }),
    });
    assert.throws(() => guard.canActivate(context("deliveryStaff")), /cannot access/i);
    assert.equal(guard.canActivate(context("owner")), true);
  }
  const stockContext = { getClass: () => InventoryController, getHandler: () => InventoryController.prototype.availability,
    switchToHttp: () => ({ getRequest: () => ({ user: { role: "cashier", tenantId: "tenant-1" } }) }) };
  assert.equal(guard.canActivate(stockContext), true);
  assert.throws(() => guard.canActivate({ ...stockContext, getHandler: () => InventoryController.prototype.overview }), /cannot access/i);
});

test("sale catalog excludes management-only product fields", async () => {
  let query;
  const products = new ProductsService({ product: { async findMany(value) { query = value; return [{ id: "product-1", name: "Rice" }]; } } });
  await products.catalog("tenant-1");
  assert.equal(query.where.tenantId, "tenant-1");
  for (const field of ["purchasePrice", "stock", "minimumStock", "attributes"]) {
    assert.equal(query.select[field], undefined, `${field} must not be in the POS response`);
  }
  const reflector = new Reflector();
  const guard = new PermissionGuard(reflector);
  const context = (method, role) => ({ getClass: () => ProductsController, getHandler: () => ProductsController.prototype[method], switchToHttp: () => ({ getRequest: () => ({ user: { role } }) }) });
  assert.equal(guard.canActivate(context("catalog", "cashier")), true);
  assert.throws(() => guard.canActivate(context("list", "cashier")), /cannot access/i);
});

test("POS stock availability is tenant and branch scoped and omits purchase costs", async () => {
  let query;
  const inventory = new InventoryService({ inventoryBalance: { findMany: async (value) => { query = value; return [{ branchId: "branch-1", productId: "product-1", quantity: 4 }]; } } });
  const controller = new InventoryController(inventory);
  const user = { tenantId: "tenant-1", branchId: "branch-1", role: "cashier" };
  await assert.rejects(Promise.resolve().then(() => controller.availability("tenant-1", user, "branch-2")), /Cross-branch/i);
  assert.deepEqual(await controller.availability("tenant-1", user), [{ branchId: "branch-1", productId: "product-1", quantity: 4 }]);
  assert.deepEqual(query.where, { tenantId: "tenant-1", branchId: "branch-1" });
  assert.deepEqual(query.select, { branchId: true, productId: true, quantity: true });
});
