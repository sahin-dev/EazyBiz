import { Controller, Get, ServiceUnavailableException } from "@nestjs/common";
import { Public } from "../../common/auth/public.decorator";
import { PrismaService } from "../../common/prisma/prisma.service";

@Controller("health")
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  async check() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: "ok", database: "up", timestamp: new Date().toISOString() };
    } catch {
      throw new ServiceUnavailableException({ status: "error", database: "down" });
    }
  }
}
