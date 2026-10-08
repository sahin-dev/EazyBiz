import assert from "node:assert/strict";

const apiBase = process.env.SMOKE_API_URL || "http://localhost:4000/api";
const webBase = process.env.SMOKE_WEB_URL || "http://localhost:3100";
const email = process.env.SMOKE_EMAIL;
const password = process.env.SMOKE_PASSWORD;

if (!email || !password) {
  throw new Error("Set SMOKE_EMAIL and SMOKE_PASSWORD for an owner account. The smoke test does not create data.");
}

const checked = [];
async function request(path, options = {}) {
  const response = await fetch(`${apiBase}${path}`, options);
  const data = await response.json().catch(() => null);
  return { response, data };
}
function expectStatus(name, result, status) {
  assert.equal(result.response.status, status, `${name}: ${JSON.stringify(result.data)}`);
  checked.push(name);
}

const health = await request("/health");
expectStatus("database health", health, 200);
assert.equal(health.data.status, "ok");

const login = await request("/auth/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, password }) });
expectStatus("owner login", login, 201);
const token = login.data.accessToken;
const tenant = login.data.tenant;
assert.ok(token && tenant?.id, "Login must return token and tenant.");
const auth = { authorization: `Bearer ${token}` };

expectStatus("session", await request("/auth/me", { headers: auth }), 200);
expectStatus("users", await request(`/tenants/${tenant.id}/users`, { headers: auth }), 200);
expectStatus("audit logs", await request(`/tenants/${tenant.id}/audit-logs`, { headers: auth }), 200);
const accessAudit = await request(`/tenants/${tenant.id}/audit-logs?category=access`, { headers: auth });
expectStatus("access audit filter", accessAudit, 200);
assert.ok(accessAudit.data.items.every((event) => event.action.startsWith("user.")));
expectStatus("invalid audit cursor rejected", await request(`/tenants/${tenant.id}/audit-logs?cursor=other-tenant-event`, { headers: auth }), 400);
expectStatus("cross-tenant audit denial", await request("/tenants/other-tenant-id/audit-logs", { headers: auth }), 403);
expectStatus("cross-tenant denial", await request("/tenants/other-tenant-id/orders", { headers: auth }), 403);
expectStatus("subscription", await request(`/tenants/${tenant.id}/subscription`, { headers: auth }), 200);
expectStatus("subscription modules", await request(`/tenants/${tenant.id}/subscription/modules`, { headers: auth }), 200);
const modules = new Set(tenant.enabledModules);
if (!modules.has("restaurantTables")) {
  expectStatus("disabled module denial", await request(`/tenants/${tenant.id}/tables`, { headers: auth }), 403);
}
const reads = [
  ["dashboard", "dashboard", "pos"], ["products", "products", "inventory"], ["orders", "orders", "pos"],
  ["inventory", "inventory", "inventory"], ["customers", "customers", "customers"], ["suppliers", "suppliers", "suppliers"],
  ["purchases", "purchases", "suppliers"], ["staff", "staff", "staff"], ["storefront", "storefront", "storefront"],
  ["reports", "reports/overview?days=30", "reports"], ["tables", "tables", "restaurantTables"], ["kitchen", "kitchen", "restaurantKitchen"],
];
for (const [name, path, moduleId] of reads) {
  if (modules.has(moduleId)) expectStatus(name, await request(`/tenants/${tenant.id}/${path}`, { headers: auth }), 200);
}

const products = modules.has("inventory") ? (await request(`/tenants/${tenant.id}/products`, { headers: auth })).data : [];
if (products.length && modules.has("pos")) {
  const duplicate = await request(`/tenants/${tenant.id}/orders`, {
    method: "POST", headers: { ...auth, "content-type": "application/json" },
    body: JSON.stringify({ branchId: tenant.branches[0].id, source: "pos", paymentMethod: "Cash", items: [{ productId: products[0].id, quantity: 1 }, { productId: products[0].id, quantity: 1 }] }),
  });
  expectStatus("duplicate order rejected", duplicate, 400);
}
if (login.data.user.branchId && modules.has("inventory")) {
  expectStatus("cross-branch denial", await request(`/tenants/${tenant.id}/inventory?branchId=other-branch-id`, { headers: auth }), 403);
}
if (login.data.user.branchId && modules.has("pos")) {
  expectStatus("cross-branch orders denial", await request(`/tenants/${tenant.id}/orders?branchId=other-branch-id`, { headers: auth }), 403);
}
if (login.data.user.branchId && modules.has("suppliers")) {
  expectStatus("cross-branch purchases denial", await request(`/tenants/${tenant.id}/purchases?branchId=other-branch-id`, { headers: auth }), 403);
}

const cookie = `businessos_token=${token}`;
for (const page of ["dashboard", "pos", "orders", "products", "inventory", "suppliers", "customers", "staff", "users", "audit", "storefront", "reports", "subscription", "tables", "kitchen"]) {
  const moduleId = { pos: "pos", orders: "pos", products: "inventory", inventory: "inventory", suppliers: "suppliers", customers: "customers", staff: "staff", storefront: "storefront", reports: "reports", tables: "restaurantTables", kitchen: "restaurantKitchen" }[page];
  if (moduleId && !modules.has(moduleId)) continue;
  const response = await fetch(`${webBase}/${page}`, { headers: { cookie }, redirect: "manual" });
  assert.equal(response.status, 200, `Web ${page}: ${response.status}`);
  const html = await response.text();
  assert.ok(!html.includes("Could not load workspace"), `Web ${page} rendered an error state.`);
  checked.push(`web ${page}`);
}

const localImage = products.find((product) => product.imageUrl?.startsWith("/products/"));
if (localImage) {
  const response = await fetch(`${webBase}${localImage.imageUrl}`, { redirect: "manual" });
  assert.equal(response.status, 200, "Product image must be publicly accessible.");
  assert.ok(response.headers.get("content-type")?.startsWith("image/"), "Product image must not redirect to login HTML.");
  checked.push("public product photo");
  const optimized = await fetch(`${webBase}/_next/image?url=${encodeURIComponent(localImage.imageUrl)}&w=384&q=75`);
  assert.equal(optimized.status, 200, "Optimized product image must render.");
  assert.ok(optimized.headers.get("content-type")?.startsWith("image/"));
  checked.push("optimized product photo");
}

if (modules.has("storefront")) {
  const store = (await request(`/tenants/${tenant.id}/storefront`, { headers: auth })).data;
  if (store.status === "published") {
    expectStatus("public storefront API", await request(`/storefronts/${store.slug}`), 200);
    const page = await fetch(`${webBase}/store/${store.slug}`);
    assert.equal(page.status, 200, "Published storefront page must load.");
    checked.push("public storefront page");
    expectStatus("invalid public order rejected", await request(`/storefronts/${store.slug}/orders`, { method: "POST", headers: { "content-type": "application/json" }, body: "{}" }), 400);
  }
}

console.log(`Smoke checks passed: ${checked.length}`);
console.log(checked.join(", "));
