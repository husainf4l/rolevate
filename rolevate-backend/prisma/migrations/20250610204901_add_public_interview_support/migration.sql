/*
  Warnings:

  - A unique constraint covering the columns `[roomCode]` on the table `interviews` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "interviews" ADD COLUMN     "candidateName" TEXT,
ADD COLUMN     "candidatePhone" TEXT,
ADD COLUMN     "endedAt" TIMESTAMP(3),
ADD COLUMN     "instructions" TEXT,
ADD COLUMN     "maxDuration" INTEGER DEFAULT 1800,
ADD COLUMN     "roomCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "interviews_roomCode_key" ON "interviews"("roomCode");
