import { Injectable } from "@nestjs/common";
import type { AuthUser } from "../../common/auth/auth-user";
import { PrismaService } from "../../common/prisma/prisma.service";
import { CreateSupplierDto } from "./supplier.dto";

@Injectable()
export class SuppliersService {
  constructor(private readonly prisma: PrismaService) {}

  list(tenantId: string) {
    return this.prisma.supplier.findMany({ where: { tenantId, active: true }, include: { _count: { select: { purchases: true } } }, orderBy: { name: "asc" } });
  }

  async create(tenantId: string, user: AuthUser, dto: CreateSupplierDto) {
    const supplier = await this.prisma.supplier.create({
      data: { tenantId, name: dto.name, category: dto.category, phone: dto.phone, email: dto.email, address: dto.address, payable: dto.openingPayable ?? 0 },
    });
    await this.prisma.auditLog.create({ data: { tenantId, userId: user.id, action: "supplier.created", entityType: "Supplier", entityId: supplier.id } });
    return supplier;
  }
}
