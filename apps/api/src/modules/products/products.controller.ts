import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { CurrentUser } from "../../common/auth/current-user.decorator";
import { RequireModule } from "../../common/auth/require-module.decorator";
import { Roles } from "../../common/auth/roles.decorator";
import type { AuthUser } from "../../common/auth/auth-user";
import { AdjustStockDto } from "./adjust-stock.dto";
import { CreateProductDto } from "./create-product.dto";
import { ProductsService } from "./products.service";

@Controller("tenants/:tenantId/products")
@RequireModule("inventory")
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  list(@Param("tenantId") tenantId: string) {
    return this.products.list(tenantId);
  }

  @Post()
  @Roles("owner", "admin", "manager", "inventoryManager")
  create(@Param("tenantId") tenantId: string, @CurrentUser() user: AuthUser, @Body() dto: CreateProductDto) {
    return this.products.create(tenantId, user, dto);
  }

  @Patch(":productId/stock")
  @Roles("owner", "admin", "manager", "inventoryManager")
  adjustStock(
    @Param("tenantId") tenantId: string,
    @Param("productId") productId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: AdjustStockDto,
  ) {
    return this.products.adjustStock(tenantId, productId, user, dto);
  }
}
