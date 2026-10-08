import { Module } from "@nestjs/common";
import { OrdersModule } from "../orders/orders.module";
import { StorefrontsController } from "./storefronts.controller";
import { StorefrontsService } from "./storefronts.service";

@Module({ imports: [OrdersModule], controllers: [StorefrontsController], providers: [StorefrontsService] })
export class StorefrontsModule {}
