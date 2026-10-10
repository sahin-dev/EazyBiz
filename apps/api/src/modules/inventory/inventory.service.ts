import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  availability(tenantId: string, branchId?: string) {
    return this.prisma.inventoryBalance.findMany({
      where: { tenantId, ...(branchId ? { branchId } : {}) },
      select: { branchId: true, productId: true, quantity: true },
    });
  }

  async overview(tenantId: string, branchId?: string) {
    const where = { tenantId, ...(branchId ? { branchId } : {}) };
    const [balances, movements] = await Promise.all([
      this.prisma.inventoryBalance.findMany({
        where,
        include: { product: { select: { id: true, name: true, sku: true, category: true, unit: true, purchasePrice: true } }, branch: { select: { id: true, name: true } } },
        orderBy: { product: { name: "asc" } },
      }),
      this.prisma.inventoryMovement.findMany({
        where,
        include: { product: { select: { name: true, sku: true } }, branch: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
    ]);
    return {
      balances,
      movements,
      summary: {
        skuCount: balances.length,
        lowStockCount: balances.filter((item) => Number(item.quantity) <= Number(item.minimumStock)).length,
        stockValue: balances.reduce((sum, item) => sum + Number(item.quantity) * Number(item.product.purchasePrice), 0),
      },
    };
  }
}
