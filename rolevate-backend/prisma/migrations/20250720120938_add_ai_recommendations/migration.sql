-- AlterTable
ALTER TABLE "applications" ADD COLUMN     "aiCvRecommendations" TEXT,
ADD COLUMN     "aiInterviewRecommendations" TEXT,
ADD COLUMN     "aiSecondInterviewRecommendations" TEXT,
ADD COLUMN     "recommendationsGeneratedAt" TIMESTAMP(3);
