import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import type { AuthUser } from "../../common/auth/auth-user";
import { CurrentUser } from "../../common/auth/current-user.decorator";
import { Public } from "../../common/auth/public.decorator";
import { Roles } from "../../common/auth/roles.decorator";
import { RateLimit } from "../../common/rate-limit/rate-limit.decorator";
import { AcceptInvitationDto, InviteUserDto, UpdateUserAccessDto, UpdateUserStatusDto } from "./user.dto";
import { UsersService } from "./users.service";

@Controller("tenants/:tenantId/users")
@Roles("owner", "admin")
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  list(@Param("tenantId") tenantId: string) { return this.users.list(tenantId); }

  @Post("invitations")
  invite(@Param("tenantId") tenantId: string, @CurrentUser() actor: AuthUser, @Body() dto: InviteUserDto) {
    return this.users.invite(tenantId, actor, dto);
  }

  @Post(":userId/invitations")
  reissue(@Param("tenantId") tenantId: string, @Param("userId") userId: string, @CurrentUser() actor: AuthUser) {
    return this.users.reissue(tenantId, userId, actor);
  }

  @Patch(":userId/access")
  updateAccess(@Param("tenantId") tenantId: string, @Param("userId") userId: string, @CurrentUser() actor: AuthUser, @Body() dto: UpdateUserAccessDto) {
    return this.users.updateAccess(tenantId, userId, actor, dto);
  }

  @Patch(":userId/status")
  updateStatus(@Param("tenantId") tenantId: string, @Param("userId") userId: string, @CurrentUser() actor: AuthUser, @Body() dto: UpdateUserStatusDto) {
    return this.users.updateStatus(tenantId, userId, actor, dto);
  }
}

@Controller("auth/invitations")
export class InvitationsController {
  constructor(private readonly users: UsersService) {}

  @Public()
  @RateLimit({ limit: 10, windowSeconds: 3600 })
  @Post("accept")
  accept(@Body() dto: AcceptInvitationDto) { return this.users.accept(dto); }
}
