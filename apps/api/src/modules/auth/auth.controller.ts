import { Body, Controller, Get, Post } from "@nestjs/common";
import { CurrentUser } from "../../common/auth/current-user.decorator";
import { Public } from "../../common/auth/public.decorator";
import type { AuthUser } from "../../common/auth/auth-user";
import { AllowPlatform } from "../../common/auth/allow-platform.decorator";
import { RateLimit } from "../../common/rate-limit/rate-limit.decorator";
import { AuthService } from "./auth.service";
import { LoginDto } from "./login.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @RateLimit({ limit: 10, windowSeconds: 60 })
  @Post("login")
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Get("me")
  @AllowPlatform()
  me(@CurrentUser() user: AuthUser) {
    return this.auth.session(user.id);
  }
}
