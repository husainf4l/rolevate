/*
  Warnings:

  - A unique constraint covering the columns `[invitationCode]` on the table `Company` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "invitationCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Company_invitationCode_key" ON "Company"("invitationCode");
