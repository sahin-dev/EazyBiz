import { Module } from "@nestjs/common";
import { ManualBillingProvider } from "./billing-provider";
import { SubscriptionsController } from "./subscriptions.controller";
import { SubscriptionsService } from "./subscriptions.service";

@Module({
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, ManualBillingProvider],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
