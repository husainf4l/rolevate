/*
  Warnings:

  - You are about to drop the `screening_answers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `screening_questions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "screening_answers" DROP CONSTRAINT "screening_answers_applicationId_fkey";

-- DropForeignKey
ALTER TABLE "screening_answers" DROP CONSTRAINT "screening_answers_questionId_fkey";

-- DropForeignKey
ALTER TABLE "screening_questions" DROP CONSTRAINT "screening_questions_jobId_fkey";

-- AlterTable
ALTER TABLE "applications" ADD COLUMN     "analyzedAt" TIMESTAMP(3),
ADD COLUMN     "cvAnalysisResults" JSONB,
ADD COLUMN     "cvAnalysisScore" DOUBLE PRECISION;

-- DropTable
DROP TABLE "screening_answers";

-- DropTable
DROP TABLE "screening_questions";

-- DropEnum
DROP TYPE "ScreeningQuestionType";
