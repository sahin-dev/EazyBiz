import assert from "node:assert/strict";
import test from "node:test";
import domain from "../packages/domain/dist/index.js";

const { allBusinessTypes, availableRecommendedModules, businessTypeConfigs, calculateSubscriptionAmount, moduleCatalog, requiresPrescription, roundMoney } = domain;

test("every business recommendation exists and is compatible", () => {
  for (const businessType of allBusinessTypes) {
    const recommended = businessTypeConfigs[businessType].recommendedModules;
    assert.equal(new Set(recommended).size, recommended.length, `${businessType} has duplicate modules`);
    for (const id of recommended) {
      const definition = moduleCatalog.find((module) => module.id === id);
      assert.ok(definition, `${businessType}: unknown module ${id}`);
      assert.ok(definition.businessTypes.includes(businessType), `${businessType}: incompatible module ${id}`);
    }
    assert.ok(availableRecommendedModules(businessType).includes("pos"));
    assert.ok(availableRecommendedModules(businessType).every((id) => moduleCatalog.find((module) => module.id === id).available));
  }
});

test("planned modules cannot increase subscription charges", () => {
  const baseline = calculateSubscriptionAmount("business", ["pos", "inventory"], "monthly");
  assert.equal(calculateSubscriptionAmount("business", ["pos", "inventory", "pharmacy", "crm"], "monthly"), baseline);
  assert.equal(calculateSubscriptionAmount("business", ["pos", "inventory", "pos"], "yearly"), baseline * 12);
  assert.ok(!availableRecommendedModules("pharmacy").includes("pharmacy"));
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
