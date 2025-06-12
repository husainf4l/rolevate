-- AlterTable
ALTER TABLE "cv_analyses" ADD COLUMN     "candidateEmail" TEXT,
ADD COLUMN     "candidateName" TEXT,
ADD COLUMN     "candidatePhone" TEXT,
ADD COLUMN     "jobId" TEXT,
ADD COLUMN     "status" TEXT DEFAULT 'pending',
ADD COLUMN     "whatsappLink" TEXT;
