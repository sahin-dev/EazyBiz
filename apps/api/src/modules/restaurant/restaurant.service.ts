import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type { AuthUser } from "../../common/auth/auth-user";
import { PrismaService } from "../../common/prisma/prisma.service";
import { CreateTableDto, SetKitchenStatusDto, SetTableStatusDto, SettleTableOrderDto } from "./restaurant.dto";

@Injectable()
export class RestaurantService {
  constructor(private readonly prisma: PrismaService) {}

  listTables(tenantId: string, user: AuthUser) {
    return this.prisma.restaurantTable.findMany({
      where: { tenantId, ...(user.branchId ? { branchId: user.branchId } : {}), active: true },
      include: { branch: { select: { name: true } }, orders: { where: { dueAmount: { gt: 0 } }, select: { id: true, orderNo: true, total: true, dueAmount: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 1 } },
      orderBy: [{ branch: { name: "asc" } }, { name: "asc" }],
    });
  }

  async createTable(tenantId: string, user: AuthUser, dto: CreateTableDto) {
    if (user.branchId && user.branchId !== dto.branchId) throw new BadRequestException("Your account is assigned to a different branch.");
    const branch = await this.prisma.branch.findFirst({ where: { id: dto.branchId, tenantId, isActive: true }, select: { id: true } });
    if (!branch) throw new BadRequestException("Invalid branch.");
    const existing = await this.prisma.restaurantTable.findFirst({ where: { tenantId, branchId: dto.branchId, name: dto.name }, select: { id: true } });
    if (existing) throw new BadRequestException("A table with this name already exists at this branch.");
    return this.prisma.$transaction(async (tx) => {
      const table = await tx.restaurantTable.create({ data: { tenantId, branchId: dto.branchId, name: dto.name, capacity: dto.capacity } });
      await tx.auditLog.create({ data: { tenantId, userId: user.id, action: "table.created", entityType: "RestaurantTable", entityId: table.id } });
      return table;
    });
  }

  async setTableStatus(tenantId: string, user: AuthUser, tableId: string, dto: SetTableStatusDto) {
    const table = await this.prisma.restaurantTable.findFirst({ where: { id: tableId, tenantId, ...(user.branchId ? { branchId: user.branchId } : {}) } });
    if (!table) throw new NotFoundException("Table not found.");
    if (table.status === "occupied") throw new BadRequestException("Settle the table order before changing its status.");
    const changed = await this.prisma.restaurantTable.updateMany({ where: { id: tableId, status: { in: ["available", "reserved"] } }, data: { status: dto.status } });
    if (changed.count !== 1) throw new BadRequestException("Table status changed. Refresh and retry.");
    const updated = await this.prisma.restaurantTable.findUniqueOrThrow({ where: { id: tableId } });
    await this.prisma.auditLog.create({ data: { tenantId, userId: user.id, action: "table.status_changed", entityType: "RestaurantTable", entityId: tableId, metadata: { status: dto.status } } });
    return updated;
  }

  listKitchen(tenantId: string, user: AuthUser) {
    return this.prisma.kitchenTicket.findMany({ where: { tenantId, ...(user.branchId ? { branchId: user.branchId } : {}) }, include: { order: { select: { orderNo: true, source: true, orderType: true, status: true, notes: true, createdAt: true, items: true, table: { select: { name: true } } } }, branch: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 100 });
  }

  async setKitchenStatus(tenantId: string, user: AuthUser, ticketId: string, dto: SetKitchenStatusDto) {
    const ticket = await this.prisma.kitchenTicket.findFirst({ where: { id: ticketId, tenantId, ...(user.branchId ? { branchId: user.branchId } : {}) }, select: { id: true, orderId: true, status: true } });
    if (!ticket) throw new NotFoundException("Kitchen ticket not found.");
    const next: Record<string, string> = { new: "preparing", preparing: "ready", ready: "served" };
    if (next[ticket.status] !== dto.status) throw new BadRequestException("Invalid kitchen status transition.");
    return this.prisma.$transaction(async (tx) => {
      const changed = await tx.kitchenTicket.updateMany({ where: { id: ticketId, status: ticket.status }, data: { status: dto.status } });
      if (changed.count !== 1) throw new BadRequestException("Ticket status changed. Refresh and retry.");
      const updated = await tx.kitchenTicket.findUniqueOrThrow({ where: { id: ticketId } });
      await tx.order.update({ where: { id: ticket.orderId }, data: { status: dto.status === "preparing" ? "Preparing" : dto.status === "ready" ? "Ready" : "Served" } });
      await tx.auditLog.create({ data: { tenantId, userId: user.id, action: "kitchen.status_changed", entityType: "KitchenTicket", entityId: ticketId, metadata: { status: dto.status } } });
      return updated;
    });
  }

  async settleTableOrder(tenantId: string, user: AuthUser, orderId: string, dto: SettleTableOrderDto) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({ where: { id: orderId, tenantId, ...(user.branchId ? { branchId: user.branchId } : {}) } });
      if (!order || !order.tableId) throw new NotFoundException("Table order not found.");
      const due = Number(order.dueAmount);
      if (due <= 0) throw new BadRequestException("This table order is already settled.");
      const updated = await tx.order.updateMany({ where: { id: orderId, dueAmount: { gt: 0 } }, data: { paidAmount: { increment: due }, dueAmount: 0, paymentStatus: "captured", paymentMethod: dto.paymentMethod } });
      if (updated.count !== 1) throw new BadRequestException("This table order changed. Refresh and retry.");
      await tx.orderPayment.create({ data: { orderId, method: dto.paymentMethod, amount: due, status: "captured" } });
      await tx.restaurantTable.update({ where: { id: order.tableId }, data: { status: "available" } });
      if (order.customerId) await tx.customer.update({ where: { id: order.customerId }, data: { due: { decrement: due } } });
      await tx.auditLog.create({ data: { tenantId, userId: user.id, action: "table.order_settled", entityType: "Order", entityId: orderId, metadata: { amount: due, method: dto.paymentMethod } } });
      return tx.order.findUniqueOrThrow({ where: { id: orderId } });
    });
  }
}
