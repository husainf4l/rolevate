-- AlterTable
ALTER TABLE "jobs" ADD COLUMN     "searchVector" to_tsvector('english', title || ' ' || description || ' ' || department || ' ' || location || ' ' || industry);

-- CreateIndex
CREATE INDEX "jobs_searchVector_idx" ON "jobs"("searchVector" gin);
