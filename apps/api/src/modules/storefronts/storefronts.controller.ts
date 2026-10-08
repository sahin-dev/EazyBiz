import { Body, Controller, Get, Param, Post, Put } from "@nestjs/common";
import type { AuthUser } from "../../common/auth/auth-user";
import { CurrentUser } from "../../common/auth/current-user.decorator";
import { Public } from "../../common/auth/public.decorator";
import { RequireModule } from "../../common/auth/require-module.decorator";
import { Roles } from "../../common/auth/roles.decorator";
import { RateLimit } from "../../common/rate-limit/rate-limit.decorator";
import { PlaceStorefrontOrderDto, UpdateStorefrontDto } from "./storefront.dto";
import { StorefrontsService } from "./storefronts.service";

@Controller()
export class StorefrontsController {
  constructor(private readonly storefronts: StorefrontsService) {}

  @Get("tenants/:tenantId/storefront")
  @RequireModule("storefront")
  get(@Param("tenantId") tenantId: string) {
    return this.storefronts.get(tenantId);
  }

  @Put("tenants/:tenantId/storefront")
  @RequireModule("websiteBuilder")
  @Roles("owner", "admin", "manager")
  update(@Param("tenantId") tenantId: string, @CurrentUser() user: AuthUser, @Body() dto: UpdateStorefrontDto) {
    return this.storefronts.update(tenantId, user, dto);
  }

  @Post("tenants/:tenantId/storefront/publish")
  @RequireModule("websiteBuilder")
  @Roles("owner", "admin", "manager")
  publish(@Param("tenantId") tenantId: string, @CurrentUser() user: AuthUser) {
    return this.storefronts.publish(tenantId, user);
  }

  @Public()
  @Get("storefronts/:slug")
  publicStore(@Param("slug") slug: string) {
    return this.storefronts.publicStore(slug);
  }

  @Public()
  @RateLimit({ limit: 20, windowSeconds: 300 })
  @Post("storefronts/:slug/orders")
  placeOrder(@Param("slug") slug: string, @Body() dto: PlaceStorefrontOrderDto) {
    return this.storefronts.placeOrder(slug, dto);
  }
}
