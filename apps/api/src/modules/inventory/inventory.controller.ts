import { Controller, ForbiddenException, Get, Param, Query } from "@nestjs/common";
import type { AuthUser } from "../../common/auth/auth-user";
import { CurrentUser } from "../../common/auth/current-user.decorator";
import { RequireModule } from "../../common/auth/require-module.decorator";
import { RequirePermission } from "../../common/auth/require-permission.decorator";
import { InventoryService } from "./inventory.service";

@Controller("tenants/:tenantId/inventory")
@RequireModule("inventory")
export class InventoryController {
  constructor(private readonly inventory: InventoryService) {}

  @Get()
  @RequirePermission("inventory:view")
  overview(@Param("tenantId") tenantId: string, @CurrentUser() user: AuthUser, @Query("branchId") branchId?: string) {
    if (user.branchId && branchId && branchId !== user.branchId) throw new ForbiddenException("Cross-branch access is not allowed.");
    return this.inventory.overview(tenantId, user.branchId ?? branchId);
  }

  @Get("availability")
  @RequireModule("pos")
  @RequirePermission("sale:create")
  availability(@Param("tenantId") tenantId: string, @CurrentUser() user: AuthUser, @Query("branchId") branchId?: string) {
    if (user.branchId && branchId && branchId !== user.branchId) throw new ForbiddenException("Cross-branch access is not allowed.");
    return this.inventory.availability(tenantId, user.branchId ?? branchId);
  }
}
