BEGIN;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "InventoryBalance" c JOIN "Branch" p ON p."id" = c."branchId" WHERE c."tenantId" <> p."tenantId")
    OR EXISTS (SELECT 1 FROM "InventoryBalance" c JOIN "Product" p ON p."id" = c."productId" WHERE c."tenantId" <> p."tenantId")
    OR EXISTS (SELECT 1 FROM "InventoryMovement" c JOIN "Branch" p ON p."id" = c."branchId" WHERE c."tenantId" <> p."tenantId")
    OR EXISTS (SELECT 1 FROM "InventoryMovement" c JOIN "Product" p ON p."id" = c."productId" WHERE c."tenantId" <> p."tenantId")
    OR EXISTS (SELECT 1 FROM "Order" c JOIN "Branch" p ON p."id" = c."branchId" WHERE c."tenantId" <> p."tenantId")
    OR EXISTS (SELECT 1 FROM "Purchase" c JOIN "Branch" p ON p."id" = c."branchId" WHERE c."tenantId" <> p."tenantId")
    OR EXISTS (SELECT 1 FROM "Purchase" c JOIN "Supplier" p ON p."id" = c."supplierId" WHERE c."tenantId" <> p."tenantId")
    OR EXISTS (SELECT 1 FROM "RestaurantTable" c JOIN "Branch" p ON p."id" = c."branchId" WHERE c."tenantId" <> p."tenantId")
    OR EXISTS (SELECT 1 FROM "KitchenTicket" c JOIN "Branch" p ON p."id" = c."branchId" WHERE c."tenantId" <> p."tenantId")
    OR EXISTS (SELECT 1 FROM "KitchenTicket" c JOIN "Order" p ON p."id" = c."orderId" WHERE c."tenantId" <> p."tenantId")
  THEN
    RAISE EXCEPTION 'Core tenant foreign keys contain mismatched tenant IDs; reconcile data before applying this migration';
  END IF;
END $$;

CREATE UNIQUE INDEX "Branch_tenantId_id_key" ON "Branch"("tenantId", "id");
CREATE UNIQUE INDEX "Product_tenantId_id_key" ON "Product"("tenantId", "id");
CREATE UNIQUE INDEX "Supplier_tenantId_id_key" ON "Supplier"("tenantId", "id");
CREATE UNIQUE INDEX "Order_tenantId_id_key" ON "Order"("tenantId", "id");
CREATE UNIQUE INDEX "KitchenTicket_tenantId_orderId_key" ON "KitchenTicket"("tenantId", "orderId");

ALTER TABLE "InventoryBalance" DROP CONSTRAINT "InventoryBalance_branchId_fkey";
ALTER TABLE "InventoryBalance" DROP CONSTRAINT "InventoryBalance_productId_fkey";
ALTER TABLE "InventoryMovement" DROP CONSTRAINT "InventoryMovement_branchId_fkey";
ALTER TABLE "InventoryMovement" DROP CONSTRAINT "InventoryMovement_productId_fkey";
ALTER TABLE "Purchase" DROP CONSTRAINT "Purchase_branchId_fkey";
ALTER TABLE "Purchase" DROP CONSTRAINT "Purchase_supplierId_fkey";
ALTER TABLE "Order" DROP CONSTRAINT "Order_branchId_fkey";
ALTER TABLE "RestaurantTable" DROP CONSTRAINT "RestaurantTable_branchId_fkey";
ALTER TABLE "KitchenTicket" DROP CONSTRAINT "KitchenTicket_branchId_fkey";
ALTER TABLE "KitchenTicket" DROP CONSTRAINT "KitchenTicket_orderId_fkey";

ALTER TABLE "InventoryBalance" ADD CONSTRAINT "InventoryBalance_tenantId_branchId_fkey" FOREIGN KEY ("tenantId", "branchId") REFERENCES "Branch"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InventoryBalance" ADD CONSTRAINT "InventoryBalance_tenantId_productId_fkey" FOREIGN KEY ("tenantId", "productId") REFERENCES "Product"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_tenantId_branchId_fkey" FOREIGN KEY ("tenantId", "branchId") REFERENCES "Branch"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_tenantId_productId_fkey" FOREIGN KEY ("tenantId", "productId") REFERENCES "Product"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_tenantId_branchId_fkey" FOREIGN KEY ("tenantId", "branchId") REFERENCES "Branch"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_tenantId_supplierId_fkey" FOREIGN KEY ("tenantId", "supplierId") REFERENCES "Supplier"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_tenantId_branchId_fkey" FOREIGN KEY ("tenantId", "branchId") REFERENCES "Branch"("tenantId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RestaurantTable" ADD CONSTRAINT "RestaurantTable_tenantId_branchId_fkey" FOREIGN KEY ("tenantId", "branchId") REFERENCES "Branch"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "KitchenTicket" ADD CONSTRAINT "KitchenTicket_tenantId_branchId_fkey" FOREIGN KEY ("tenantId", "branchId") REFERENCES "Branch"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "KitchenTicket" ADD CONSTRAINT "KitchenTicket_tenantId_orderId_fkey" FOREIGN KEY ("tenantId", "orderId") REFERENCES "Order"("tenantId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT;
