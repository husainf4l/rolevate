/*
  Warnings:

  - Made the column `aiSecondInterviewPrompt` on table `jobs` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "jobs" ALTER COLUMN "aiSecondInterviewPrompt" SET NOT NULL;
