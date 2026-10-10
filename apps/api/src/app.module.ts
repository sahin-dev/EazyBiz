import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { JwtAuthGuard } from "./common/auth/jwt-auth.guard";
import { ModuleGuard } from "./common/auth/module.guard";
import { PermissionGuard } from "./common/auth/permission.guard";
import { RolesGuard } from "./common/auth/roles.guard";
import { SubscriptionGuard } from "./common/auth/subscription.guard";
import { TenantAccessGuard } from "./common/auth/tenant-access.guard";
import { PrismaModule } from "./common/prisma/prisma.module";
import { RateLimitGuard } from "./common/rate-limit/rate-limit.guard";
import { AuditModule } from "./modules/audit/audit.module";
import { AuthModule } from "./modules/auth/auth.module";
import { CustomersModule } from "./modules/customers/customers.module";
import { DashboardModule } from "./modules/dashboard/dashboard.module";
import { HealthModule } from "./modules/health/health.module";
import { InventoryModule } from "./modules/inventory/inventory.module";
import { OrdersModule } from "./modules/orders/orders.module";
import { PlatformAdminModule } from "./modules/platform-admin/platform-admin.module";
import { ProductsModule } from "./modules/products/products.module";
import { PurchasesModule } from "./modules/purchases/purchases.module";
import { RestaurantModule } from "./modules/restaurant/restaurant.module";
import { StaffModule } from "./modules/staff/staff.module";
import { StorefrontsModule } from "./modules/storefronts/storefronts.module";
import { SuppliersModule } from "./modules/suppliers/suppliers.module";
import { SubscriptionsModule } from "./modules/subscriptions/subscriptions.module";
import { TenantsModule } from "./modules/tenants/tenants.module";
import { UsersModule } from "./modules/users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config: Record<string, unknown>) => {
        if (config.NODE_ENV === "production") {
          const secret = String(config.JWT_SECRET ?? "");
          const origin = String(config.WEB_ORIGIN ?? "");
          if (secret.length < 32 || secret.includes("replace-with")) throw new Error("Set a unique JWT_SECRET of at least 32 characters before production startup.");
          if (!origin.startsWith("https://")) throw new Error("WEB_ORIGIN must use HTTPS in production.");
          if (config.RATE_LIMIT_DISABLED === "true") throw new Error("Rate limiting cannot be disabled in production.");
        }
        return config;
      },
    }),
    PrismaModule,
    AuditModule,
    AuthModule,
    HealthModule,
    TenantsModule,
    PlatformAdminModule,
    ProductsModule,
    OrdersModule,
    SubscriptionsModule,
    CustomersModule,
    SuppliersModule,
    PurchasesModule,
    RestaurantModule,
    InventoryModule,
    StaffModule,
    UsersModule,
    StorefrontsModule,
    DashboardModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: RateLimitGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: TenantAccessGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: PermissionGuard },
    { provide: APP_GUARD, useClass: SubscriptionGuard },
    { provide: APP_GUARD, useClass: ModuleGuard },
  ],
})
export class AppModule {}
