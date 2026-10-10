import { Body, Controller, ForbiddenException, Get, Param, Post, Query } from "@nestjs/common";
import type { AuthUser } from "../../common/auth/auth-user";
import { CurrentUser } from "../../common/auth/current-user.decorator";
import { RequireModule } from "../../common/auth/require-module.decorator";
import { RequirePermission } from "../../common/auth/require-permission.decorator";
import { Roles } from "../../common/auth/roles.decorator";
import { ReceivePurchaseDto } from "./purchase.dto";
import { PurchasesService } from "./purchases.service";

@Controller("tenants/:tenantId/purchases")
@RequireModule("purchasing")
export class PurchasesController {
  constructor(private readonly purchases: PurchasesService) {}

  @Get()
  @RequirePermission("purchase:view")
  list(@Param("tenantId") tenantId: string, @CurrentUser() user: AuthUser, @Query("branchId") branchId?: string) {
    if (user.branchId && branchId && branchId !== user.branchId) throw new ForbiddenException("Cross-branch access is not allowed.");
    return this.purchases.list(tenantId, user.branchId ?? branchId);
  }

  @Post("receive")
  @Roles("owner", "admin", "manager", "inventoryManager", "accountant")
  receive(@Param("tenantId") tenantId: string, @CurrentUser() user: AuthUser, @Body() dto: ReceivePurchaseDto) {
    return this.purchases.receive(tenantId, user, dto);
  }
}
