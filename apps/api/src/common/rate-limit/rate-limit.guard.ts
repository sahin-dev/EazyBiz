import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";
import { Prisma } from "@prisma/client";
import { createHash } from "node:crypto";
import { PrismaService } from "../prisma/prisma.service";
import { RATE_LIMIT_KEY, type RateLimitOptions } from "./rate-limit.decorator";

@Injectable()
export class RateLimitGuard implements CanActivate {
  private lastCleanup = 0;
  constructor(
    private readonly reflector: Reflector,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const options = this.reflector.getAllAndOverride<RateLimitOptions>(RATE_LIMIT_KEY, [context.getHandler(), context.getClass()]);
    if (!options) return true;
    if (this.config.get<string>("RATE_LIMIT_DISABLED") === "true") return true;

    const request = context.switchToHttp().getRequest<Request>();
    const now = Date.now();
    const route = `${context.getClass().name}.${context.getHandler().name}`;
    const body = request.body as { email?: unknown } | undefined;
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const keys = [`${route}:ip:${this.clientIp(request)}`, ...(email ? [`${route}:email:${email}`] : [])];
    const buckets = await Promise.all(keys.map((raw) => this.increment(createHash("sha256").update(raw).digest("hex"), now, options.windowSeconds)));
    if (now - this.lastCleanup > 60_000) {
      this.lastCleanup = now;
      void this.prisma.rateLimitBucket.deleteMany({ where: { resetAt: { lt: new Date(now - 60_000) } } }).catch(() => undefined);
    }
    const exceeded = buckets.find((bucket) => bucket.count > options.limit);
    if (exceeded) {
      const retryAfter = Math.max(1, Math.ceil((exceeded.resetAt.getTime() - now) / 1000));
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

  private async increment(key: string, now: number, windowSeconds: number) {
    const [bucket] = await this.prisma.$queryRaw<Array<{ count: number; resetAt: Date }>>(Prisma.sql`
      INSERT INTO "RateLimitBucket" ("key", "count", "resetAt")
      VALUES (${key}, 1, ${new Date(now + windowSeconds * 1000)})
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE WHEN "RateLimitBucket"."resetAt" <= CURRENT_TIMESTAMP THEN 1 ELSE "RateLimitBucket"."count" + 1 END,
        "resetAt" = CASE WHEN "RateLimitBucket"."resetAt" <= CURRENT_TIMESTAMP THEN EXCLUDED."resetAt" ELSE "RateLimitBucket"."resetAt" END
      RETURNING "count", "resetAt"
    `);
    return bucket;
  }
}
