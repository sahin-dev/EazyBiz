import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { businessTypeConfigs, requiresPrescription, roundMoney } from "@businessos/domain";
import { createHash, randomUUID } from "node:crypto";
import type { AuthUser } from "../../common/auth/auth-user";
import { PrismaService } from "../../common/prisma/prisma.service";
import { CreateOrderDto } from "./create-order.dto";
import { ReturnOrderDto } from "./return-order.dto";

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string, branchId?: string) {
    await this.assertTenant(tenantId);
    return this.prisma.order.findMany({
      where: { tenantId, ...(branchId ? { branchId } : {}) },
      include: { items: true, payments: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(
    tenantId: string,
    user: AuthUser | null,
    dto: CreateOrderDto,
    idempotencyKey?: string,
    requestContext?: unknown,
    storefrontCustomer?: { name: string; phone: string; address?: string },
  ) {
    if (user && user.tenantId !== tenantId) throw new BadRequestException("Your account does not belong to this tenant.");
    if (user?.branchId && user.branchId !== dto.branchId) throw new BadRequestException("Your account is assigned to a different branch.");
    if (storefrontCustomer && (user || dto.source !== "storefront" || dto.customerId)) {
      throw new BadRequestException("Invalid storefront customer context.");
    }
    const key = idempotencyKey?.trim();
    if (idempotencyKey !== undefined && (!key || !/^[A-Za-z0-9_-]{20,128}$/.test(key))) {
      throw new BadRequestException("Provide a valid idempotency key of 20 to 128 characters.");
    }
    const fingerprint = key ? orderFingerprint(tenantId, user, dto, requestContext) : undefined;
    if (key && fingerprint) {
      const existing = await this.replayOrder(tenantId, key, fingerprint);
      if (existing) return existing;
    }
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId }, include: { branches: true } });
    if (!tenant) throw new NotFoundException("Tenant not found.");
    if (!tenant.branches.some((branch) => branch.id === dto.branchId)) {
      throw new BadRequestException("Branch does not belong to tenant.");
    }
    if (!dto.items.length) throw new BadRequestException("Order must include at least one item.");
    if (new Set(dto.items.map((item) => item.productId)).size !== dto.items.length) throw new BadRequestException("Each product can appear only once per order.");
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
    if (dueAmount > 0 && !dto.customerId && !dto.tableId && !storefrontCustomer) throw new BadRequestException("A customer or table is required for a due sale.");
    const status = businessTypeConfigs[tenant.businessType].orderStatuses[0];

    try {
      return await this.prisma.$transaction(async (tx) => {
      const customerId = storefrontCustomer
        ? (await tx.customer.upsert({
            where: { tenantId_phone: { tenantId, phone: storefrontCustomer.phone } },
            create: { tenantId, name: storefrontCustomer.name, phone: storefrontCustomer.phone, address: storefrontCustomer.address },
            update: { name: storefrontCustomer.name, address: storefrontCustomer.address || undefined },
            select: { id: true },
          })).id
        : dto.customerId;
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
          customerId,
          tableId: dto.tableId,
          createdById: user?.id,
          orderNo: `ORD-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${randomUUID().slice(0, 6).toUpperCase()}`,
          idempotencyKey: key,
          requestFingerprint: fingerprint,
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
      if (customerId) {
        await tx.customer.update({
          where: { id: customerId },
          data: { totalSpend: { increment: total }, due: { increment: dueAmount }, loyaltyPoints: { increment: Math.floor(total / 100) } },
        });
      }
      await tx.auditLog.create({
        data: { tenantId, userId: user?.id, action: "order.created", entityType: "Order", entityId: order.id, metadata: { orderNo: order.orderNo, total, paymentMethod: dto.paymentMethod, source: dto.source } },
      });
      return order;
      });
    } catch (error) {
      if (key && fingerprint) {
        const existing = await this.replayOrder(tenantId, key, fingerprint);
        if (existing) return existing;
      }
      throw error;
    }
  }

  private async replayOrder(tenantId: string, key: string, fingerprint: string) {
    const order = await this.prisma.order.findFirst({
      where: { tenantId, idempotencyKey: key },
      include: { items: true, payments: true },
    });
    if (order && order.requestFingerprint !== fingerprint) {
      throw new ConflictException("This idempotency key was used for a different order.");
    }
    return order;
  }

  async returnOrder(tenantId: string, orderId: string, user: AuthUser, dto: ReturnOrderDto) {
    const reason = dto.reason?.trim();
    const refundReference = dto.refundReference?.trim();
    if (!reason || reason.length < 10) throw new BadRequestException("Provide a return reason of at least 10 characters.");
    if (!(["restock", "writeOff"] as const).includes(dto.disposition)) throw new BadRequestException("Select a stock disposition.");

    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: { id: orderId, tenantId, ...(user.branchId ? { branchId: user.branchId } : {}) },
        include: { items: true, kitchenTicket: { select: { status: true } } },
      });
      if (!order) throw new NotFoundException("Order not found.");
      if (order.status === "Refunded") throw new BadRequestException("This order has already been returned.");
      if (order.kitchenTicket && order.kitchenTicket.status !== "served") {
        throw new BadRequestException("Finish kitchen service before returning this order.");
      }

      const refundAmount = Number(order.paidAmount);
      const originalDue = Number(order.dueAmount);
      if (refundAmount > 0 && !dto.refundMethod) throw new BadRequestException("Select how the paid amount was refunded.");
      if (refundAmount > 0 && dto.refundMethod !== "Cash" && !refundReference) {
        throw new BadRequestException("A transaction reference is required for non-cash refunds.");
      }
      if (refundAmount === 0 && dto.refundMethod) throw new BadRequestException("This unpaid order has no payment to refund.");

      const claimed = await tx.order.updateMany({
        where: { id: order.id, tenantId, status: { not: "Refunded" } },
        data: { status: "Refunded", paymentStatus: refundAmount > 0 ? "refunded" : "pending", dueAmount: 0 },
      });
      if (claimed.count !== 1) throw new BadRequestException("Order changed. Refresh and try again.");

      if (dto.disposition === "restock") {
        for (const item of order.items) {
          if (!item.productId) throw new BadRequestException("A product was deleted. Return requires manual stock reconciliation.");
          const quantity = Number(item.quantity);
          const balance = await tx.inventoryBalance.update({
            where: { branchId_productId: { branchId: order.branchId, productId: item.productId } },
            data: { quantity: { increment: quantity } },
          });
          await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: quantity } } });
          await tx.inventoryMovement.create({
            data: { tenantId, branchId: order.branchId, productId: item.productId, type: "return", quantity, balanceAfter: balance.quantity, referenceType: "Order", referenceId: order.id, note: reason, createdById: user.id },
          });
        }
      }
      if (refundAmount > 0) {
        await tx.orderPayment.create({ data: { orderId: order.id, method: dto.refundMethod!, amount: -refundAmount, reference: refundReference, status: "refunded" } });
      }
      if (order.customerId) {
        await tx.customer.update({ where: { id: order.customerId }, data: {
          totalSpend: { decrement: order.total }, due: { decrement: originalDue }, loyaltyPoints: { decrement: Math.floor(Number(order.total) / 100) },
        } });
      }
      if (order.tableId && originalDue > 0) await tx.restaurantTable.update({ where: { id: order.tableId }, data: { status: "available" } });
      await tx.auditLog.create({ data: { tenantId, userId: user.id, action: "order.returned", entityType: "Order", entityId: order.id,
        metadata: { orderNo: order.orderNo, reason, disposition: dto.disposition, refundAmount, refundMethod: dto.refundMethod ?? null, refundReference: refundReference ?? null, reversedDue: originalDue, total: Number(order.total) },
      } });
      return tx.order.findUniqueOrThrow({ where: { id: order.id }, include: { items: true, payments: true } });
    });
  }

  private async assertTenant(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId }, select: { id: true } });
    if (!tenant) throw new NotFoundException("Tenant not found.");
  }
}

function orderFingerprint(tenantId: string, user: AuthUser | null, dto: CreateOrderDto, requestContext?: unknown) {
  const payload = {
    tenantId,
    actorId: user?.id ?? null,
    branchId: dto.branchId,
    customerId: dto.customerId ?? null,
    tableId: dto.tableId ?? null,
    source: dto.source,
    orderType: dto.orderType ?? null,
    paymentMethod: dto.paymentMethod,
    discount: dto.discount ?? 0,
    paidAmount: dto.paidAmount ?? null,
    notes: dto.notes ?? null,
    items: [...dto.items].sort((left, right) => left.productId.localeCompare(right.productId)),
    requestContext: requestContext ?? null,
  };
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}
