-- CreateIndex
CREATE INDEX "applications_jobId_status_idx" ON "applications"("jobId", "status");

-- CreateIndex
CREATE INDEX "applications_candidateId_status_idx" ON "applications"("candidateId", "status");

-- CreateIndex
CREATE INDEX "applications_appliedAt_idx" ON "applications"("appliedAt");

-- CreateIndex
CREATE INDEX "candidate_profiles_skills_idx" ON "candidate_profiles"("skills");

-- CreateIndex
CREATE INDEX "candidate_profiles_preferredIndustries_idx" ON "candidate_profiles"("preferredIndustries");

-- CreateIndex
CREATE INDEX "candidate_profiles_preferredLocations_idx" ON "candidate_profiles"("preferredLocations");

-- CreateIndex
CREATE INDEX "candidate_profiles_isOpenToWork_experienceLevel_idx" ON "candidate_profiles"("isOpenToWork", "experienceLevel");

-- CreateIndex
CREATE INDEX "candidate_profiles_currentLocation_isOpenToWork_idx" ON "candidate_profiles"("currentLocation", "isOpenToWork");

-- CreateIndex
CREATE INDEX "communications_candidateId_sentAt_idx" ON "communications"("candidateId", "sentAt");

-- CreateIndex
CREATE INDEX "communications_companyId_sentAt_idx" ON "communications"("companyId", "sentAt");

-- CreateIndex
CREATE INDEX "interviews_jobId_status_idx" ON "interviews"("jobId", "status");

-- CreateIndex
CREATE INDEX "interviews_candidateId_scheduledAt_idx" ON "interviews"("candidateId", "scheduledAt");

-- CreateIndex
CREATE INDEX "interviews_companyId_scheduledAt_idx" ON "interviews"("companyId", "scheduledAt");

-- CreateIndex
CREATE INDEX "jobs_location_idx" ON "jobs"("location");

-- CreateIndex
CREATE INDEX "jobs_department_idx" ON "jobs"("department");

-- CreateIndex
CREATE INDEX "jobs_skills_idx" ON "jobs"("skills");

-- CreateIndex
CREATE INDEX "notifications_userId_timestamp_idx" ON "notifications"("userId", "timestamp");

-- CreateIndex
CREATE INDEX "notifications_companyId_timestamp_idx" ON "notifications"("companyId", "timestamp");
