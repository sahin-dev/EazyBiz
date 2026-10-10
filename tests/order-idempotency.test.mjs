import assert from "node:assert/strict";
import { test } from "node:test";
import { OrdersService } from "../apps/api/src/modules/orders/orders.service.ts";
import { StorefrontsService } from "../apps/api/src/modules/storefronts/storefronts.service.ts";

const key = "7f3075c4-7c08-462a-86d3-f334f08add3e";
const user = { id: "cashier-1", tenantId: "tenant-1", branchId: "branch-1", role: "cashier" };
const orderInput = { branchId: "branch-1", source: "pos", paymentMethod: "Cash", items: [{ productId: "product-1", quantity: 2 }] };

function fixture() {
  const orders = new Map();
  const calls = { created: 0, stock: 0, movements: 0, customers: 0 };
  const tx = {
    customer: {
      async upsert() { calls.customers += 1; return { id: "customer-1" }; },
      async update() { return {}; },
    },
    inventoryBalance: {
      async findUnique() { return { id: "balance-1", quantity: 10 }; },
      async updateMany() { calls.stock += 1; return { count: 1 }; },
    },
    product: { async update() { return {}; } },
    order: {
      async create({ data }) {
        calls.created += 1;
        const order = { ...data, id: `order-${calls.created}`, items: data.items.create, payments: data.payments ? [data.payments.create] : [] };
        orders.set(`${data.tenantId}:${data.idempotencyKey}`, order);
        return order;
      },
    },
    tenantModule: { async findFirst() { return null; } },
    inventoryMovement: { async createMany() { calls.movements += 1; } },
    auditLog: { async create() { return {}; } },
  };
  const prisma = {
    order: { async findFirst({ where }) { return orders.get(`${where.tenantId}:${where.idempotencyKey}`) ?? null; } },
    tenant: { async findUnique() { return { businessType: "retail", vatRate: 0, serviceRate: 0, branches: [{ id: "branch-1" }] }; } },
    product: { async findMany() { return [{ id: "product-1", name: "Rice", stock: 10, salePrice: 100, discountPrice: null }]; } },
    async $transaction(callback) { return callback(tx); },
  };
  return { service: new OrdersService(prisma), calls };
}

test("retrying a POS checkout returns its original order without another stock movement", async () => {
  const { service, calls } = fixture();
  const first = await service.create("tenant-1", user, orderInput, key);
  const replay = await service.create("tenant-1", user, orderInput, key);
  assert.equal(replay.id, first.id);
  assert.equal(calls.created, 1);
  assert.equal(calls.stock, 1);
  assert.equal(calls.movements, 1);
});

test("an idempotency key cannot be reused for a different cart or actor", async () => {
  const { service, calls } = fixture();
  await service.create("tenant-1", user, orderInput, key);
  await assert.rejects(service.create("tenant-1", user, { ...orderInput, items: [{ productId: "product-1", quantity: 3 }] }, key), /different order/i);
  await assert.rejects(service.create("tenant-1", { ...user, id: "cashier-2" }, orderInput, key), /different order/i);
  await assert.rejects(service.create("tenant-1", user, orderInput, "short"), /valid idempotency key/i);
  assert.equal(calls.created, 1);
});

test("storefront retries and conflicts do not write customer records", async () => {
  const { service, calls } = fixture();
  const input = { ...orderInput, source: "storefront", paymentMethod: "Due", paidAmount: 0 };
  const shopper = { customerName: "Mira", phone: "01712345678" };
  const customer = { name: shopper.customerName, phone: shopper.phone };
  const first = await service.create("tenant-1", null, input, key, shopper, customer);
  const replay = await service.create("tenant-1", null, input, key, shopper, customer);
  assert.equal(replay.id, first.id);
  await assert.rejects(service.create("tenant-1", null, input, key, { ...shopper, customerName: "Other" }, customer), /different order/i);
  assert.equal(calls.customers, 1);
  assert.equal(calls.created, 1);
});

test("storefront forwards the request key and shopper payload to order creation", async () => {
  let received;
  const storefronts = new StorefrontsService({}, { async create(...args) { received = args; return { orderNo: "ORD-1", total: 200, status: "Pending" }; } });
  storefronts.publicStore = async () => ({ tenantId: "tenant-1", tenant: { branches: [{ id: "branch-1" }] }, deliveryEnabled: true, pickupEnabled: true });
  const input = { branchId: "branch-1", customerName: "Mira", phone: "01712345678", fulfillment: "pickup", items: [{ productId: "product-1", quantity: 2 }] };
  await storefronts.placeOrder("store-one", input, key);
  assert.equal(received[0], "tenant-1");
  assert.equal(received[3], key);
  assert.deepEqual(received[4], input);
  assert.deepEqual(received[5], { name: "Mira", phone: "01712345678", address: undefined });
});
