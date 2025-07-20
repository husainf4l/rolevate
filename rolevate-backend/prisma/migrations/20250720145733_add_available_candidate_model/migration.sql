/*
  Warnings:

  - Made the column `cvFileName` on table `available_candidates` required. This step will fail if there are existing NULL values in that column.
  - Made the column `totalExperience` on table `available_candidates` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "available_candidates_isActive_idx";

-- DropIndex
DROP INDEX "available_candidates_isOpenToWork_idx";

-- DropIndex
DROP INDEX "available_candidates_skills_idx";

-- AlterTable
ALTER TABLE "available_candidates" ALTER COLUMN "cvFileName" SET NOT NULL,
ALTER COLUMN "totalExperience" SET NOT NULL,
ALTER COLUMN "totalExperience" SET DEFAULT 0;

-- CreateIndex
CREATE INDEX "available_candidates_email_idx" ON "available_candidates"("email");

-- CreateIndex
CREATE INDEX "available_candidates_isActive_isOpenToWork_idx" ON "available_candidates"("isActive", "isOpenToWork");

-- CreateIndex
CREATE INDEX "available_candidates_createdAt_idx" ON "available_candidates"("createdAt");
