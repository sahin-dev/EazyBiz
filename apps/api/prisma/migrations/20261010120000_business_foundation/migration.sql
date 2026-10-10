BEGIN;

SET LOCAL TIME ZONE 'UTC';

CREATE TABLE "BusinessTypeDefinition" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "configVersion" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "BusinessTypeDefinition_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "BusinessTypeDefinition_configVersion_check" CHECK ("configVersion" > 0),
    CONSTRAINT "BusinessTypeDefinition_status_check" CHECK ("status" IN ('active', 'retired'))
);

CREATE TABLE "Business" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "businessTypeId" TEXT NOT NULL,
    "code" TEXT NOT NULL DEFAULT 'MAIN',
    "legalName" TEXT NOT NULL,
    "tradingName" TEXT NOT NULL,
    "currencyCode" VARCHAR(3) NOT NULL DEFAULT 'BDT',
    "status" TEXT NOT NULL DEFAULT 'active',
    "version" BIGINT NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "Business_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Business_currencyCode_check" CHECK ("currencyCode" ~ '^[A-Z]{3}$'),
    CONSTRAINT "Business_version_check" CHECK ("version" > 0),
    CONSTRAINT "Business_status_check" CHECK ("status" IN ('active', 'inactive'))
);

ALTER TABLE "Branch" ADD COLUMN "businessId" TEXT;

CREATE UNIQUE INDEX "BusinessTypeDefinition_code_key" ON "BusinessTypeDefinition"("code");
CREATE UNIQUE INDEX "Business_tenantId_key" ON "Business"("tenantId");
CREATE INDEX "Business_businessTypeId_idx" ON "Business"("businessTypeId");
CREATE UNIQUE INDEX "Business_tenantId_code_key" ON "Business"("tenantId", "code");
CREATE UNIQUE INDEX "Business_tenantId_id_key" ON "Business"("tenantId", "id");
CREATE INDEX "Branch_tenantId_businessId_idx" ON "Branch"("tenantId", "businessId");

ALTER TABLE "Business" ADD CONSTRAINT "Business_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE RESTRICT;
ALTER TABLE "Business" ADD CONSTRAINT "Business_businessTypeId_fkey" FOREIGN KEY ("businessTypeId") REFERENCES "BusinessTypeDefinition"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

INSERT INTO "BusinessTypeDefinition" ("id", "code", "updatedAt")
SELECT 'bt_' || type_code, type_code, CURRENT_TIMESTAMP
FROM (SELECT unnest(enum_range(NULL::"BusinessType"))::text AS type_code) AS types;

INSERT INTO "Business" ("id", "tenantId", "businessTypeId", "legalName", "tradingName", "currencyCode", "createdAt", "updatedAt")
SELECT 'biz_' || tenant."id", tenant."id", type_definition."id", tenant."name", tenant."name", tenant."currency",
       tenant."createdAt" AT TIME ZONE 'UTC', tenant."updatedAt" AT TIME ZONE 'UTC'
FROM "Tenant" AS tenant
JOIN "BusinessTypeDefinition" AS type_definition ON type_definition."code" = tenant."businessType"::text;

UPDATE "Branch" AS branch
SET "businessId" = business."id"
FROM "Business" AS business
WHERE business."tenantId" = branch."tenantId";

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM "Tenant" AS tenant LEFT JOIN "Business" AS business ON business."tenantId" = tenant."id" WHERE business."id" IS NULL)
       OR EXISTS (SELECT 1 FROM "Branch" WHERE "businessId" IS NULL) THEN
        RAISE EXCEPTION 'Business foundation backfill is incomplete';
    END IF;
END $$;

ALTER TABLE "Branch" ADD CONSTRAINT "Branch_tenantId_businessId_fkey"
    FOREIGN KEY ("tenantId", "businessId") REFERENCES "Business"("tenantId", "id")
    ON DELETE RESTRICT ON UPDATE RESTRICT;

COMMIT;
