import { Injectable } from "@nestjs/common";
import type { AuthUser } from "../../common/auth/auth-user";
import { PrismaService } from "../../common/prisma/prisma.service";
import { CreateCustomerDto } from "./customer.dto";

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  list(tenantId: string) {
    return this.prisma.customer.findMany({ where: { tenantId, active: true }, orderBy: { name: "asc" } });
  }

  async create(tenantId: string, user: AuthUser, dto: CreateCustomerDto) {
    const customer = await this.prisma.customer.create({ data: { tenantId, ...dto } });
    await this.prisma.auditLog.create({ data: { tenantId, userId: user.id, action: "customer.created", entityType: "Customer", entityId: customer.id } });
    return customer;
  }
}
