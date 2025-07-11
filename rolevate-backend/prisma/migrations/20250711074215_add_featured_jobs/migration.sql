-- AlterTable
ALTER TABLE "jobs" ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "jobs_featured_idx" ON "jobs"("featured");
