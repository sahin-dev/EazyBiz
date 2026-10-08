import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.PLATFORM_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.PLATFORM_ADMIN_PASSWORD;
  if (!email || !password || password.length < 12) {
    throw new Error("Set PLATFORM_ADMIN_EMAIL and a PLATFORM_ADMIN_PASSWORD of at least 12 characters.");
  }

  const existing = await prisma.user.findUnique({ where: { email }, select: { tenantId: true, role: true } });
  if (existing && (existing.tenantId !== null || existing.role !== "platformAdmin")) {
    throw new Error("The configured platform-admin email is already assigned to a tenant account.");
  }

  const passwordHash = await hash(password, 12);
  await prisma.user.upsert({
    where: { email },
    create: {
      tenantId: null,
      branchId: null,
      name: "Platform Administrator",
      email,
      passwordHash,
      role: "platformAdmin",
      status: "active",
    },
    update: {
      tenantId: null,
      branchId: null,
      name: "Platform Administrator",
      passwordHash,
      role: "platformAdmin",
      status: "active",
    },
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
