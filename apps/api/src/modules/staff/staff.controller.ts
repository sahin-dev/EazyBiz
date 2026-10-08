import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import type { AuthUser } from "../../common/auth/auth-user";
import { CurrentUser } from "../../common/auth/current-user.decorator";
import { RequireModule } from "../../common/auth/require-module.decorator";
import { Roles } from "../../common/auth/roles.decorator";
import { CreateStaffDto } from "./staff.dto";
import { StaffService } from "./staff.service";

@Controller("tenants/:tenantId/staff")
@RequireModule("staff")
@Roles("owner", "admin", "manager")
export class StaffController {
  constructor(private readonly staff: StaffService) {}

  @Get()
  list(@Param("tenantId") tenantId: string) {
    return this.staff.list(tenantId);
  }

  @Post()
  create(@Param("tenantId") tenantId: string, @CurrentUser() user: AuthUser, @Body() dto: CreateStaffDto) {
    return this.staff.create(tenantId, user, dto);
  }
}
