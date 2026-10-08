import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { businessTypeConfigs, requiresPrescription, roundMoney } from "@businessos/domain";
import { randomUUID } from "node:crypto";
import type { AuthUser } from "../../common/auth/auth-user";
import { PrismaService } from "../../common/prisma/prisma.service";
import { CreateOrderDto } from "./create-order.dto";

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string, branchId?: string) {
    await this.assertTenant(tenantId);
    return this.prisma.order.findMany({
      where: { tenantId, ...(branchId ? { branchId } : {}) },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(tenantId: string, user: AuthUser | null, dto: CreateOrderDto) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId }, include: { branches: true } });
    if (!tenant) throw new NotFoundException("Tenant not found.");
    if (!tenant.branches.some((branch) => branch.id === dto.branchId)) {
      throw new BadRequestException("Branch does not belong to tenant.");
    }
    if (!dto.items.length) throw new BadRequestException("Order must include at least one item.");
    if (new Set(dto.items.map((item) => item.productId)).size !== dto.items.length) throw new BadRequestException("Each product can appear only once per order.");
    if (user?.branchId && user.branchId !== dto.branchId) throw new BadRequestException("Your account is assigned to a different branch.");
    if (dto.customerId) {
      const customer = await this.prisma.customer.findFirst({ where: { id: dto.customerId, tenantId, active: true }, select: { id: true } });
      if (!customer) throw new BadRequestException("Customer does not belong to tenant.");
    }
    if (dto.tableId) {
      const table = await this.prisma.restaurantTable.findFirst({ where: { id: dto.tableId, tenantId, branchId: dto.branchId, active: true }, select: { id: true } });
      const module = await this.prisma.tenantModule.findFirst({ where: { tenantId, moduleId: "restaurantTables", enabled: true }, select: { moduleId: true } });
      if (!table || !module) throw new BadRequestException("Table ordering is unavailable for this branch.");
    }

    const products = await this.prisma.product.findMany({
      where: { tenantId, id: { in: dto.items.map((item) => item.productId) }, active: true },
    });
    if (tenant.businessType === "pharmacy" && products.some((product) => requiresPrescription(product.attributes))) {
      throw new BadRequestException("Prescription-required medicine cannot be sold until prescription verification is enabled.");
    }

    const lines = dto.items.map((item) => {
      const product = products.find((candidate) => candidate.id === item.productId);
      if (!product) throw new BadRequestException("One or more products are invalid.");
      if (Number(product.stock) < item.quantity) throw new BadRequestException(`${product.name} does not have enough stock.`);
      const discountPrice = Number(product.discountPrice);
      const unitPrice = discountPrice > 0 && discountPrice < Number(product.salePrice) ? discountPrice : Number(product.salePrice);
      const total = roundMoney(unitPrice * item.quantity);
      return { product, quantity: item.quantity, unitPrice, total };
    });

    const subtotal = roundMoney(lines.reduce((total, line) => total + line.total, 0));
    const discount = dto.discount ?? 0;
    if (discount > subtotal) throw new BadRequestException("Discount cannot exceed subtotal.");
    const taxAmount = roundMoney(subtotal * (Number(tenant.vatRate) / 100));
    const serviceCharge = roundMoney(subtotal * (Number(tenant.serviceRate) / 100));
    const total = roundMoney(subtotal + taxAmount + serviceCharge - discount);
    const paidAmount = dto.paidAmount ?? (dto.paymentMethod === "Due" ? 0 : total);
    if (dto.tableId && (dto.paymentMethod !== "Due" || paidAmount !== 0)) throw new BadRequestException("Table orders must be settled from the table after service.");
    if (paidAmount > total) throw new BadRequestException("Paid amount cannot exceed order total.");
    const dueAmount = roundMoney(total - paidAmount);
    if (dueAmount > 0 && !dto.customerId && !dto.tableId) throw new BadRequestException("A customer or table is required for a due sale.");
    const status = businessTypeConfigs[tenant.businessType].orderStatuses[0];

    return this.prisma.$transaction(async (tx) => {
      if (dto.tableId) {
        const claimed = await tx.restaurantTable.updateMany({ where: { id: dto.tableId, tenantId, branchId: dto.branchId, status: "available" }, data: { status: "occupied" } });
        if (claimed.count !== 1) throw new BadRequestException("This table is no longer available.");
      }
      const movementRows: { productId: string; quantity: number; balanceAfter: number }[] = [];
      for (const line of lines) {
        const balance = await tx.inventoryBalance.findUnique({
          where: { branchId_productId: { branchId: dto.branchId, productId: line.product.id } },
        });
        if (!balance || Number(balance.quantity) < line.quantity) {
          throw new BadRequestException(`${line.product.name} does not have enough stock at this branch.`);
        }
        const updatedBalance = await tx.inventoryBalance.updateMany({
          where: { id: balance.id, quantity: { gte: line.quantity } },
          data: { quantity: { decrement: line.quantity } },
        });
        if (updatedBalance.count !== 1) throw new BadRequestException(`${line.product.name} stock changed. Review the cart and try again.`);
        await tx.product.update({ where: { id: line.product.id }, data: { stock: { decrement: line.quantity } } });
        movementRows.push({ productId: line.product.id, quantity: -line.quantity, balanceAfter: Number(balance.quantity) - line.quantity });
      }

      const order = await tx.order.create({
        data: {
          tenantId,
          branchId: dto.branchId,
          customerId: dto.customerId,
          tableId: dto.tableId,
          createdById: user?.id,
          orderNo: `ORD-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${randomUUID().slice(0, 6).toUpperCase()}`,
          source: dto.source,
          orderType: dto.orderType ?? "counter",
          status,
          paymentMethod: dto.paymentMethod,
          paymentStatus: dueAmount > 0 ? "pending" : "captured",
          subtotal,
          taxAmount,
          serviceCharge,
          discount,
          total,
          paidAmount,
          dueAmount,
          notes: dto.notes,
          syncStatus: "synced",
          items: {
            create: lines.map((line) => ({
              productId: line.product.id,
              name: line.product.name,
              quantity: line.quantity,
              unitPrice: line.unitPrice,
              total: line.total,
            })),
          },
          payments: paidAmount > 0 ? { create: { method: dto.paymentMethod, amount: paidAmount, status: "captured" } } : undefined,
        },
        include: { items: true, payments: true },
      });
      const kitchenModule = await tx.tenantModule.findFirst({ where: { tenantId, moduleId: "restaurantKitchen", enabled: true }, select: { moduleId: true } });
      if (kitchenModule) await tx.kitchenTicket.create({ data: { tenantId, branchId: dto.branchId, orderId: order.id } });
      await tx.inventoryMovement.createMany({
        data: movementRows.map((movement) => ({
          tenantId,
          branchId: dto.branchId,
          productId: movement.productId,
          type: "sale",
          quantity: movement.quantity,
          balanceAfter: movement.balanceAfter,
          referenceType: "Order",
          referenceId: order.id,
          createdById: user?.id,
        })),
      });
      if (dto.customerId) {
        await tx.customer.update({
          where: { id: dto.customerId },
          data: { totalSpend: { increment: total }, due: { increment: dueAmount }, loyaltyPoints: { increment: Math.floor(total / 100) } },
        });
      }
      await tx.auditLog.create({
        data: { tenantId, userId: user?.id, action: "order.created", entityType: "Order", entityId: order.id, metadata: { orderNo: order.orderNo, total, paymentMethod: dto.paymentMethod, source: dto.source } },
      });
      return order;
    });
  }

  private async assertTenant(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId }, select: { id: true } });
    if (!tenant) throw new NotFoundException("Tenant not found.");
  }
}
