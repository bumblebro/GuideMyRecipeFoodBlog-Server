/*
  Warnings:

  - A unique constraint covering the columns `[creationDate,id]` on the table `FoodBlogs` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."FoodBlogs_creationDate_idx";

-- DropIndex
DROP INDEX "public"."FoodBlogs_section_idx";

-- DropIndex
DROP INDEX "public"."FoodBlogs_subsection_idx";

-- DropIndex
DROP INDEX "public"."FoodBlogs_subsubsection_idx";

-- CreateIndex
CREATE INDEX "idx_section_date" ON "public"."FoodBlogs"("section", "creationDate" DESC);

-- CreateIndex
CREATE INDEX "idx_subsection_date" ON "public"."FoodBlogs"("subsection", "creationDate" DESC);

-- CreateIndex
CREATE INDEX "idx_subsubsection_date" ON "public"."FoodBlogs"("subsubsection", "creationDate" DESC);

-- CreateIndex
CREATE INDEX "idx_title_btree" ON "public"."FoodBlogs"("title");

-- CreateIndex
CREATE INDEX "idx_recipedescription_btree" ON "public"."FoodBlogs"("recipedescription");

-- CreateIndex
CREATE UNIQUE INDEX "FoodBlogs_creationDate_id_key" ON "public"."FoodBlogs"("creationDate", "id");
