import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createRequire } from "node:module";
import { test } from "node:test";
import { OrdersService } from "../apps/api/src/modules/orders/orders.service.ts";

const apiRequire = createRequire(new URL("../apps/api/package.json", import.meta.url));
const { PrismaClient } = apiRequire("@prisma/client");
const url = process.env.TEST_DATABASE_URL;
if (!url || process.env.NODE_ENV === "production" || !["localhost", "127.0.0.1", "[::1]"].includes(new URL(url).hostname)) {
  throw new Error("Set TEST_DATABASE_URL to a local, non-production PostgreSQL database.");
}

const prisma = new PrismaClient({ datasources: { db: { url } } });

test("order replay creates one order and one stock movement in PostgreSQL", { timeout: 20000 }, async () => {
  const marker = randomUUID();
  let tenantId = "";
  try {
    await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({ data: { name: `Idempotency test ${marker}`, businessType: "retail", phone: "01700000000" } });
      tenantId = tenant.id;
      const branch = await tx.branch.create({ data: { tenantId, name: "Main", code: "MAIN", address: "Test address" } });
      const user = await tx.user.create({ data: { tenantId, branchId: branch.id, name: "Test cashier", email: `${marker}@example.test`, passwordHash: "not-a-login", role: "cashier" } });
      const product = await tx.product.create({ data: { tenantId, name: "Test product", sku: `SKU-${marker}`, category: "Test", salePrice: 50, stock: 5 } });
      await tx.inventoryBalance.create({ data: { tenantId, branchId: branch.id, productId: product.id, quantity: 5 } });
      const service = new OrdersService({ tenant: tx.tenant, order: tx.order, product: tx.product, $transaction: (callback) => callback(tx) });
      const actor = { id: user.id, tenantId, branchId: branch.id, role: "cashier" };
      const input = { branchId: branch.id, source: "pos", paymentMethod: "Cash", items: [{ productId: product.id, quantity: 2 }] };
      const key = randomUUID();

      const first = await service.create(tenantId, actor, input, key);
      const replay = await service.create(tenantId, actor, input, key);
      assert.equal(replay.id, first.id);
      await assert.rejects(service.create(tenantId, actor, { ...input, items: [{ productId: product.id, quantity: 1 }] }, key), /different order/i);
      assert.equal(await tx.order.count({ where: { tenantId } }), 1);
      assert.equal(await tx.inventoryMovement.count({ where: { tenantId, referenceId: first.id } }), 1);
      assert.equal(Number((await tx.inventoryBalance.findUniqueOrThrow({ where: { branchId_productId: { branchId: branch.id, productId: product.id } } })).quantity), 3);

      const storefrontInput = { branchId: branch.id, source: "storefront", orderType: "pickup", paymentMethod: "Due", paidAmount: 0, items: [{ productId: product.id, quantity: 1 }] };
      const shopper = { customerName: "Test shopper", phone: "01799999999", fulfillment: "pickup" };
      const customer = { name: shopper.customerName, phone: shopper.phone };
      const storefrontKey = randomUUID();
      const storefrontOrder = await service.create(tenantId, null, storefrontInput, storefrontKey, shopper, customer);
      assert.equal((await service.create(tenantId, null, storefrontInput, storefrontKey, shopper, customer)).id, storefrontOrder.id);
      await assert.rejects(service.create(tenantId, null, storefrontInput, storefrontKey, { ...shopper, phone: "01899999999" }, { ...customer, phone: "01899999999" }), /different order/i);
      assert.equal(await tx.customer.count({ where: { tenantId } }), 1);
      assert.equal(await tx.order.count({ where: { tenantId } }), 2);
      assert.equal(await tx.inventoryMovement.count({ where: { tenantId, referenceId: storefrontOrder.id } }), 1);
      throw new Error("ROLLBACK_IDEMPOTENCY_TEST_FIXTURE");
    });
  } catch (error) {
    if (!(error instanceof Error) || error.message !== "ROLLBACK_IDEMPOTENCY_TEST_FIXTURE") throw error;
  } finally {
    if (tenantId) assert.equal(await prisma.tenant.findUnique({ where: { id: tenantId } }), null);
    await prisma.$disconnect();
  }
});
