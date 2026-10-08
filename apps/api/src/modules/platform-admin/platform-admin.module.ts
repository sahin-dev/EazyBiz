import { Module } from "@nestjs/common";
import { SubscriptionsModule } from "../subscriptions/subscriptions.module";
import { TenantsModule } from "../tenants/tenants.module";
import { PlatformAdminController } from "./platform-admin.controller";

@Module({
  imports: [TenantsModule, SubscriptionsModule],
  controllers: [PlatformAdminController],
})
export class PlatformAdminModule {}
