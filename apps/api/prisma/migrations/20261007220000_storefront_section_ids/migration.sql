UPDATE "Storefront" AS s
SET "sections" = (
  SELECT COALESCE(jsonb_agg(
    CASE
      WHEN jsonb_typeof(section.value -> 'id') = 'string' AND section.value ->> 'id' <> '' THEN section.value
      ELSE section.value || jsonb_build_object('id', COALESCE(section.value ->> 'type', 'section') || '-' || section.ordinality::text)
    END ORDER BY section.ordinality
  ), '[]'::jsonb)
  FROM jsonb_array_elements(s."sections") WITH ORDINALITY AS section(value, ordinality)
)
WHERE jsonb_typeof(s."sections") = 'array';

UPDATE "Storefront" AS s
SET "publishedConfig" = jsonb_set(
  s."publishedConfig",
  '{sections}',
  (
    SELECT COALESCE(jsonb_agg(
      CASE
        WHEN jsonb_typeof(section.value -> 'id') = 'string' AND section.value ->> 'id' <> '' THEN section.value
        ELSE section.value || jsonb_build_object('id', COALESCE(section.value ->> 'type', 'section') || '-' || section.ordinality::text)
      END ORDER BY section.ordinality
    ), '[]'::jsonb)
    FROM jsonb_array_elements(s."publishedConfig" -> 'sections') WITH ORDINALITY AS section(value, ordinality)
  )
)
WHERE s."publishedConfig" IS NOT NULL AND jsonb_typeof(s."publishedConfig" -> 'sections') = 'array';
