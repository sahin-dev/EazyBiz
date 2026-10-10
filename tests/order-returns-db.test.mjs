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

test("full return commits all ledger changes together and test fixture rolls back", { timeout: 20000 }, async () => {
  const marker = randomUUID();
  let tenantId = "";
  try {
    await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({ data: { name: `Return test ${marker}`, businessType: "retail", phone: "01700000000" } });
      tenantId = tenant.id;
      const branch = await tx.branch.create({ data: { tenantId, name: "Test branch", code: "MAIN", address: "Test address" } });
      const user = await tx.user.create({ data: { tenantId, branchId: branch.id, name: "Test manager", email: `${marker}@example.test`, passwordHash: "not-a-login", role: "manager" } });
      const product = await tx.product.create({ data: { tenantId, name: "Test product", sku: `SKU-${marker}`, category: "Test", salePrice: 50, stock: 5 } });
      await tx.inventoryBalance.create({ data: { tenantId, branchId: branch.id, productId: product.id, quantity: 5 } });
      const customer = await tx.customer.create({ data: { tenantId, name: "Test customer", phone: `01${marker.replace(/\D/g, "").slice(0, 9).padEnd(9, "0")}`, totalSpend: 100, due: 40, loyaltyPoints: 1 } });
      const order = await tx.order.create({ data: {
        tenantId, branchId: branch.id, customerId: customer.id, createdById: user.id, orderNo: `TEST-${marker}`,
        status: "Completed", paymentMethod: "Cash", paymentStatus: "pending", subtotal: 100, total: 100, paidAmount: 60, dueAmount: 40,
        items: { create: { productId: product.id, name: product.name, quantity: 2, unitPrice: 50, total: 100 } },
        payments: { create: { method: "Cash", amount: 60, status: "captured" } },
      } });

      const service = new OrdersService({ $transaction: (callback) => callback(tx) });
      const actor = { id: user.id, tenantId, branchId: branch.id, role: "manager" };
      await service.returnOrder(tenantId, order.id, actor, { reason: "Customer returned item", disposition: "restock", refundMethod: "Cash" });

      const [after, balance, stock, buyer, movements] = await Promise.all([
        tx.order.findUniqueOrThrow({ where: { id: order.id }, include: { payments: true } }),
        tx.inventoryBalance.findUniqueOrThrow({ where: { branchId_productId: { branchId: branch.id, productId: product.id } } }),
        tx.product.findUniqueOrThrow({ where: { id: product.id } }),
        tx.customer.findUniqueOrThrow({ where: { id: customer.id } }),
        tx.inventoryMovement.findMany({ where: { referenceId: order.id } }),
      ]);
      assert.equal(after.status, "Refunded");
      assert.equal(Number(after.dueAmount), 0);
      assert.deepEqual(after.payments.map((payment) => Number(payment.amount)).sort((a, b) => a - b), [-60, 60]);
      assert.equal(Number(balance.quantity), 7);
      assert.equal(Number(stock.stock), 7);
      assert.equal(Number(buyer.totalSpend), 0);
      assert.equal(Number(buyer.due), 0);
      assert.equal(buyer.loyaltyPoints, 0);
      assert.equal(movements.length, 1);
      assert.equal(movements[0].type, "return");
      await assert.rejects(service.returnOrder(tenantId, order.id, actor, { reason: "Customer returned item", disposition: "restock", refundMethod: "Cash" }), /already been returned/i);
      throw new Error("ROLLBACK_RETURN_TEST_FIXTURE");
    });
  } catch (error) {
    if (!(error instanceof Error) || error.message !== "ROLLBACK_RETURN_TEST_FIXTURE") throw error;
  } finally {
    if (tenantId) assert.equal(await prisma.tenant.findUnique({ where: { id: tenantId } }), null);
    await prisma.$disconnect();
  }
});
