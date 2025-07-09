/*
  Warnings:

  - You are about to drop the `Invitation` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[invitationCode]` on the table `Company` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Invitation" DROP CONSTRAINT "Invitation_companyId_fkey";

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "invitationCode" TEXT;

-- DropTable
DROP TABLE "Invitation";

-- CreateIndex
CREATE UNIQUE INDEX "Company_invitationCode_key" ON "Company"("invitationCode");
