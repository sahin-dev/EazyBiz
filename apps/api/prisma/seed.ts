import { PrismaClient, type BusinessType } from "@prisma/client";
import { availableRecommendedModules, businessTypeConfigs, calculateSubscriptionAmount } from "@businessos/domain";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();
const demoPassword = "Demo@12345";

if (process.env.NODE_ENV === "production" || process.env.ALLOW_DESTRUCTIVE_DEMO_SEED !== "1") {
  throw new Error("Destructive demo seed blocked. Use only on an isolated development database with ALLOW_DESTRUCTIVE_DEMO_SEED=1.");
}

const businesses: Array<{
  name: string;
  businessType: BusinessType;
  phone: string;
  email: string;
  owner: string;
  branch: string;
  products: Array<[string, string, string, number, number, string, number, number]>;
}> = [
  {
    name: "ABC Restaurant",
    businessType: "restaurant",
    phone: "01711112222",
    email: "owner@abcrestaurant.bd",
    owner: "Farhan Rahman",
    branch: "Dhanmondi",
    products: [
      ["Chicken Biryani", "RES-001", "Rice & Biryani", 165, 280, "plate", 42, 10],
      ["Beef Burger", "RES-002", "Fast Food", 120, 220, "piece", 28, 8],
      ["Cold Coffee", "RES-003", "Beverage", 55, 140, "glass", 18, 10],
      ["Grilled Chicken", "RES-004", "Main Course", 220, 390, "plate", 16, 6],
    ],
  },
  {
    name: "ABC Pharmacy",
    businessType: "pharmacy",
    phone: "01733334444",
    email: "owner@abcpharmacy.bd",
    owner: "Dr. Imran Kabir",
    branch: "Mirpur",
    products: [
      ["Paracetamol 500mg", "MED-001", "Tablet", 1.4, 2, "piece", 2200, 300],
      ["Omeprazole 20mg", "MED-002", "Capsule", 4.9, 7, "piece", 780, 120],
      ["Vitamin C", "MED-003", "Supplement", 3.5, 6, "piece", 95, 100],
      ["Oral Saline", "MED-004", "First Aid", 5, 6, "sachet", 320, 80],
    ],
  },
  {
    name: "ABC Grocery",
    businessType: "grocery",
    phone: "01855556666",
    email: "owner@abcgrocery.bd",
    owner: "Nusrat Jahan",
    branch: "Chattogram",
    products: [
      ["Miniket Rice 5kg", "GRO-001", "Rice & Grains", 370, 420, "bag", 31, 12],
      ["Fresh Milk 1L", "GRO-002", "Dairy", 82, 95, "bottle", 21, 15],
      ["Soybean Oil 5L", "GRO-003", "Cooking Essentials", 760, 820, "bottle", 7, 10],
      ["Red Lentil 1kg", "GRO-004", "Rice & Grains", 128, 145, "pack", 46, 12],
    ],
  },
];

async function resetDatabase() {
  await prisma.auditLog.deleteMany();
  await prisma.subscriptionPayment.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.orderPayment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.inventoryMovement.deleteMany();
  await prisma.purchaseItem.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.inventoryBalance.deleteMany();
  await prisma.product.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.staffMember.deleteMany();
  await prisma.storefront.deleteMany();
  await prisma.tenantModule.deleteMany();
  await prisma.user.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.tenant.deleteMany();
}

async function createBusiness(input: (typeof businesses)[number], passwordHash: string) {
  const config = businessTypeConfigs[input.businessType];
  const tenant = await prisma.tenant.create({
    data: {
      name: input.name,
      businessType: input.businessType,
      status: "active",
      phone: input.phone,
      email: input.email,
      plan: "Business",
      serviceRate: config.pos.serviceRate,
      branches: { create: { name: input.branch, code: "MAIN", address: `${input.branch}, Bangladesh`, phone: input.phone } },
      modules: { create: availableRecommendedModules(input.businessType).map((moduleId) => ({ moduleId })) },
      subscription: {
        create: {
          planCode: "business",
          status: "active",
          amount: calculateSubscriptionAmount("business", availableRecommendedModules(input.businessType), "monthly"),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      },
      storefront: {
        create: {
          slug: input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
          heroTitle: input.name,
          tagline: config.storefrontTheme.heroTone,
          theme: config.storefrontTheme.name,
          primaryColor: config.storefrontTheme.primaryColor,
          sections: [
            { id: "hero", type: "hero", title: input.name, subtitle: "Order online for delivery or pickup.", visible: true },
            { id: "categories", type: "categories", title: "Shop by category", subtitle: "Find what you need quickly.", visible: true },
            { id: "featured", type: "featuredProducts", title: "Featured products", subtitle: "Popular with our customers.", visible: true },
          ],
        },
      },
    },
    include: { branches: true },
  });
  const branch = tenant.branches[0];
  const businessType = await prisma.businessTypeDefinition.findUniqueOrThrow({ where: { code: input.businessType } });
  const business = await prisma.business.create({ data: { tenantId: tenant.id, businessTypeId: businessType.id, legalName: input.name, tradingName: input.name, currencyCode: tenant.currency } });
  await prisma.branch.update({ where: { id: branch.id }, data: { businessId: business.id } });
  const owner = await prisma.user.create({
    data: { tenantId: tenant.id, branchId: branch.id, name: input.owner, email: input.email, phone: input.phone, passwordHash, role: "owner", emailVerifiedAt: new Date() },
  });
  await prisma.tenantMembership.create({ data: { userId: owner.id, tenantId: tenant.id, branchId: branch.id, role: "owner" } });

  for (const [name, sku, category, purchasePrice, salePrice, unit, stock, minimumStock] of input.products) {
    const attributes = input.businessType === "pharmacy"
      ? { genericName: name.split(" ")[0], manufacturer: "Local manufacturer", prescriptionRequired: false }
      : input.businessType === "restaurant"
        ? { prepTime: 20, kitchenStation: "Main Kitchen", hasRecipe: true }
        : { weightBased: false, packSize: unit, mrp: salePrice };
    const imageUrl = sku === "RES-001" ? "/products/chicken-biryani.png"
      : sku === "RES-002" ? "/products/beef-burger.png"
      : sku === "RES-003" ? "/products/cold-coffee.png"
      : sku === "RES-004" ? "/products/grilled-chicken.png"
      : sku === "MED-001" ? "/products/medicine.png"
      : sku === "GRO-001" ? "/products/rice.png" : null;
    const product = await prisma.product.create({
      data: { tenantId: tenant.id, name, sku, category, purchasePrice, salePrice, unit, stock, minimumStock, featured: true, attributes, imageUrl },
    });
    await prisma.inventoryBalance.create({
      data: { tenantId: tenant.id, branchId: branch.id, productId: product.id, quantity: stock, minimumStock },
    });
    await prisma.inventoryMovement.create({
      data: { tenantId: tenant.id, branchId: branch.id, productId: product.id, type: "opening", quantity: stock, balanceAfter: stock, createdById: owner.id },
    });
  }

  await prisma.supplier.create({
    data: { tenantId: tenant.id, name: `${input.name} Primary Supplier`, category: "General", phone: "01700000000", address: "Dhaka, Bangladesh" },
  });
  await prisma.customer.create({
    data: { tenantId: tenant.id, name: "Walk-in Customer", phone: `01${tenant.id.replace(/\D/g, "").slice(0, 9).padEnd(9, "0")}` },
  });
  await prisma.staffMember.create({
    data: { tenantId: tenant.id, branchId: branch.id, employeeNo: "EMP-001", name: `${input.branch} Cashier`, role: "Cashier", shift: "10:00 AM - 8:00 PM", salary: 22000 },
  });
}

async function main() {
  await resetDatabase();
  const passwordHash = await hash(demoPassword, 12);
  for (const business of businesses) await createBusiness(business, passwordHash);
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
