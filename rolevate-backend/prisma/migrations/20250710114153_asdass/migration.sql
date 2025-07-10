/*
  Warnings:

  - Made the column `shortDescription` on table `jobs` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "jobs" ALTER COLUMN "shortDescription" SET NOT NULL;
