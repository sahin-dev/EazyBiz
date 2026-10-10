import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { getBusinessTypeConfig, sanitizeProductAttributes } from "@businessos/domain";
import type { AuthUser } from "../../common/auth/auth-user";
import { PrismaService } from "../../common/prisma/prisma.service";
import { AdjustStockDto } from "./adjust-stock.dto";
import { CreateProductDto } from "./create-product.dto";

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string) {
    await this.assertTenant(tenantId);
    return this.prisma.product.findMany({
      where: { tenantId, active: true },
      select: {
        id: true, name: true, imageUrl: true, sku: true, barcode: true,
        category: true, salePrice: true, discountPrice: true, stock: true,
        minimumStock: true, unit: true, featured: true, attributes: true,
      },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });
  }

  catalog(tenantId: string) {
    return this.prisma.product.findMany({
      where: { tenantId, active: true },
      select: {
        id: true, name: true, imageUrl: true, sku: true, barcode: true,
        category: true, salePrice: true, discountPrice: true, unit: true, featured: true,
      },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });
  }

  async create(tenantId: string, user: AuthUser, dto: CreateProductDto) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId }, select: { businessType: true } });
    if (!tenant) throw new NotFoundException("Tenant not found.");
    const config = getBusinessTypeConfig(tenant.businessType);
    const attributes = sanitizeProductAttributes(tenant.businessType, dto.attributes);
    for (const definition of config.productAttributes) {
      const value = attributes[definition.key];
      if (definition.required && (value === null || value === undefined || value === "")) {
        throw new BadRequestException(`${definition.label} is required for ${config.name} products.`);
      }
      if (definition.type === "number" && typeof value === "number" && !Number.isFinite(value)) {
        throw new BadRequestException(`${definition.label} must be a valid number.`);
      }
    }
    const branchId = user.branchId ?? (await this.defaultBranch(tenantId));
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({ data: { tenantId, ...dto, attributes } });
      await tx.inventoryBalance.create({
        data: { tenantId, branchId, productId: product.id, quantity: dto.stock, minimumStock: dto.minimumStock },
      });
      if (dto.stock > 0) {
        await tx.inventoryMovement.create({
          data: { tenantId, branchId, productId: product.id, type: "opening", quantity: dto.stock, balanceAfter: dto.stock, createdById: user.id },
        });
      }
      await tx.auditLog.create({ data: { tenantId, userId: user.id, action: "product.created", entityType: "Product", entityId: product.id } });
      return product;
    });
  }

  async adjustStock(tenantId: string, productId: string, user: AuthUser, dto: AdjustStockDto) {
    await this.assertTenant(tenantId);
    const product = await this.prisma.product.findFirst({ where: { id: productId, tenantId } });
    if (!product) throw new NotFoundException("Product not found.");
    const branchId = dto.branchId ?? user.branchId ?? (await this.defaultBranch(tenantId));
    if (user.branchId && branchId !== user.branchId) throw new BadRequestException("Your account is assigned to a different branch.");
    const branch = await this.prisma.branch.findFirst({ where: { id: branchId, tenantId, isActive: true }, select: { id: true } });
    if (!branch) throw new BadRequestException("Invalid branch.");

    return this.prisma.$transaction(async (tx) => {
      const current = await tx.inventoryBalance.findUnique({ where: { branchId_productId: { branchId, productId } } });
      if (!current && dto.delta < 0) throw new BadRequestException("Stock cannot be negative.");
      if (current) {
        const balanceUpdated = await tx.inventoryBalance.updateMany({
          where: { id: current.id, ...(dto.delta < 0 ? { quantity: { gte: -dto.delta } } : {}) },
          data: { quantity: { increment: dto.delta } },
        });
        if (balanceUpdated.count !== 1) throw new BadRequestException("Stock changed. Refresh and retry.");
      } else {
        await tx.inventoryBalance.create({ data: { tenantId, branchId, productId, quantity: dto.delta, minimumStock: product.minimumStock } });
      }
      const productUpdated = await tx.product.updateMany({
        where: { id: productId, tenantId, ...(dto.delta < 0 ? { stock: { gte: -dto.delta } } : {}) },
        data: { stock: { increment: dto.delta } },
      });
      if (productUpdated.count !== 1) throw new BadRequestException("Stock changed. Refresh and retry.");
      const balance = await tx.inventoryBalance.findUniqueOrThrow({ where: { branchId_productId: { branchId, productId } } });
      const updated = await tx.product.findUniqueOrThrow({ where: { id: productId } });
      await tx.inventoryMovement.create({
        data: { tenantId, branchId, productId, type: dto.type, quantity: dto.delta, balanceAfter: balance.quantity, note: dto.reason, createdById: user.id },
      });
      await tx.auditLog.create({
        data: { tenantId, userId: user.id, action: "stock.adjusted", entityType: "Product", entityId: productId, metadata: { delta: dto.delta, branchId, reason: dto.reason } },
      });
      return updated;
    });
  }

  private async defaultBranch(tenantId: string) {
    const branch = await this.prisma.branch.findFirst({ where: { tenantId, isActive: true }, orderBy: { createdAt: "asc" } });
    if (!branch) throw new BadRequestException("No active branch is configured.");
    return branch.id;
  }

  private async assertTenant(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId }, select: { id: true } });
    if (!tenant) throw new NotFoundException("Tenant not found.");
  }
}
