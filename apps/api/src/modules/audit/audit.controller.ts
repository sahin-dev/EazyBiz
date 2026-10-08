import { Controller, Get, Param, Query } from "@nestjs/common";
import { Roles } from "../../common/auth/roles.decorator";
import { AuditQueryDto } from "./audit-query.dto";
import { AuditService } from "./audit.service";

@Controller("tenants/:tenantId/audit-logs")
@Roles("owner", "admin")
export class AuditController {
  constructor(private readonly audit: AuditService) {}

  @Get()
  list(@Param("tenantId") tenantId: string, @Query() query: AuditQueryDto) {
    return this.audit.list(tenantId, query.category, query.cursor);
  }
}
