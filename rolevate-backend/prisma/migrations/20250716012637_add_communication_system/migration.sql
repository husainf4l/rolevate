-- CreateEnum
CREATE TYPE "CommunicationType" AS ENUM ('WHATSAPP', 'EMAIL', 'PHONE', 'SMS');

-- CreateEnum
CREATE TYPE "CommunicationDirection" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateEnum
CREATE TYPE "CommunicationStatus" AS ENUM ('SENT', 'DELIVERED', 'READ', 'FAILED');

-- CreateTable
CREATE TABLE "communications" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "jobId" TEXT,
    "type" "CommunicationType" NOT NULL,
    "direction" "CommunicationDirection" NOT NULL,
    "status" "CommunicationStatus" NOT NULL DEFAULT 'SENT',
    "content" TEXT NOT NULL,
    "subject" TEXT,
    "whatsappId" TEXT,
    "emailId" TEXT,
    "phoneNumber" TEXT,
    "metadata" JSONB,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredAt" TIMESTAMP(3),
    "readAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "communications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "communications_companyId_candidateId_idx" ON "communications"("companyId", "candidateId");

-- CreateIndex
CREATE INDEX "communications_companyId_type_idx" ON "communications"("companyId", "type");

-- CreateIndex
CREATE INDEX "communications_sentAt_idx" ON "communications"("sentAt");

-- AddForeignKey
ALTER TABLE "communications" ADD CONSTRAINT "communications_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "communications" ADD CONSTRAINT "communications_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "communications" ADD CONSTRAINT "communications_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
