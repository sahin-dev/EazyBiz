import { Body, Controller, Get, Param, Patch } from "@nestjs/common";
import type { AuthUser } from "../../common/auth/auth-user";
import { AllowPlatform } from "../../common/auth/allow-platform.decorator";
import { CurrentUser } from "../../common/auth/current-user.decorator";
import { Roles } from "../../common/auth/roles.decorator";
import { SubscriptionsService } from "../subscriptions/subscriptions.service";
import { UpdateModuleDto } from "../subscriptions/update-module.dto";
import { TenantsService } from "../tenants/tenants.service";
import { UpdatePaymentStatusDto } from "./update-payment-status.dto";
import { UpdateTenantStatusDto } from "./update-tenant-status.dto";

@Controller("platform-admin")
@AllowPlatform()
@Roles("platformAdmin")
export class PlatformAdminController {
  constructor(
    private readonly tenants: TenantsService,
    private readonly subscriptions: SubscriptionsService,
  ) {}

  @Get("tenants")
  listTenants() {
    return this.tenants.listAll();
  }

  @Patch("tenants/:tenantId/status")
  setTenantStatus(
    @Param("tenantId") tenantId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateTenantStatusDto,
  ) {
    return this.tenants.setStatus(tenantId, user.id, dto.status);
  }

  @Patch("tenants/:tenantId/modules")
  setTenantModule(
    @Param("tenantId") tenantId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateModuleDto,
  ) {
    return this.subscriptions.setModule(tenantId, user, dto.moduleId, dto.enabled, dto.featureFlags);
  }

  @Get("payments")
  listPayments() {
    return this.subscriptions.listPayments();
  }

  @Patch("payments/:paymentId")
  updatePaymentStatus(
    @Param("paymentId") paymentId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdatePaymentStatusDto,
  ) {
    return this.subscriptions.updatePaymentStatus(paymentId, user, dto.status);
  }
}
