-- CreateIndex
CREATE INDEX "Career_engineerId_idx" ON "Career"("engineerId");

-- CreateIndex
CREATE INDEX "Career_specialization_idx" ON "Career"("specialization");

-- CreateIndex
CREATE INDEX "Career_skills_idx" ON "Career"("skills");

-- CreateIndex
CREATE INDEX "Education_engineerId_idx" ON "Education"("engineerId");

-- CreateIndex
CREATE INDEX "Education_major_idx" ON "Education"("major");

-- CreateIndex
CREATE INDEX "Education_degree_idx" ON "Education"("degree");

-- CreateIndex
CREATE INDEX "Engineer_userId_idx" ON "Engineer"("userId");
