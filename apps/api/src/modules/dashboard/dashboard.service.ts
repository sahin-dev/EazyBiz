import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";

function dhakaDayStart() {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts();
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value;
  return new Date(`${value("year")}-${value("month")}-${value("day")}T00:00:00+06:00`);
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async summary(tenantId: string, branchId?: string) {
    const start = dhakaDayStart();
    const orderWhere = { tenantId, ...(branchId ? { branchId } : {}), createdAt: { gte: start } };
    const balanceWhere = { tenantId, ...(branchId ? { branchId } : {}) };
    const [orders, balances, customers, suppliers, recentOrders] = await Promise.all([
      this.prisma.order.findMany({ where: orderWhere, include: { items: true } }),
      this.prisma.inventoryBalance.findMany({ where: balanceWhere, include: { product: { select: { purchasePrice: true } } } }),
      this.prisma.customer.count({ where: { tenantId, active: true } }),
      this.prisma.supplier.aggregate({ where: { tenantId, active: true }, _sum: { payable: true } }),
      this.prisma.order.findMany({
        where: { tenantId, ...(branchId ? { branchId } : {}) },
        include: { customer: { select: { name: true } }, items: { select: { quantity: true } } },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
    ]);
    const sales = orders.reduce((sum, order) => sum + Number(order.total), 0);
    const itemTotals = new Map<string, { name: string; quantity: number; sales: number }>();
    for (const order of orders) {
      for (const item of order.items) {
        const current = itemTotals.get(item.name) ?? { name: item.name, quantity: 0, sales: 0 };
        current.quantity += Number(item.quantity);
        current.sales += Number(item.total);
        itemTotals.set(item.name, current);
      }
    }
    return {
      metrics: {
        sales,
        orderCount: orders.length,
        averageOrder: orders.length ? sales / orders.length : 0,
        dueAmount: orders.reduce((sum, order) => sum + Number(order.dueAmount), 0),
        lowStockCount: balances.filter((item) => Number(item.quantity) <= Number(item.minimumStock)).length,
        stockValue: balances.reduce((sum, item) => sum + Number(item.quantity) * Number(item.product.purchasePrice), 0),
        customerCount: customers,
        supplierPayable: Number(suppliers._sum.payable ?? 0),
      },
      recentOrders,
      topProducts: [...itemTotals.values()].sort((a, b) => b.quantity - a.quantity).slice(0, 5),
    };
  }

  async report(tenantId: string, days: number, branchId?: string) {
    const range = Math.min(Math.max(days, 7), 90);
    const start = new Date(Date.now() - range * 24 * 60 * 60 * 1000);
    const orders = await this.prisma.order.findMany({ where: { tenantId, ...(branchId ? { branchId } : {}), createdAt: { gte: start } }, orderBy: { createdAt: "asc" } });
    const daily = new Map<string, { date: string; sales: number; orders: number }>();
    for (const order of orders) {
      const date = order.createdAt.toISOString().slice(0, 10);
      const current = daily.get(date) ?? { date, sales: 0, orders: 0 };
      current.sales += Number(order.total);
      current.orders += 1;
      daily.set(date, current);
    }
    const paymentMix = Object.entries(
      orders.reduce<Record<string, number>>((result, order) => ({ ...result, [order.paymentMethod]: (result[order.paymentMethod] ?? 0) + Number(order.total) }), {}),
    ).map(([method, amount]) => ({ method, amount }));
    return { range, daily: [...daily.values()], paymentMix, totalSales: orders.reduce((sum, item) => sum + Number(item.total), 0), orderCount: orders.length };
  }
}
