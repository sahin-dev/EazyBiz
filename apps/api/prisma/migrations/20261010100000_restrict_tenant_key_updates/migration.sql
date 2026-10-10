BEGIN;

ALTER TABLE "InventoryBalance" DROP CONSTRAINT "InventoryBalance_tenantId_branchId_fkey";
ALTER TABLE "InventoryBalance" DROP CONSTRAINT "InventoryBalance_tenantId_productId_fkey";
ALTER TABLE "InventoryMovement" DROP CONSTRAINT "InventoryMovement_tenantId_branchId_fkey";
ALTER TABLE "InventoryMovement" DROP CONSTRAINT "InventoryMovement_tenantId_productId_fkey";
ALTER TABLE "Purchase" DROP CONSTRAINT "Purchase_tenantId_branchId_fkey";
ALTER TABLE "Purchase" DROP CONSTRAINT "Purchase_tenantId_supplierId_fkey";
ALTER TABLE "Order" DROP CONSTRAINT "Order_tenantId_branchId_fkey";
ALTER TABLE "RestaurantTable" DROP CONSTRAINT "RestaurantTable_tenantId_branchId_fkey";
ALTER TABLE "KitchenTicket" DROP CONSTRAINT "KitchenTicket_tenantId_branchId_fkey";
ALTER TABLE "KitchenTicket" DROP CONSTRAINT "KitchenTicket_tenantId_orderId_fkey";

ALTER TABLE "InventoryBalance" ADD CONSTRAINT "InventoryBalance_tenantId_branchId_fkey" FOREIGN KEY ("tenantId", "branchId") REFERENCES "Branch"("tenantId", "id") ON DELETE CASCADE ON UPDATE RESTRICT;
ALTER TABLE "InventoryBalance" ADD CONSTRAINT "InventoryBalance_tenantId_productId_fkey" FOREIGN KEY ("tenantId", "productId") REFERENCES "Product"("tenantId", "id") ON DELETE CASCADE ON UPDATE RESTRICT;
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_tenantId_branchId_fkey" FOREIGN KEY ("tenantId", "branchId") REFERENCES "Branch"("tenantId", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_tenantId_productId_fkey" FOREIGN KEY ("tenantId", "productId") REFERENCES "Product"("tenantId", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_tenantId_branchId_fkey" FOREIGN KEY ("tenantId", "branchId") REFERENCES "Branch"("tenantId", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_tenantId_supplierId_fkey" FOREIGN KEY ("tenantId", "supplierId") REFERENCES "Supplier"("tenantId", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "Order" ADD CONSTRAINT "Order_tenantId_branchId_fkey" FOREIGN KEY ("tenantId", "branchId") REFERENCES "Branch"("tenantId", "id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "RestaurantTable" ADD CONSTRAINT "RestaurantTable_tenantId_branchId_fkey" FOREIGN KEY ("tenantId", "branchId") REFERENCES "Branch"("tenantId", "id") ON DELETE CASCADE ON UPDATE RESTRICT;
ALTER TABLE "KitchenTicket" ADD CONSTRAINT "KitchenTicket_tenantId_branchId_fkey" FOREIGN KEY ("tenantId", "branchId") REFERENCES "Branch"("tenantId", "id") ON DELETE CASCADE ON UPDATE RESTRICT;
ALTER TABLE "KitchenTicket" ADD CONSTRAINT "KitchenTicket_tenantId_orderId_fkey" FOREIGN KEY ("tenantId", "orderId") REFERENCES "Order"("tenantId", "id") ON DELETE CASCADE ON UPDATE RESTRICT;

COMMIT;
