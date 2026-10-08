import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { Request } from "express";
import type { AuthUser } from "./auth-user";

type AuthenticatedRequest = Request & { user: AuthUser };

export const CurrentUser = createParamDecorator((_: unknown, context: ExecutionContext): AuthUser => {
  return context.switchToHttp().getRequest<AuthenticatedRequest>().user;
});
