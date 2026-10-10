import { Body, Controller, Get, Headers, Param, Patch, Post } from "@nestjs/common";
import { CurrentUser } from "../../common/auth/current-user.decorator";
import { Public } from "../../common/auth/public.decorator";
import type { AuthUser } from "../../common/auth/auth-user";
import { AllowPlatform } from "../../common/auth/allow-platform.decorator";
import { RateLimit } from "../../common/rate-limit/rate-limit.decorator";
import { AuthService } from "./auth.service";
import { LoginDto } from "./login.dto";
import { CreateTenantDto } from "../tenants/create-tenant.dto";
import { EmailDto, ProfileDto, ResetPasswordDto, SwitchTenantDto, TokenDto } from "./account.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @RateLimit({ limit: 10, windowSeconds: 60 })
  @Post("login")
  login(@Body() dto: LoginDto, @Headers("user-agent") userAgent?: string) {
    return this.auth.login(dto, userAgent);
  }

  @Public()
  @RateLimit({ limit: 3, windowSeconds: 3600 })
  @Post("signup")
  signup(@Body() dto: CreateTenantDto) { return this.auth.signup(dto); }

  @Public()
  @RateLimit({ limit: 3, windowSeconds: 3600 })
  @Post("forgot-password")
  forgot(@Body() dto: EmailDto) { return this.auth.requestReset(dto.email); }

  @Public()
  @RateLimit({ limit: 5, windowSeconds: 3600 })
  @Post("reset-password")
  reset(@Body() dto: ResetPasswordDto) { return this.auth.resetPassword(dto.token, dto.password); }

  @Public()
  @RateLimit({ limit: 3, windowSeconds: 3600 })
  @Post("resend-verification")
  resend(@Body() dto: EmailDto) { return this.auth.resendVerification(dto.email); }

  @Public()
  @RateLimit({ limit: 5, windowSeconds: 3600 })
  @Post("verify-email")
  verify(@Body() dto: TokenDto) { return this.auth.verifyEmail(dto.token); }

  @Get("me")
  @AllowPlatform()
  async me(@CurrentUser() user: AuthUser) {
    const session = await this.auth.session(user.id, user.tenantId);
    return { ...session, user: { ...session.user, sessionId: user.sessionId } };
  }

  @Get("sessions")
  @AllowPlatform()
  sessions(@CurrentUser() user: AuthUser) { return this.auth.sessions(user.id); }

  @Post("sessions/:sessionId/revoke")
  @AllowPlatform()
  revoke(@CurrentUser() user: AuthUser, @Param("sessionId") sessionId: string) { return this.auth.revokeSession(user, sessionId); }

  @Get("memberships")
  memberships(@CurrentUser() user: AuthUser) { return this.auth.memberships(user.id); }

  @Post("switch-tenant")
  switchTenant(@CurrentUser() user: AuthUser, @Body() dto: SwitchTenantDto) { return this.auth.switchTenant(user, dto.tenantId); }

  @Post("logout")
  @AllowPlatform()
  logout(@CurrentUser() user: AuthUser) { return this.auth.logout(user); }

  @Patch("profile")
  @AllowPlatform()
  profile(@CurrentUser() user: AuthUser, @Body() dto: ProfileDto) { return this.auth.profile(user, dto.name, dto.phone); }
}
