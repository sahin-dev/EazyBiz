import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import type { AuthUser } from "../../common/auth/auth-user";
import { CurrentUser } from "../../common/auth/current-user.decorator";
import { RequireModule } from "../../common/auth/require-module.decorator";
import { RequirePermission } from "../../common/auth/require-permission.decorator";
import { Roles } from "../../common/auth/roles.decorator";
import { CreateTableDto, SetKitchenStatusDto, SetTableStatusDto, SettleTableOrderDto } from "./restaurant.dto";
import { RestaurantService } from "./restaurant.service";

@Controller("tenants/:tenantId")
export class RestaurantController {
  constructor(private readonly restaurant: RestaurantService) {}

  @Get("tables")
  @RequireModule("restaurantTables")
  @RequirePermission("table:view")
  tables(@Param("tenantId") tenantId: string, @CurrentUser() user: AuthUser) { return this.restaurant.listTables(tenantId, user); }

  @Post("tables")
  @RequireModule("restaurantTables")
  @Roles("owner", "admin", "manager")
  createTable(@Param("tenantId") tenantId: string, @CurrentUser() user: AuthUser, @Body() dto: CreateTableDto) { return this.restaurant.createTable(tenantId, user, dto); }

  @Patch("tables/:tableId/status")
  @RequireModule("restaurantTables")
  @Roles("owner", "admin", "manager", "cashier")
  tableStatus(@Param("tenantId") tenantId: string, @Param("tableId") tableId: string, @CurrentUser() user: AuthUser, @Body() dto: SetTableStatusDto) { return this.restaurant.setTableStatus(tenantId, user, tableId, dto); }

  @Post("orders/:orderId/settle")
  @RequireModule("restaurantTables")
  @Roles("owner", "admin", "manager", "cashier")
  settle(@Param("tenantId") tenantId: string, @Param("orderId") orderId: string, @CurrentUser() user: AuthUser, @Body() dto: SettleTableOrderDto) { return this.restaurant.settleTableOrder(tenantId, user, orderId, dto); }

  @Get("kitchen")
  @RequireModule("restaurantKitchen")
  @Roles("owner", "admin", "manager", "kitchenStaff")
  kitchen(@Param("tenantId") tenantId: string, @CurrentUser() user: AuthUser) { return this.restaurant.listKitchen(tenantId, user); }

  @Patch("kitchen/:ticketId/status")
  @RequireModule("restaurantKitchen")
  @Roles("owner", "admin", "manager", "kitchenStaff")
  kitchenStatus(@Param("tenantId") tenantId: string, @Param("ticketId") ticketId: string, @CurrentUser() user: AuthUser, @Body() dto: SetKitchenStatusDto) { return this.restaurant.setKitchenStatus(tenantId, user, ticketId, dto); }
}
