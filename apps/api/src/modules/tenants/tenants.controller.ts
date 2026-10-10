import { Body, Controller, ForbiddenException, Get, Param, Post } from "@nestjs/common";
import { CurrentUser } from "../../common/auth/current-user.decorator";
import { Roles } from "../../common/auth/roles.decorator";
import type { AuthUser } from "../../common/auth/auth-user";
import { RateLimit } from "../../common/rate-limit/rate-limit.decorator";
import { CreateWorkspaceDto } from "./create-tenant.dto";
import { randomBytes } from "node:crypto";
import { TenantsService } from "./tenants.service";
import { CreateBranchDto } from "./create-branch.dto";

@Controller("tenants")
export class TenantsController {
  constructor(
    private readonly tenants: TenantsService,
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
  @Roles("owner", "admin")
  @RateLimit({ limit: 3, windowSeconds: 3600 })
  create(@Body() dto: CreateWorkspaceDto, @CurrentUser() user: AuthUser) {
    return this.tenants.create({ ...dto, email: user.email, ownerName: user.name, password: randomBytes(32).toString("hex") }, user.id);
  }

  @Post(":tenantId/branches")
  @Roles("owner", "admin")
  createBranch(@Param("tenantId") tenantId: string, @CurrentUser() user: AuthUser, @Body() dto: CreateBranchDto) {
    return this.tenants.createBranch(tenantId, user.id, dto.name, dto.code, dto.address);
  }
}
