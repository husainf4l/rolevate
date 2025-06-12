/*
  Warnings:

  - You are about to drop the column `answer` on the `interview_history` table. All the data in the column will be lost.
  - You are about to drop the column `question` on the `interview_history` table. All the data in the column will be lost.
  - Added the required column `jobId` to the `interview_history` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "interview_history" DROP COLUMN "answer",
DROP COLUMN "question",
ADD COLUMN     "ai" TEXT,
ADD COLUMN     "jobId" VARCHAR(64) NOT NULL,
ADD COLUMN     "user" TEXT;

-- AddForeignKey
ALTER TABLE "interview_history" ADD CONSTRAINT "interview_history_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "job_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
