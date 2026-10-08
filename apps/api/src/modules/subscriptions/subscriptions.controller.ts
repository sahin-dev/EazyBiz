import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import type { AuthUser } from "../../common/auth/auth-user";
import { AllowPlatform } from "../../common/auth/allow-platform.decorator";
import { CurrentUser } from "../../common/auth/current-user.decorator";
import { Roles } from "../../common/auth/roles.decorator";
import { CreateSubscriptionPaymentDto } from "./create-subscription-payment.dto";
import { SubscriptionsService } from "./subscriptions.service";
import { UpdateModuleDto } from "./update-module.dto";
import { UpdateSubscriptionDto } from "./update-subscription.dto";

@Controller("tenants/:tenantId/subscription")
@AllowPlatform()
@Roles("owner", "admin", "platformAdmin")
export class SubscriptionsController {
  constructor(private readonly subscriptions: SubscriptionsService) {}

  @Get()
  get(@Param("tenantId") tenantId: string) {
    return this.subscriptions.get(tenantId);
  }

  @Get("modules")
  listModules(@Param("tenantId") tenantId: string) {
    return this.subscriptions.listModules(tenantId);
  }

  @Patch("modules")
  toggleModule(@Param("tenantId") tenantId: string, @CurrentUser() user: AuthUser, @Body() dto: UpdateModuleDto) {
    return this.subscriptions.setModule(tenantId, user, dto.moduleId, dto.enabled);
  }

  @Patch()
  updatePlan(@Param("tenantId") tenantId: string, @CurrentUser() user: AuthUser, @Body() dto: UpdateSubscriptionDto) {
    return this.subscriptions.updatePlan(tenantId, user, dto);
  }

  @Post("payments")
  submitPayment(@Param("tenantId") tenantId: string, @CurrentUser() user: AuthUser, @Body() dto: CreateSubscriptionPaymentDto) {
    return this.subscriptions.recordPayment(tenantId, user, dto);
  }
}
