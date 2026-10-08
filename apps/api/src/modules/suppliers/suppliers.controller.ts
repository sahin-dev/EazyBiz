import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import type { AuthUser } from "../../common/auth/auth-user";
import { CurrentUser } from "../../common/auth/current-user.decorator";
import { RequireModule } from "../../common/auth/require-module.decorator";
import { Roles } from "../../common/auth/roles.decorator";
import { CreateSupplierDto } from "./supplier.dto";
import { SuppliersService } from "./suppliers.service";

@Controller("tenants/:tenantId/suppliers")
@RequireModule("suppliers")
export class SuppliersController {
  constructor(private readonly suppliers: SuppliersService) {}

  @Get()
  list(@Param("tenantId") tenantId: string) {
    return this.suppliers.list(tenantId);
  }

  @Post()
  @Roles("owner", "admin", "manager", "inventoryManager", "accountant")
  create(@Param("tenantId") tenantId: string, @CurrentUser() user: AuthUser, @Body() dto: CreateSupplierDto) {
    return this.suppliers.create(tenantId, user, dto);
  }
}
