/*
  Warnings:

  - You are about to drop the column `resume` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `skills` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Application` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Job` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Application" DROP CONSTRAINT "Application_candidateId_fkey";

-- DropForeignKey
ALTER TABLE "Application" DROP CONSTRAINT "Application_jobId_fkey";

-- DropForeignKey
ALTER TABLE "Job" DROP CONSTRAINT "Job_companyId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "resume",
DROP COLUMN "skills";

-- DropTable
DROP TABLE "Application";

-- DropTable
DROP TABLE "Job";

-- DropEnum
DROP TYPE "ApplicationStatus";

-- DropEnum
DROP TYPE "JobStatus";
