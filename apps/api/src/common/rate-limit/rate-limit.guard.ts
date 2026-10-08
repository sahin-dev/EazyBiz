import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";
import { RATE_LIMIT_KEY, type RateLimitOptions } from "./rate-limit.decorator";

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly config: ConfigService,
  ) {}

  canActivate(context: ExecutionContext) {
    const options = this.reflector.getAllAndOverride<RateLimitOptions>(RATE_LIMIT_KEY, [context.getHandler(), context.getClass()]);
    if (!options) return true;
    if (this.config.get<string>("RATE_LIMIT_DISABLED") === "true") return true;

    const request = context.switchToHttp().getRequest<Request>();
    const now = Date.now();
    const key = `${context.getClass().name}.${context.getHandler().name}:${this.clientIp(request)}:${this.identity(request)}`;
    const current = buckets.get(key);
    if (!current || current.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + options.windowSeconds * 1000 });
      this.cleanup(now);
      return true;
    }

    current.count += 1;
    if (current.count > options.limit) {
      const retryAfter = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
      throw new HttpException(
        { message: "Too many requests. Please try again later.", retryAfterSeconds: retryAfter },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    return true;
  }

  private clientIp(request: Request) {
    // Express applies the configured trust-proxy hop count to request.ip.
    return request.ip || request.socket.remoteAddress || "unknown";
  }

  private identity(request: Request) {
    const body = request.body as Record<string, unknown> | undefined;
    const params = request.params as Record<string, string | undefined>;
    const email = typeof body?.email === "string" ? body.email.toLowerCase() : "";
    const phone = typeof body?.phone === "string" ? body.phone : "";
    return [params.slug, params.tenantId, email, phone].filter(Boolean).join(":") || "anonymous";
  }

  private cleanup(now: number) {
    if (buckets.size < 10_000) return;
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(key);
    }
  }
}
