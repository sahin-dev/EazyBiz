import assert from "node:assert/strict";
import { test } from "node:test";
import { OrdersService } from "../apps/api/src/modules/orders/orders.service.ts";
import { DashboardService } from "../apps/api/src/modules/dashboard/dashboard.service.ts";

const manager = { id: "manager-1", tenantId: "tenant-1", branchId: "branch-1", role: "manager" };

function fixture(overrides = {}) {
  const order = {
    id: "order-1", tenantId: "tenant-1", branchId: "branch-1", customerId: "customer-1", tableId: null,
    orderNo: "ORD-1", status: "Completed", paymentStatus: "pending", paidAmount: 60, dueAmount: 40, total: 100,
    items: [{ productId: "product-1", quantity: 2, total: 100 }], kitchenTicket: null, ...overrides,
  };
  const state = { order, balance: 5, productStock: 12, customerSpend: 100, customerDue: Number(order.dueAmount), loyalty: 1, movements: [], payments: [], audit: [] };
  const db = {
    order: {
      async findFirst({ where }) { return order.id === where.id && order.tenantId === where.tenantId && (!where.branchId || where.branchId === order.branchId) ? order : null; },
      async updateMany({ where, data }) {
        if (order.status === "Refunded" || order.tenantId !== where.tenantId) return { count: 0 };
        Object.assign(order, data);
        return { count: 1 };
      },
      async findUniqueOrThrow() { return { ...order, payments: state.payments }; },
    },
    inventoryBalance: { async update({ data }) { state.balance += data.quantity.increment; return { quantity: state.balance }; } },
    product: { async update({ data }) { state.productStock += data.stock.increment; } },
    inventoryMovement: { async create({ data }) { state.movements.push(data); } },
    orderPayment: { async create({ data }) { state.payments.push(data); } },
    customer: { async update({ data }) { state.customerSpend -= Number(data.totalSpend.decrement); state.customerDue -= data.due.decrement; state.loyalty -= data.loyaltyPoints.decrement; } },
    restaurantTable: { async update() { throw new Error("Settled table must not be released twice."); } },
    auditLog: { async create({ data }) { state.audit.push(data); } },
    async $transaction(callback) { return callback(db); },
  };
  return { service: new OrdersService(db), state };
}

test("full return reverses stock, customer liability, and captured payment exactly once", async () => {
  const { service, state } = fixture();
  const returned = await service.returnOrder("tenant-1", "order-1", manager, { reason: "Customer returned item", disposition: "restock", refundMethod: "bKash", refundReference: "BK-123" });
  assert.equal(returned.status, "Refunded");
  assert.equal(returned.dueAmount, 0);
  assert.equal(state.balance, 7);
  assert.equal(state.productStock, 14);
  assert.deepEqual(state.movements.map((movement) => [movement.type, movement.quantity, movement.balanceAfter]), [["return", 2, 7]]);
  assert.deepEqual(state.payments.map((payment) => [payment.amount, payment.method, payment.reference, payment.status]), [[-60, "bKash", "BK-123", "refunded"]]);
  assert.deepEqual([state.customerSpend, state.customerDue, state.loyalty], [0, 0, 0]);
  assert.equal(state.audit[0].metadata.reversedDue, 40);
  await assert.rejects(service.returnOrder("tenant-1", "order-1", manager, { reason: "Customer returned item", disposition: "restock", refundMethod: "Cash" }), /already been returned/i);
  assert.equal(state.movements.length, 1);
});

test("write-off and unpaid returns do not inflate inventory or create a refund", async () => {
  const { service, state } = fixture({ paidAmount: 0, dueAmount: 100 });
  await service.returnOrder("tenant-1", "order-1", manager, { reason: "Damaged merchandise", disposition: "writeOff" });
  assert.equal(state.balance, 5);
  assert.equal(state.productStock, 12);
  assert.equal(state.payments.length, 0);
  assert.equal(state.customerDue, 0);
  assert.equal(state.audit[0].metadata.refundAmount, 0);
});

test("return rejects cross-tenant, cross-branch, active kitchen, and unreferenced non-cash refunds", async () => {
  const { service } = fixture();
  const dto = { reason: "Customer returned item", disposition: "writeOff", refundMethod: "bKash" };
  await assert.rejects(service.returnOrder("tenant-2", "order-1", manager, dto), /Order not found/i);
  await assert.rejects(service.returnOrder("tenant-1", "order-1", { ...manager, branchId: "branch-2" }, dto), /Order not found/i);
  await assert.rejects(service.returnOrder("tenant-1", "order-1", manager, dto), /transaction reference/i);
  const kitchen = fixture({ kitchenTicket: { status: "preparing" } });
  await assert.rejects(kitchen.service.returnOrder("tenant-1", "order-1", manager, { ...dto, refundReference: "BK-123" }), /Finish kitchen service/i);
});

test("reports net same-period returns and use payment events for collected amounts", async () => {
  const today = new Date();
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const oldDate = new Date(Date.now() - 120 * 24 * 60 * 60 * 1000);
  const created = [
    { id: "returned-today", createdAt: today, updatedAt: today, status: "Refunded", total: 100, paidAmount: 80 },
    { id: "active", createdAt: yesterday, updatedAt: yesterday, status: "Completed", total: 50, paidAmount: 20 },
  ];
  const returned = [created[0], { id: "returned-old", createdAt: oldDate, updatedAt: today, status: "Refunded", total: 30, paidAmount: 30 }];
  const payments = [
    { method: "Cash", amount: 80 }, { method: "Cash", amount: -80 }, { method: "Cash", amount: 20 }, { method: "bKash", amount: -30 },
  ];
  const db = {
    order: { async findMany({ where }) { return where.status === "Refunded" ? returned : created; } },
    orderPayment: { async findMany() { return payments; } },
  };
  const report = await new DashboardService(db).report("tenant-1", 7, "branch-1");
  assert.equal(report.totalSales, 20);
  assert.equal(report.orderCount, 1);
  assert.equal(report.returnCount, 2);
  assert.equal(report.refundAmount, 110);
  assert.deepEqual(report.paymentMix, [{ method: "Cash", amount: 20 }, { method: "bKash", amount: -30 }]);
});
