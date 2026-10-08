import { BadRequestException, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../common/prisma/prisma.service";
import type { AuditCategory } from "./audit-query.dto";

const prefixes: Record<Exclude<AuditCategory, "all">, string[]> = {
  access: ["user."], sales: ["order.", "table.", "kitchen."],
  inventory: ["product.", "stock.", "purchase.", "supplier."],
  billing: ["subscription."], storefront: ["storefront."], people: ["customer.", "staff."],
};

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string, category: AuditCategory = "all", cursor?: string) {
    const where: Prisma.AuditLogWhereInput = { tenantId };
    if (category !== "all") where.OR = prefixes[category].map((prefix) => ({ action: { startsWith: prefix } }));
    if (cursor) {
      const belongsToPage = await this.prisma.auditLog.findFirst({ where: { ...where, id: cursor }, select: { id: true } });
      if (!belongsToPage) throw new BadRequestException("This audit page is no longer available. Refresh the log.");
    }
    const rows = await this.prisma.auditLog.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      take: 41,
      select: { id: true, action: true, entityType: true, entityId: true, ipAddress: true, metadata: true, createdAt: true, user: { select: { id: true, name: true, email: true } } },
    });
    const items = rows.slice(0, 40);
    return { items, nextCursor: rows.length > 40 ? items[items.length - 1].id : null };
  }
}
