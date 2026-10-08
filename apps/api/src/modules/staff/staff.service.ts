import { BadRequestException, Injectable } from "@nestjs/common";
import type { AuthUser } from "../../common/auth/auth-user";
import { PrismaService } from "../../common/prisma/prisma.service";
import { CreateStaffDto } from "./staff.dto";

@Injectable()
export class StaffService {
  constructor(private readonly prisma: PrismaService) {}

  list(tenantId: string) {
    return this.prisma.staffMember.findMany({ where: { tenantId, active: true }, include: { branch: { select: { id: true, name: true } } }, orderBy: { name: "asc" } });
  }

  async create(tenantId: string, user: AuthUser, dto: CreateStaffDto) {
    const branchId = dto.branchId ?? user.branchId;
    if (branchId) {
      const branch = await this.prisma.branch.findFirst({ where: { id: branchId, tenantId, isActive: true }, select: { id: true } });
      if (!branch) throw new BadRequestException("Invalid branch.");
    }
    const member = await this.prisma.staffMember.create({ data: { tenantId, ...dto, branchId } });
    await this.prisma.auditLog.create({ data: { tenantId, userId: user.id, action: "staff.created", entityType: "StaffMember", entityId: member.id } });
    return member;
  }
}
