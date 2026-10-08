UPDATE "Storefront"
SET "theme" = 'modern'
WHERE "theme" NOT IN ('modern', 'classic', 'minimal');
