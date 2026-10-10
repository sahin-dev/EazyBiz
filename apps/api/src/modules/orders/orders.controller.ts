import { Body, Controller, ForbiddenException, Get, Headers, Param, Post, Query } from "@nestjs/common";
import { CurrentUser } from "../../common/auth/current-user.decorator";
import { RequireModule } from "../../common/auth/require-module.decorator";
import { RequirePermission } from "../../common/auth/require-permission.decorator";
import { Roles } from "../../common/auth/roles.decorator";
import type { AuthUser } from "../../common/auth/auth-user";
import { CreateOrderDto } from "./create-order.dto";
import { OrdersService } from "./orders.service";
import { ReturnOrderDto } from "./return-order.dto";

@Controller("tenants/:tenantId/orders")
@RequireModule("pos")
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Get()
  @RequirePermission("order:view")
  list(@Param("tenantId") tenantId: string, @CurrentUser() user: AuthUser, @Query("branchId") branchId?: string) {
    if (user.branchId && branchId && branchId !== user.branchId) throw new ForbiddenException("Cross-branch access is not allowed.");
    return this.orders.list(tenantId, user.branchId ?? branchId);
  }

  @Post()
  @Roles("owner", "admin", "manager", "cashier", "salesStaff", "pharmacist")
  create(@Param("tenantId") tenantId: string, @CurrentUser() user: AuthUser, @Body() dto: CreateOrderDto, @Headers("idempotency-key") idempotencyKey?: string) {
    return this.orders.create(tenantId, user, dto, idempotencyKey);
  }

  @Post(":orderId/return")
  @Roles("owner", "admin", "manager")
  returnOrder(@Param("tenantId") tenantId: string, @Param("orderId") orderId: string, @CurrentUser() user: AuthUser, @Body() dto: ReturnOrderDto) {
    return this.orders.returnOrder(tenantId, orderId, user, dto);
  }
}
