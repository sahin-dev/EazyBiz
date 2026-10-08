import { BadRequestException, Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { roundMoney } from "@businessos/domain";
import type { AuthUser } from "../../common/auth/auth-user";
import { PrismaService } from "../../common/prisma/prisma.service";
import { ReceivePurchaseDto } from "./purchase.dto";

@Injectable()
export class PurchasesService {
  constructor(private readonly prisma: PrismaService) {}

  list(tenantId: string, branchId?: string) {
    return this.prisma.purchase.findMany({
      where: { tenantId, ...(branchId ? { branchId } : {}) },
      include: { supplier: { select: { name: true } }, branch: { select: { name: true } }, items: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async receive(tenantId: string, user: AuthUser, dto: ReceivePurchaseDto) {
    if (!dto.items.length) throw new BadRequestException("Purchase must contain at least one item.");
    const [branch, supplier, products] = await Promise.all([
      this.prisma.branch.findFirst({ where: { id: dto.branchId, tenantId, isActive: true } }),
      this.prisma.supplier.findFirst({ where: { id: dto.supplierId, tenantId, active: true } }),
      this.prisma.product.findMany({ where: { tenantId, id: { in: dto.items.map((item) => item.productId) }, active: true } }),
    ]);
    if (!branch) throw new BadRequestException("Invalid branch.");
    if (user.branchId && user.branchId !== dto.branchId) throw new BadRequestException("Your account is assigned to a different branch.");
    if (new Set(dto.items.map((item) => item.productId)).size !== dto.items.length) throw new BadRequestException("Each product can appear only once per purchase.");
    if (!supplier) throw new BadRequestException("Invalid supplier.");
    if (products.length !== new Set(dto.items.map((item) => item.productId)).size) throw new BadRequestException("One or more products are invalid.");
    const subtotal = roundMoney(dto.items.reduce((sum, item) => sum + roundMoney(item.quantity * item.unitCost), 0));
    if (dto.paid > subtotal) throw new BadRequestException("Paid amount cannot exceed purchase total.");
    const due = roundMoney(subtotal - dto.paid);

    return this.prisma.$transaction(async (tx) => {
      const purchase = await tx.purchase.create({
        data: {
          tenantId,
          branchId: dto.branchId,
          supplierId: dto.supplierId,
          purchaseNo: `PUR-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${randomUUID().slice(0, 6).toUpperCase()}`,
          invoiceNo: dto.invoiceNo,
          status: "received",
          subtotal,
          paid: dto.paid,
          due,
          receivedAt: new Date(),
          items: {
            create: dto.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitCost: item.unitCost,
              total: roundMoney(item.quantity * item.unitCost),
              batchNo: item.batchNo,
              expiryDate: item.expiryDate ? new Date(item.expiryDate) : undefined,
            })),
          },
        },
        include: { items: true },
      });
      for (const item of dto.items) {
        const current = await tx.inventoryBalance.findUnique({ where: { branchId_productId: { branchId: dto.branchId, productId: item.productId } } });
        const balanceAfter = Number(current?.quantity ?? 0) + item.quantity;
        await tx.inventoryBalance.upsert({
          where: { branchId_productId: { branchId: dto.branchId, productId: item.productId } },
          create: { tenantId, branchId: dto.branchId, productId: item.productId, quantity: item.quantity },
          update: { quantity: { increment: item.quantity } },
        });
        await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity }, purchasePrice: item.unitCost } });
        await tx.inventoryMovement.create({
          data: { tenantId, branchId: dto.branchId, productId: item.productId, type: "purchase", quantity: item.quantity, balanceAfter, referenceType: "Purchase", referenceId: purchase.id, createdById: user.id },
        });
      }
      await tx.supplier.update({ where: { id: dto.supplierId }, data: { payable: { increment: due }, lastPurchase: subtotal } });
      await tx.auditLog.create({ data: { tenantId, userId: user.id, action: "purchase.received", entityType: "Purchase", entityId: purchase.id, metadata: { subtotal, paid: dto.paid, due } } });
      return purchase;
    });
  }
}
