import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createRequire } from "node:module";
import { test } from "node:test";
import { TenantsService } from "../apps/api/src/modules/tenants/tenants.service.ts";

const apiRequire = createRequire(new URL("../apps/api/package.json", import.meta.url));
const { PrismaClient } = apiRequire("@prisma/client");
const url = process.env.TEST_DATABASE_URL;
if (!url || process.env.NODE_ENV === "production" || !["localhost", "127.0.0.1", "[::1]"].includes(new URL(url).hostname)) {
  throw new Error("Set TEST_DATABASE_URL to a local, non-production PostgreSQL database.");
}

const prisma = new PrismaClient({ datasources: { db: { url } } });

test("onboarding creates scoped businesses and rejects cross-tenant branches", { timeout: 30000 }, async () => {
  const marker = randomUUID();
  const tenantIds = [];
  try {
    await prisma.$transaction(async (tx) => {
      const service = new TenantsService({ $transaction: (callback) => callback(tx) });
      const tenants = [];
      for (const suffix of ["a", "b"]) {
        const tenant = await service.create({
          name: `Business foundation ${suffix} ${marker}`,
          businessType: "retail",
          phone: "01700000000",
          email: `${marker}-${suffix}@example.test`,
          password: "Integration-test-password-123",
          ownerName: `Owner ${suffix}`,
          branchName: "Main",
          branchAddress: "Test address",
        });
        tenantIds.push(tenant.id);
        const business = await tx.business.findUniqueOrThrow({ where: { tenantId: tenant.id }, include: { businessType: true } });
        assert.equal(business.businessType.code, "retail");
        assert.equal(business.currencyCode, "BDT");
        assert.equal(tenant.branches.length, 1);
        assert.equal(tenant.branches[0].businessId, business.id);
        tenants.push({ tenant, business });
      }

      await tx.$executeRawUnsafe("SAVEPOINT business_foundation_check");
      try {
        await assert.rejects(
          tx.branch.update({ where: { id: tenants[0].tenant.branches[0].id }, data: { businessId: tenants[1].business.id } }),
          (error) => error?.code === "P2003",
        );
      } finally {
        await tx.$executeRawUnsafe("ROLLBACK TO SAVEPOINT business_foundation_check");
        await tx.$executeRawUnsafe("RELEASE SAVEPOINT business_foundation_check");
      }

      throw new Error("ROLLBACK_BUSINESS_FOUNDATION_FIXTURE");
    });
  } catch (error) {
    if (!(error instanceof Error) || error.message !== "ROLLBACK_BUSINESS_FOUNDATION_FIXTURE") throw error;
  } finally {
    for (const tenantId of tenantIds) assert.equal(await prisma.tenant.findUnique({ where: { id: tenantId } }), null);
    await prisma.$disconnect();
  }
});
