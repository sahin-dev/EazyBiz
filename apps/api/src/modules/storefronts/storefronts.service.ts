import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { requiresPrescription } from "@businessos/domain";
import type { AuthUser } from "../../common/auth/auth-user";
import { PrismaService } from "../../common/prisma/prisma.service";
import { OrdersService } from "../orders/orders.service";
import { PlaceStorefrontOrderDto, UpdateStorefrontDto } from "./storefront.dto";

@Injectable()
export class StorefrontsService {
  constructor(private readonly prisma: PrismaService, private readonly orders: OrdersService) {}

  async get(tenantId: string) {
    const storefront = await this.prisma.storefront.findUnique({ where: { tenantId } });
    if (!storefront) throw new NotFoundException("Storefront is not configured.");
    return storefront;
  }

  async update(tenantId: string, user: AuthUser, dto: UpdateStorefrontDto) {
    const storefront = await this.prisma.storefront.update({
      where: { tenantId },
      data: {
        slug: dto.slug,
        heroTitle: dto.heroTitle,
        tagline: dto.tagline,
        theme: dto.theme,
        primaryColor: dto.primaryColor,
        deliveryEnabled: dto.deliveryEnabled,
        pickupEnabled: dto.pickupEnabled,
        sections: dto.sections.map((section) => ({
          id: section.id,
          type: section.type,
          title: section.title,
          subtitle: section.subtitle ?? "",
          visible: section.visible,
        })),
      },
    });
    await this.prisma.auditLog.create({ data: { tenantId, userId: user.id, action: "storefront.updated", entityType: "Storefront", entityId: storefront.id } });
    return storefront;
  }

  async publish(tenantId: string, user: AuthUser) {
    const productCount = await this.prisma.product.count({ where: { tenantId, active: true } });
    if (!productCount) throw new BadRequestException("Add at least one active product before publishing.");
    const draft = await this.get(tenantId);
    const conflicting = await this.prisma.storefront.findFirst({ where: { publishedSlug: draft.slug, tenantId: { not: tenantId } }, select: { id: true } });
    if (conflicting) throw new BadRequestException("This storefront address is already published by another business.");
    const publishedConfig = { slug: draft.slug, heroTitle: draft.heroTitle, tagline: draft.tagline, theme: draft.theme, primaryColor: draft.primaryColor, deliveryEnabled: draft.deliveryEnabled, pickupEnabled: draft.pickupEnabled, sections: draft.sections };
    const storefront = await this.prisma.storefront.update({ where: { tenantId }, data: { status: "published", publishedAt: new Date(), publishedSlug: draft.slug, publishedConfig } });
    await this.prisma.auditLog.create({ data: { tenantId, userId: user.id, action: "storefront.published", entityType: "Storefront", entityId: storefront.id } });
    return storefront;
  }

  async publicStore(slug: string) {
    const storefront = await this.prisma.storefront.findFirst({
      where: { publishedSlug: slug, status: "published", tenant: { status: { in: ["active", "trial"] }, subscription: { status: { in: ["active", "trialing"] }, currentPeriodEnd: { gt: new Date() } }, modules: { some: { moduleId: "storefront", enabled: true } } } },
      include: {
        tenant: {
          select: {
            name: true,
            phone: true,
            businessType: true,
            vatRate: true,
            serviceRate: true,
            branches: { where: { isActive: true }, select: { id: true, name: true, address: true } },
            products: {
              where: { active: true },
              select: {
                id: true,
                name: true,
                imageUrl: true,
                sku: true,
                category: true,
                salePrice: true,
                discountPrice: true,
                unit: true,
                stock: true,
                featured: true,
                attributes: true,
                inventoryBalances: { select: { branchId: true, quantity: true } },
              },
              orderBy: [{ featured: "desc" }, { name: "asc" }],
            },
          },
        },
      },
    });
    if (!storefront) throw new NotFoundException("Storefront not found.");
    const snapshot = storefront.publishedConfig as { slug: string; heroTitle: string; tagline: string; theme: string; primaryColor: string; deliveryEnabled: boolean; pickupEnabled: boolean; sections: unknown } | null;
    if (!snapshot) throw new NotFoundException("Storefront not found.");
    const products = storefront.tenant.products
      .filter((product) => storefront.tenant.businessType !== "pharmacy" || !requiresPrescription(product.attributes))
      .map(({ attributes: _attributes, ...product }) => product);
    return { id: storefront.id, tenantId: storefront.tenantId, status: storefront.status, publishedAt: storefront.publishedAt, tenant: { ...storefront.tenant, products }, ...snapshot };
  }

  async placeOrder(slug: string, dto: PlaceStorefrontOrderDto) {
    const store = await this.publicStore(slug);
    if (!dto.items.length) throw new BadRequestException("Add at least one product.");
    if (!store.tenant.branches.some((branch) => branch.id === dto.branchId)) throw new BadRequestException("Invalid pickup branch.");
    if (dto.fulfillment === "delivery" && (!store.deliveryEnabled || !dto.address?.trim())) throw new BadRequestException("A delivery address is required.");
    if (dto.fulfillment === "pickup" && !store.pickupEnabled) throw new BadRequestException("Pickup is unavailable.");
    const customer = await this.prisma.customer.upsert({
      where: { tenantId_phone: { tenantId: store.tenantId, phone: dto.phone } },
      create: { tenantId: store.tenantId, name: dto.customerName, phone: dto.phone, address: dto.address },
      update: { name: dto.customerName, address: dto.address || undefined },
      select: { id: true },
    });
    const order = await this.orders.create(store.tenantId, null, {
      branchId: dto.branchId,
      customerId: customer.id,
      source: "storefront",
      orderType: dto.fulfillment,
      paymentMethod: "Due",
      paidAmount: 0,
      notes: [dto.address ? `Address: ${dto.address}` : "", dto.note || ""].filter(Boolean).join(" | "),
      items: dto.items,
    });
    return { orderNo: order.orderNo, total: order.total, status: order.status };
  }
}
