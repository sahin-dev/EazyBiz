import assert from "node:assert/strict";
import test from "node:test";
import domain from "../packages/domain/dist/index.js";

const { allBusinessTypes, availableRecommendedModules, businessTypeConfigs, businessTypeOptions, calculateSubscriptionAmount, getBusinessTypeConfig, hasPermission, moduleCatalog, normalizeBusinessType, requiresPrescription, roundMoney, sanitizeProductAttributes } = domain;

test("operational roles cannot read unrelated financial or customer records", () => {
  assert.equal(hasPermission("cashier", "sale:create"), true);
  assert.equal(hasPermission("cashier", "inventory:view"), false);
  assert.equal(hasPermission("cashier", "report:view"), false);
  assert.equal(hasPermission("kitchenStaff", "kitchen:view"), true);
  assert.equal(hasPermission("kitchenStaff", "customer:view"), false);
  assert.equal(hasPermission("accountant", "report:view"), true);
  assert.equal(hasPermission("platformAdmin", "dashboard:view"), false);
  assert.equal(hasPermission("unknown", "order:view"), false);
});

test("every business recommendation exists and is compatible", () => {
  for (const businessType of allBusinessTypes) {
    const config = businessTypeConfigs[businessType];
    const recommended = config.recommendedModules;
    assert.equal(new Set(recommended).size, recommended.length, `${businessType} has duplicate modules`);
    for (const id of recommended) {
      const definition = moduleCatalog.find((module) => module.id === id);
      assert.ok(definition, `${businessType}: unknown module ${id}`);
      assert.ok(definition.businessTypes.includes(businessType), `${businessType}: incompatible module ${id}`);
    }
    assert.ok(config.name);
    assert.ok(config.icon);
    assert.ok(config.description);
    assert.ok(config.defaultNavigation.some((item) => item.href === "/pos"));
    assert.ok(config.productFields.some((field) => field.scope === "core" && field.key === "sku"));
    assert.ok(config.dashboardWidgets.length, `${businessType} should define dashboard widgets`);
    assert.ok(config.workflows.length, `${businessType} should define workflows`);
    assert.ok(config.reports.length, `${businessType} should define reports`);
    assert.ok(config.storefrontTheme.name);
    assert.ok(config.pos.saleModes.length);
    assert.equal(config.inventory.allowNegativeStock, false);
    assert.ok(availableRecommendedModules(businessType).includes("pos"));
    assert.ok(availableRecommendedModules(businessType).every((id) => moduleCatalog.find((module) => module.id === id).available));
  }
});

test("business type engine supports canonical ids, public slugs, and attribute sanitizing", () => {
  assert.equal(normalizeBusinessType("cloud_kitchen"), "cloudKitchen");
  assert.equal(normalizeBusinessType("super_shop"), "superShop");
  assert.equal(getBusinessTypeConfig("cloud_kitchen").id, "cloudKitchen");
  assert.equal(businessTypeOptions().length, allBusinessTypes.length);
  const attributes = sanitizeProductAttributes("pharmacy", {
    genericName: "Paracetamol",
    prescriptionRequired: "true",
    unknown: "ignored",
  });
  assert.deepEqual(attributes, { genericName: "Paracetamol", prescriptionRequired: true });
});

test("planned modules cannot increase subscription charges", () => {
  const baseline = calculateSubscriptionAmount("business", ["pos", "inventory"], "monthly");
  assert.equal(calculateSubscriptionAmount("business", ["pos", "inventory", "api", "marketing"], "monthly"), baseline);
  assert.equal(calculateSubscriptionAmount("business", ["pos", "inventory", "pharmacy"], "monthly"), baseline + 850);
  assert.equal(calculateSubscriptionAmount("business", ["pos", "inventory", "pos"], "yearly"), baseline * 12);
  assert.ok(availableRecommendedModules("pharmacy").includes("pharmacy"));
  assert.ok(!availableRecommendedModules("grocery").includes("barcodeScale"));
});

test("prescription policy handles normalized and legacy values", () => {
  assert.equal(requiresPrescription({ prescriptionRequired: true }), true);
  assert.equal(requiresPrescription({ prescriptionRequired: "true" }), true);
  assert.equal(requiresPrescription({ prescriptionRequired: false }), false);
  assert.equal(requiresPrescription({}), false);
  assert.equal(requiresPrescription(null), false);
});

test("money arithmetic closes at two decimals", () => {
  assert.equal(roundMoney(0.1 + 0.2), 0.3);
  assert.equal(roundMoney(9.99 * 3), 29.97);
  assert.equal(roundMoney(0.3 - (0.1 + 0.2)), 0);
});
