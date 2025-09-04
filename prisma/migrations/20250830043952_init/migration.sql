-- CreateTable
CREATE TABLE "FoodBlogs" (
    "id" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "quote" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "subsection" TEXT NOT NULL,
    "subsubsection" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "imageurl" TEXT NOT NULL,
    "imagealt" TEXT NOT NULL,
    "content" JSONB[],
    "instructions" TEXT[],
    "recipedescription" TEXT NOT NULL,
    "recipedetails" JSONB NOT NULL,
    "seo" JSONB NOT NULL,
    "faq" JSONB NOT NULL,
    "equipments" TEXT[],
    "creationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviews" JSONB[],

    CONSTRAINT "FoodBlogs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FoodBlogs_title_key" ON "FoodBlogs"("title");

-- CreateIndex
CREATE UNIQUE INDEX "FoodBlogs_slug_key" ON "FoodBlogs"("slug");

-- CreateIndex
CREATE INDEX "FoodBlogs_section_idx" ON "FoodBlogs"("section");

-- CreateIndex
CREATE INDEX "FoodBlogs_subsection_idx" ON "FoodBlogs"("subsection");

-- CreateIndex
CREATE INDEX "FoodBlogs_subsubsection_idx" ON "FoodBlogs"("subsubsection");

-- CreateIndex
CREATE INDEX "FoodBlogs_creationDate_idx" ON "FoodBlogs"("creationDate");

-- Enable extension (safe to run if already present)
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

