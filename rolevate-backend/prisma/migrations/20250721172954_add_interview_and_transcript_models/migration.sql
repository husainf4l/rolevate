-- CreateEnum
CREATE TYPE "InterviewStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "InterviewType" AS ENUM ('FIRST_ROUND', 'SECOND_ROUND', 'TECHNICAL', 'HR', 'FINAL');

-- CreateEnum
CREATE TYPE "SpeakerType" AS ENUM ('INTERVIEWER', 'CANDIDATE', 'SYSTEM', 'AI_ASSISTANT');

-- CreateTable
CREATE TABLE "interviews" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "InterviewType" NOT NULL DEFAULT 'FIRST_ROUND',
    "status" "InterviewStatus" NOT NULL DEFAULT 'SCHEDULED',
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "duration" INTEGER,
    "roomId" TEXT,
    "videoLink" TEXT,
    "recordingUrl" TEXT,
    "aiAnalysis" JSONB,
    "aiScore" DOUBLE PRECISION,
    "aiRecommendation" TEXT,
    "analyzedAt" TIMESTAMP(3),
    "interviewerNotes" TEXT,
    "candidateFeedback" TEXT,
    "overallRating" INTEGER,
    "technicalQuestions" JSONB,
    "technicalAnswers" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transcripts" (
    "id" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "speakerType" "SpeakerType" NOT NULL,
    "speakerName" TEXT,
    "speakerId" TEXT,
    "content" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION,
    "language" TEXT DEFAULT 'en',
    "startTime" DOUBLE PRECISION NOT NULL,
    "endTime" DOUBLE PRECISION NOT NULL,
    "duration" DOUBLE PRECISION NOT NULL,
    "sentiment" TEXT,
    "keywords" TEXT[],
    "aiSummary" TEXT,
    "importance" INTEGER DEFAULT 1,
    "sequenceNumber" INTEGER NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transcripts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "interviews_jobId_idx" ON "interviews"("jobId");

-- CreateIndex
CREATE INDEX "interviews_candidateId_idx" ON "interviews"("candidateId");

-- CreateIndex
CREATE INDEX "interviews_companyId_idx" ON "interviews"("companyId");

-- CreateIndex
CREATE INDEX "interviews_roomId_idx" ON "interviews"("roomId");

-- CreateIndex
CREATE INDEX "interviews_status_idx" ON "interviews"("status");

-- CreateIndex
CREATE INDEX "interviews_scheduledAt_idx" ON "interviews"("scheduledAt");

-- CreateIndex
CREATE INDEX "interviews_type_idx" ON "interviews"("type");

-- CreateIndex
CREATE INDEX "transcripts_interviewId_idx" ON "transcripts"("interviewId");

-- CreateIndex
CREATE INDEX "transcripts_speakerType_idx" ON "transcripts"("speakerType");

-- CreateIndex
CREATE INDEX "transcripts_startTime_idx" ON "transcripts"("startTime");

-- CreateIndex
CREATE INDEX "transcripts_sequenceNumber_idx" ON "transcripts"("sequenceNumber");

-- CreateIndex
CREATE INDEX "transcripts_sentiment_idx" ON "transcripts"("sentiment");

-- AddForeignKey
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transcripts" ADD CONSTRAINT "transcripts_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "interviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;
