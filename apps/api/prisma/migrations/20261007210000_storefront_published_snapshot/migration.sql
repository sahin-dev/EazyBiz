ALTER TABLE "Storefront" ADD COLUMN "publishedSlug" TEXT;
ALTER TABLE "Storefront" ADD COLUMN "publishedConfig" JSONB;
CREATE UNIQUE INDEX "Storefront_publishedSlug_key" ON "Storefront"("publishedSlug");

UPDATE "Storefront"
SET "publishedSlug" = "slug",
    "publishedConfig" = jsonb_build_object(
      'slug', "slug",
      'heroTitle', "heroTitle",
      'tagline', "tagline",
      'theme', "theme",
      'primaryColor', "primaryColor",
      'deliveryEnabled', "deliveryEnabled",
      'pickupEnabled', "pickupEnabled",
      'sections', "sections"
    )
WHERE "status" = 'published';
