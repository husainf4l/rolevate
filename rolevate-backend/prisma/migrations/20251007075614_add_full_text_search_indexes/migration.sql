-- Enable PostgreSQL extensions for full text search
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- AlterTable
ALTER TABLE "jobs" ADD COLUMN     "searchVector" tsvector GENERATED ALWAYS AS (to_tsvector('english', title || ' ' || description || ' ' || department || ' ' || location || ' ' || industry)) STORED;

-- CreateIndex
CREATE INDEX "jobs_searchVector_idx" ON "jobs" USING gin("searchVector");
