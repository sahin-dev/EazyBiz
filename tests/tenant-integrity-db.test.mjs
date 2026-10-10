import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createRequire } from "node:module";
import { test } from "node:test";

const apiRequire = createRequire(new URL("../apps/api/package.json", import.meta.url));
const { PrismaClient } = apiRequire("@prisma/client");
const url = process.env.TEST_DATABASE_URL;
if (!url || process.env.NODE_ENV === "production" || !["localhost", "127.0.0.1", "[::1]"].includes(new URL(url).hostname)) {
  throw new Error("Set TEST_DATABASE_URL to a local, non-production PostgreSQL database.");
}

const prisma = new PrismaClient({ datasources: { db: { url } } });

test("core foreign keys reject cross-tenant references", { timeout: 20000 }, async () => {
  const marker = randomUUID();
  const createdTenantIds = [];
  try {
    await prisma.$transaction(async (tx) => {
      const tenants = [];
      for (const suffix of ["a", "b"]) {
        const tenant = await tx.tenant.create({ data: { name: `Integrity ${suffix} ${marker}`, businessType: "retail", phone: "01700000000" } });
        createdTenantIds.push(tenant.id);
        const branch = await tx.branch.create({ data: { tenantId: tenant.id, name: "Main", code: `MAIN-${suffix}`, address: "Test address" } });
        const product = await tx.product.create({ data: { tenantId: tenant.id, name: "Test product", sku: `SKU-${suffix}-${marker}`, category: "Test", salePrice: 50 } });
        const supplier = await tx.supplier.create({ data: { tenantId: tenant.id, name: "Test supplier", category: "Test", phone: "01700000000" } });
        const order = await tx.order.create({ data: { tenantId: tenant.id, branchId: branch.id, orderNo: `ORD-${suffix}-${marker}`, status: "Pending", paymentMethod: "Cash", subtotal: 0, total: 0 } });
        tenants.push({ tenant, branch, product, supplier, order });
      }
      const [a, b] = tenants;
      async function rejectsReference(label, create) {
        await tx.$executeRawUnsafe("SAVEPOINT tenant_integrity_check");
        try {
          await assert.rejects(create, (error) => error?.code === "P2003" || /code: "23001"/.test(error?.message ?? ""), label);
        } finally {
          await tx.$executeRawUnsafe("ROLLBACK TO SAVEPOINT tenant_integrity_check");
          await tx.$executeRawUnsafe("RELEASE SAVEPOINT tenant_integrity_check");
        }
      }

      await rejectsReference("balance branch", () => tx.inventoryBalance.create({ data: { tenantId: a.tenant.id, branchId: b.branch.id, productId: a.product.id } }));
      await rejectsReference("balance product", () => tx.inventoryBalance.create({ data: { tenantId: a.tenant.id, branchId: a.branch.id, productId: b.product.id } }));
      await rejectsReference("movement branch", () => tx.inventoryMovement.create({ data: { tenantId: a.tenant.id, branchId: b.branch.id, productId: a.product.id, type: "opening", quantity: 1, balanceAfter: 1 } }));
      await rejectsReference("movement product", () => tx.inventoryMovement.create({ data: { tenantId: a.tenant.id, branchId: a.branch.id, productId: b.product.id, type: "opening", quantity: 1, balanceAfter: 1 } }));
      await rejectsReference("order branch", () => tx.order.create({ data: { tenantId: a.tenant.id, branchId: b.branch.id, orderNo: `INVALID-${marker}`, status: "Pending", paymentMethod: "Cash", subtotal: 0, total: 0 } }));
      await rejectsReference("purchase branch", () => tx.purchase.create({ data: { tenantId: a.tenant.id, branchId: b.branch.id, supplierId: a.supplier.id, purchaseNo: `INVALID-A-${marker}`, subtotal: 0 } }));
      await rejectsReference("purchase supplier", () => tx.purchase.create({ data: { tenantId: a.tenant.id, branchId: a.branch.id, supplierId: b.supplier.id, purchaseNo: `INVALID-B-${marker}`, subtotal: 0 } }));
      await rejectsReference("table branch", () => tx.restaurantTable.create({ data: { tenantId: a.tenant.id, branchId: b.branch.id, name: "Invalid table" } }));
      await rejectsReference("ticket branch", () => tx.kitchenTicket.create({ data: { tenantId: a.tenant.id, branchId: b.branch.id, orderId: a.order.id } }));
      await rejectsReference("ticket order", () => tx.kitchenTicket.create({ data: { tenantId: a.tenant.id, branchId: a.branch.id, orderId: b.order.id } }));

      await tx.inventoryBalance.create({ data: { tenantId: a.tenant.id, branchId: a.branch.id, productId: a.product.id, quantity: 1 } });
      await tx.purchase.create({ data: { tenantId: a.tenant.id, branchId: a.branch.id, supplierId: a.supplier.id, purchaseNo: `VALID-${marker}`, subtotal: 0 } });
      await rejectsReference("branch reassignment", () => tx.branch.update({ where: { id: a.branch.id }, data: { tenantId: b.tenant.id } }));
      await rejectsReference("product reassignment", () => tx.product.update({ where: { id: a.product.id }, data: { tenantId: b.tenant.id } }));
      await rejectsReference("supplier reassignment", () => tx.supplier.update({ where: { id: a.supplier.id }, data: { tenantId: b.tenant.id } }));
      await rejectsReference("order reassignment", () => tx.order.update({ where: { id: a.order.id }, data: { tenantId: b.tenant.id } }));
      throw new Error("ROLLBACK_TENANT_INTEGRITY_FIXTURE");
    });
  } catch (error) {
    if (!(error instanceof Error) || error.message !== "ROLLBACK_TENANT_INTEGRITY_FIXTURE") throw error;
  } finally {
    for (const tenantId of createdTenantIds) assert.equal(await prisma.tenant.findUnique({ where: { id: tenantId } }), null);
    await prisma.$disconnect();
  }
});
