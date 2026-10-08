import { Controller, ForbiddenException, Get, Param, Query } from "@nestjs/common";
import type { AuthUser } from "../../common/auth/auth-user";
import { CurrentUser } from "../../common/auth/current-user.decorator";
import { RequireModule } from "../../common/auth/require-module.decorator";
import { DashboardService } from "./dashboard.service";

@Controller("tenants/:tenantId")
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get("dashboard")
  @RequireModule("pos")
  summary(@Param("tenantId") tenantId: string, @CurrentUser() user: AuthUser, @Query("branchId") branchId?: string) {
    if (user.branchId && branchId && branchId !== user.branchId) throw new ForbiddenException("Cross-branch access is not allowed.");
    return this.dashboard.summary(tenantId, user.branchId ?? branchId);
  }

  @Get("reports/overview")
  @RequireModule("reports")
  report(@Param("tenantId") tenantId: string, @CurrentUser() user: AuthUser, @Query("days") days = "30", @Query("branchId") branchId?: string) {
    if (user.branchId && branchId && branchId !== user.branchId) throw new ForbiddenException("Cross-branch access is not allowed.");
    const range = Number(days);
    if (![7, 30, 90].includes(range)) throw new ForbiddenException("Choose a supported report period.");
    return this.dashboard.report(tenantId, range, user.branchId ?? branchId);
  }
}
