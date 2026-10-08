import { Body, Controller, ForbiddenException, Get, Param, Post } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { CurrentUser } from "../../common/auth/current-user.decorator";
import { Public } from "../../common/auth/public.decorator";
import type { AuthUser } from "../../common/auth/auth-user";
import { RateLimit } from "../../common/rate-limit/rate-limit.decorator";
import { CreateTenantDto } from "./create-tenant.dto";
import { TenantsService } from "./tenants.service";

@Controller("tenants")
export class TenantsController {
  constructor(
    private readonly tenants: TenantsService,
    private readonly config: ConfigService,
  ) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    if (!user.tenantId) throw new ForbiddenException("Use platform administration to list tenants.");
    return this.tenants.list(user.tenantId);
  }

  @Get(":id")
  get(@Param("id") id: string) {
    return this.tenants.get(id);
  }

  @Post()
  @Public()
  @RateLimit({ limit: 3, windowSeconds: 3600 })
  create(@Body() dto: CreateTenantDto) {
    const defaultEnabled = this.config.get<string>("NODE_ENV") === "production" ? "false" : "true";
    const enabled = this.config.get<string>("PUBLIC_SIGNUP_ENABLED", defaultEnabled) === "true";
    if (!enabled) throw new ForbiddenException("Public signup is disabled. Contact the platform administrator to create a workspace.");
    return this.tenants.create(dto);
  }
}
