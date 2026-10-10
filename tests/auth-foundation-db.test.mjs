import assert from "node:assert/strict";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { createRequire } from "node:module";
import { test } from "node:test";
import { AuthService } from "../apps/api/src/modules/auth/auth.service.ts";
import { JwtStrategy } from "../apps/api/src/modules/auth/jwt.strategy.ts";
import { AuthController } from "../apps/api/src/modules/auth/auth.controller.ts";
import { RateLimitGuard } from "../apps/api/src/common/rate-limit/rate-limit.guard.ts";

const apiRequire = createRequire(new URL("../apps/api/package.json", import.meta.url));
const { PrismaClient } = apiRequire("@prisma/client");
const { JwtService } = apiRequire("@nestjs/jwt");
const { Reflector } = apiRequire("@nestjs/core");
const { hash, compare } = apiRequire("bcryptjs");
const url = process.env.TEST_DATABASE_URL;
if (!url || process.env.NODE_ENV === "production" || !["localhost", "127.0.0.1", "[::1]"].includes(new URL(url).hostname)) {
  throw new Error("Set TEST_DATABASE_URL to a local, non-production PostgreSQL database.");
}
const prisma = new PrismaClient({ datasources: { db: { url } } });

test("membership roles, switching, revocation and reset remain tenant isolated", { timeout: 30000 }, async () => {
  const marker = randomUUID();
  const tenantIds = [];
  const userIds = [];
  const secret = "integration-test-jwt-secret-with-at-least-32-characters";
  const jwt = new JwtService({ secret, signOptions: { expiresIn: "8h" } });
  const auth = new AuthService(prisma, jwt, { ready: false }, null);
  const strategy = new JwtStrategy({ get: () => secret }, prisma);
  try {
    const tenants = [];
    for (const suffix of ["a", "b", "c"]) {
      const tenant = await prisma.tenant.create({ data: { name: `Auth test ${suffix} ${marker}`, businessType: "retail", phone: "01700000000" } });
      tenantIds.push(tenant.id);
      const branch = await prisma.branch.create({ data: { tenantId: tenant.id, name: "Main", code: "MAIN", address: "Dhaka" } });
      tenants.push({ tenant, branch });
    }
    const [a, b, c] = tenants;
    const password = "Very secure password 2026";
    const user = await prisma.user.create({ data: { tenantId: a.tenant.id, name: "Shared owner", email: `${marker}@example.test`, passwordHash: await hash(password, 12), role: "owner" } });
    userIds.push(user.id);
    await prisma.tenantMembership.create({ data: { userId: user.id, tenantId: a.tenant.id, role: "owner" } });
    await prisma.tenantMembership.create({ data: { userId: user.id, tenantId: b.tenant.id, branchId: b.branch.id, role: "manager" } });
    const outsider = await prisma.user.create({ data: { tenantId: c.tenant.id, name: "Other owner", email: `${marker}-other@example.test`, passwordHash: await hash(password, 12), role: "owner", emailVerifiedAt: new Date() } });
    userIds.push(outsider.id);
    await prisma.tenantMembership.create({ data: { userId: outsider.id, tenantId: c.tenant.id, role: "owner" } });

    await assert.rejects(prisma.tenantMembership.create({ data: { userId: outsider.id, tenantId: a.tenant.id, branchId: b.branch.id, role: "manager" } }), (error) => error?.code === "P2003");

    await assert.rejects(auth.login({ email: user.email, password, workspace: "business" }), /incorrect/i);
    const verifyToken = randomBytes(32).toString("hex");
    await prisma.accountToken.create({ data: { userId: user.id, tokenHash: createHash("sha256").update(verifyToken).digest("hex"), purpose: "verify", expiresAt: new Date(Date.now() + 60_000) } });
    await auth.verifyEmail(verifyToken);
    await assert.rejects(auth.verifyEmail(verifyToken), /invalid or has expired/i);

    const route = "AuthController.login";
    const emailKey = createHash("sha256").update(`${route}:email:${user.email}`).digest("hex");
    const ipKeys = ["one", "two", "three"].map((suffix) => createHash("sha256").update(`${route}:ip:${marker}-${suffix}`).digest("hex"));
    try {
      const guards = [new RateLimitGuard(new Reflector(), { get: () => undefined }, prisma), new RateLimitGuard(new Reflector(), { get: () => undefined }, prisma)];
      const context = (suffix) => ({ getClass: () => AuthController, getHandler: () => AuthController.prototype.login,
        switchToHttp: () => ({ getRequest: () => ({ ip: `${marker}-${suffix}`, body: { email: user.email }, socket: {} }) }) });
      for (let index = 0; index < 10; index += 1) assert.equal(await guards[index % 2].canActivate(context(index < 5 ? "one" : "two")), true);
      await assert.rejects(guards[0].canActivate(context("three")), (error) => error?.status === 429);
    } finally {
      await prisma.rateLimitBucket.deleteMany({ where: { key: { in: [emailKey, ...ipKeys] } } });
    }

    const first = await auth.login({ email: user.email, password, workspace: "business" });
    const firstPayload = await jwt.verifyAsync(first.accessToken);
    assert.equal((await strategy.validate(firstPayload)).role, "owner");
    assert.equal(first.user.tenantId, a.tenant.id);
    assert.equal((await auth.memberships(user.id)).length, 2);
    await assert.rejects(auth.switchTenant({ ...(await strategy.validate(firstPayload)) }, c.tenant.id), /do not have access/i);
    assert.equal((await strategy.validate(firstPayload)).tenantId, a.tenant.id);

    const second = await auth.switchTenant(await strategy.validate(firstPayload), b.tenant.id);
    const secondPayload = await jwt.verifyAsync(second.accessToken);
    await assert.rejects(strategy.validate(firstPayload), /Unauthorized/);
    await assert.rejects(strategy.validate({ ...secondPayload, tenantId: a.tenant.id }), /Unauthorized/);
    const switched = await strategy.validate(secondPayload);
    assert.equal(switched.role, "manager");
    assert.equal(switched.branchId, b.branch.id);
    assert.equal((await auth.session(user.id, b.tenant.id)).tenant.id, b.tenant.id);

    await prisma.tenantMembership.update({ where: { userId_tenantId: { userId: user.id, tenantId: b.tenant.id } }, data: { status: "suspended" } });
    await assert.rejects(strategy.validate(secondPayload), /Unauthorized/);
    assert.equal((await auth.login({ email: user.email, password, workspace: "business" })).user.tenantId, a.tenant.id);
    await prisma.tenantMembership.update({ where: { userId_tenantId: { userId: user.id, tenantId: b.tenant.id } }, data: { status: "active" } });
    await auth.logout(switched);
    await assert.rejects(strategy.validate(secondPayload), /Unauthorized/);

    const third = await auth.login({ email: user.email, password, workspace: "business" });
    const thirdPayload = await jwt.verifyAsync(third.accessToken);
    const resetToken = randomBytes(32).toString("hex");
    await prisma.accountToken.create({ data: { userId: user.id, tokenHash: createHash("sha256").update(resetToken).digest("hex"), purpose: "reset", expiresAt: new Date(Date.now() + 60_000) } });
    await auth.resetPassword(resetToken, "Another secure password 2026");
    await assert.rejects(auth.resetPassword(resetToken, "Third secure password 2026"), /invalid or has expired/i);
    await assert.rejects(strategy.validate(thirdPayload), /Unauthorized/);
    assert.equal(await compare("Another secure password 2026", (await prisma.user.findUniqueOrThrow({ where: { id: user.id } })).passwordHash), true);
    assert.equal((await auth.login({ email: user.email, password: "Another secure password 2026" })).user.tenantId, a.tenant.id);
    await prisma.tenant.delete({ where: { id: a.tenant.id } });
    assert.equal((await prisma.user.findUniqueOrThrow({ where: { id: user.id } })).tenantId, null);
    assert.equal((await auth.login({ email: user.email, password: "Another secure password 2026" })).user.tenantId, b.tenant.id);
  } finally {
    await prisma.auditLog.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.tenantMembership.deleteMany({ where: { tenantId: { in: tenantIds } } });
    await prisma.authSession.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    await prisma.tenant.deleteMany({ where: { id: { in: tenantIds } } });
    await prisma.$disconnect();
  }
});
