-- DropIndex
DROP INDEX "Career_skills_idx";

-- CreateIndex
CREATE INDEX "Career_skills_idx" ON "Career" USING GIN ("skills");
