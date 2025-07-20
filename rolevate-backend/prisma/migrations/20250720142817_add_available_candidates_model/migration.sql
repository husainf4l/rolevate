-- CreateTable
CREATE TABLE "available_candidates" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "cvUrl" TEXT NOT NULL,
    "cvFileName" TEXT,
    "currentJobTitle" TEXT,
    "currentCompany" TEXT,
    "totalExperience" INTEGER,
    "skills" TEXT[],
    "education" TEXT,
    "location" TEXT,
    "expectedSalary" TEXT,
    "profileSummary" TEXT,
    "keyStrengths" TEXT[],
    "industryExperience" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isOpenToWork" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "available_candidates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "available_candidates_isActive_idx" ON "available_candidates"("isActive");

-- CreateIndex
CREATE INDEX "available_candidates_isOpenToWork_idx" ON "available_candidates"("isOpenToWork");

-- CreateIndex
CREATE INDEX "available_candidates_currentJobTitle_idx" ON "available_candidates"("currentJobTitle");

-- CreateIndex
CREATE INDEX "available_candidates_totalExperience_idx" ON "available_candidates"("totalExperience");

-- CreateIndex
CREATE INDEX "available_candidates_skills_idx" ON "available_candidates"("skills");

-- CreateIndex
CREATE UNIQUE INDEX "available_candidates_email_key" ON "available_candidates"("email");
