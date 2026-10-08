import { PrismaClient } from "@prisma/client";
import { calculateSubscriptionAmount, moduleCatalog } from "@businessos/domain";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();
const demoPassword = "Demo@12345";
const demoOwners = [
  { tenantName: "ABC Restaurant", name: "Farhan Rahman", email: "owner@abcrestaurant.bd" },
  { tenantName: "ABC Pharmacy", name: "Dr. Imran Kabir", email: "owner@abcpharmacy.bd" },
  { tenantName: "ABC Grocery", name: "Nusrat Jahan", email: "owner@abcgrocery.bd" },
];

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Demo owner accounts must not be created in production.");
  }

  const passwordHash = await hash(demoPassword, 12);
  for (const owner of demoOwners) {
    const tenant = await prisma.tenant.findFirst({
      where: { name: owner.tenantName },
      include: {
        branches: { where: { isActive: true }, orderBy: { createdAt: "asc" }, take: 1 },
        modules: true,
        products: true,
      },
    });
    if (!tenant || tenant.branches.length === 0) {
      throw new Error(`Cannot find the seeded tenant and active branch for ${owner.tenantName}.`);
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: owner.email },
      select: { tenantId: true, role: true },
    });
    let createdUser = false;
    if (existingUser) {
      if (existingUser.tenantId !== tenant.id || existingUser.role !== "owner") {
        throw new Error(`The demo email ${owner.email} is already assigned to another account.`);
      }
    } else {
      await prisma.user.create({
        data: {
          tenantId: tenant.id,
          branchId: tenant.branches[0].id,
          name: owner.name,
          email: owner.email,
          passwordHash,
          role: "owner",
          status: "active",
        },
      });
      createdUser = true;
    }

    const enabledModules = tenant.modules
      .filter((module) => module.enabled)
      .flatMap((module) => moduleCatalog.find((definition) => definition.id === module.moduleId)?.id ?? []);
    const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    await prisma.subscription.upsert({
      where: { tenantId: tenant.id },
      create: {
        tenantId: tenant.id,
        planCode: "starter",
        status: "trialing",
        interval: "monthly",
        amount: calculateSubscriptionAmount("starter", enabledModules, "monthly"),
        trialEndsAt,
        currentPeriodEnd: trialEndsAt,
      },
      update: {},
    });
    await prisma.inventoryBalance.createMany({
      data: tenant.products.map((product) => ({
        tenantId: tenant.id,
        branchId: tenant.branches[0].id,
        productId: product.id,
        quantity: product.stock,
        minimumStock: product.minimumStock,
      })),
      skipDuplicates: true,
    });
    console.log(`${createdUser ? "Created" : "Verified"} demo owner: ${owner.email}`);
  }
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
