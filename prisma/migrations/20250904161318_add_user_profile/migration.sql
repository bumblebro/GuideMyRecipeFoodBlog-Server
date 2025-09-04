-- This is an empty migration.-- Enable extension (safe to run if already present)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Substring search (case-insensitive)
CREATE INDEX foodblogs_title_trgm_idx
  ON "FoodBlogs" USING GIN (lower("title") gin_trgm_ops);
CREATE INDEX foodblogs_recipedescription_trgm_idx
  ON "FoodBlogs" USING GIN (lower("recipedescription") gin_trgm_ops);

-- Array membership search
CREATE INDEX foodblogs_instructions_gin_idx
  ON "FoodBlogs" USING GIN ("instructions");
CREATE INDEX foodblogs_equipments_gin_idx
  ON "FoodBlogs" USING GIN ("equipments");
