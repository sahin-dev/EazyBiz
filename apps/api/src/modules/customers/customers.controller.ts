import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import type { AuthUser } from "../../common/auth/auth-user";
import { CurrentUser } from "../../common/auth/current-user.decorator";
import { RequireModule } from "../../common/auth/require-module.decorator";
import { RequirePermission } from "../../common/auth/require-permission.decorator";
import { Roles } from "../../common/auth/roles.decorator";
import { CreateCustomerDto } from "./customer.dto";
import { CustomersService } from "./customers.service";

@Controller("tenants/:tenantId/customers")
@RequireModule("customers")
export class CustomersController {
  constructor(private readonly customers: CustomersService) {}

  @Get()
  @RequirePermission("customer:view")
  list(@Param("tenantId") tenantId: string) {
    return this.customers.list(tenantId);
  }

  @Post()
  @Roles("owner", "admin", "manager", "cashier", "salesStaff", "pharmacist")
  create(@Param("tenantId") tenantId: string, @CurrentUser() user: AuthUser, @Body() dto: CreateCustomerDto) {
    return this.customers.create(tenantId, user, dto);
  }
}
