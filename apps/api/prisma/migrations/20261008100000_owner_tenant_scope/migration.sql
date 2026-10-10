UPDATE "User"
SET "branchId" = NULL
WHERE "role" = 'owner' AND "branchId" IS NOT NULL;
