UPDATE "TenantModule"
SET "enabled" = false
WHERE "moduleId" IN ('pharmacy', 'barcodeScale', 'crm', 'multiBranch', 'marketing')
  AND "enabled" = true;

UPDATE "Subscription" AS subscription
SET "amount" = (
  SELECT (
    (CASE WHEN subscription."planCode" = 'business' THEN 2490 ELSE 0 END)
    + COALESCE(SUM(CASE module."moduleId"
      WHEN 'pos' THEN 1200
      WHEN 'inventory' THEN 900
      WHEN 'suppliers' THEN 650
      WHEN 'customers' THEN 400
      WHEN 'staff' THEN 700
      WHEN 'reports' THEN 600
      WHEN 'storefront' THEN 1000
      WHEN 'websiteBuilder' THEN 700
      WHEN 'restaurantTables' THEN 500
      WHEN 'restaurantKitchen' THEN 750
      ELSE 0
    END), 0)
  ) * (CASE WHEN subscription."interval" = 'yearly' THEN 12 ELSE 1 END)
  FROM "TenantModule" AS module
  WHERE module."tenantId" = subscription."tenantId" AND module."enabled" = true
);
