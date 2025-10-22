-- CreateEnum
CREATE TYPE "SubscriptionType" AS ENUM ('FREE', 'PRO', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "Industry" AS ENUM ('TECHNOLOGY', 'HEALTHCARE', 'FINANCE', 'EDUCATION', 'MANUFACTURING', 'RETAIL', 'CONSTRUCTION', 'TRANSPORTATION', 'HOSPITALITY', 'CONSULTING', 'MARKETING', 'REAL_ESTATE', 'MEDIA', 'AGRICULTURE', 'ENERGY', 'GOVERNMENT', 'NON_PROFIT', 'OTHER');

-- CreateEnum
CREATE TYPE "Country" AS ENUM ('AE', 'SA', 'QA', 'KW', 'BH', 'OM', 'EG', 'JO', 'LB', 'SY', 'IQ', 'YE', 'MA', 'TN', 'DZ', 'LY', 'SD', 'SO', 'DJ', 'KM');

-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('SYSTEM', 'COMPANY', 'CANDIDATE', 'ADMIN');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "TokenType" AS ENUM ('REFRESH');

-- CreateEnum
CREATE TYPE "CVStatus" AS ENUM ('UPLOADED', 'PROCESSING', 'PROCESSED', 'ERROR');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('SUBMITTED', 'REVIEWING', 'INTERVIEW_SCHEDULED', 'INTERVIEWED', 'OFFERED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('SUCCESS', 'WARNING', 'INFO', 'ERROR');

-- CreateEnum
CREATE TYPE "NotificationCategory" AS ENUM ('APPLICATION', 'INTERVIEW', 'SYSTEM', 'CANDIDATE', 'OFFER');

-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'REMOTE');

-- CreateEnum
CREATE TYPE "JobLevel" AS ENUM ('ENTRY', 'MID', 'SENIOR', 'EXECUTIVE');

-- CreateEnum
CREATE TYPE "WorkType" AS ENUM ('ONSITE', 'REMOTE', 'HYBRID');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'CLOSED', 'EXPIRED', 'DELETED');

-- CreateEnum
CREATE TYPE "ExperienceLevel" AS ENUM ('FRESH_GRADUATE', 'ENTRY_LEVEL', 'MID_LEVEL', 'SENIOR_LEVEL', 'EXECUTIVE');

-- CreateEnum
CREATE TYPE "EducationLevel" AS ENUM ('HIGH_SCHOOL', 'DIPLOMA', 'BACHELOR', 'MASTER', 'PHD', 'PROFESSIONAL_CERTIFICATION');

-- CreateEnum
CREATE TYPE "NoteSource" AS ENUM ('USER', 'AI', 'SYSTEM');

-- CreateEnum
CREATE TYPE "CommunicationType" AS ENUM ('WHATSAPP', 'EMAIL', 'PHONE', 'SMS');

-- CreateEnum
CREATE TYPE "CommunicationDirection" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateEnum
CREATE TYPE "CommunicationStatus" AS ENUM ('SENT', 'DELIVERED', 'READ', 'FAILED');

-- CreateEnum
CREATE TYPE "InterviewStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "InterviewType" AS ENUM ('FIRST_ROUND', 'SECOND_ROUND', 'TECHNICAL', 'HR', 'FINAL');

-- CreateEnum
CREATE TYPE "SpeakerType" AS ENUM ('INTERVIEWER', 'CANDIDATE', 'SYSTEM', 'AI_ASSISTANT');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('ANALYTICS', 'PERFORMANCE', 'COMPLIANCE', 'OPERATIONAL', 'FINANCIAL', 'SUMMARY', 'DETAILED', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ReportCategory" AS ENUM ('RECRUITMENT_METRICS', 'CANDIDATE_PIPELINE', 'INTERVIEW_ANALYTICS', 'HIRING_FUNNEL', 'TIME_TO_HIRE', 'COST_PER_HIRE', 'SOURCE_EFFECTIVENESS', 'COMPANY_OVERVIEW', 'DEPARTMENT_ANALYTICS', 'EMPLOYEE_METRICS', 'SUBSCRIPTION_USAGE', 'JOB_PERFORMANCE', 'APPLICATION_TRENDS', 'JOB_ANALYTICS', 'MARKET_ANALYSIS', 'COMMUNICATION_METRICS', 'ENGAGEMENT_ANALYTICS', 'RESPONSE_RATES', 'USER_ACTIVITY', 'SYSTEM_PERFORMANCE', 'SECURITY_AUDIT', 'ERROR_ANALYTICS', 'BILLING_SUMMARY', 'REVENUE_ANALYTICS', 'COST_ANALYSIS', 'CUSTOM_ANALYTICS');

-- CreateEnum
CREATE TYPE "ReportFormat" AS ENUM ('PDF', 'EXCEL', 'CSV', 'JSON', 'HTML', 'DASHBOARD');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('DRAFT', 'GENERATING', 'COMPLETED', 'FAILED', 'SCHEDULED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ReportScope" AS ENUM ('GLOBAL', 'COMPANY', 'DEPARTMENT', 'USER');

-- CreateEnum
CREATE TYPE "ReportPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "SharePermission" AS ENUM ('VIEW_ONLY', 'DOWNLOAD', 'EDIT', 'FULL_ACCESS');

-- CreateEnum
CREATE TYPE "ScheduleFrequency" AS ENUM ('ONCE', 'DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ReportDataSource" AS ENUM ('APPLICATIONS', 'CANDIDATES', 'JOBS', 'INTERVIEWS', 'USERS', 'COMPANIES', 'COMMUNICATIONS', 'SECURITY_LOGS', 'CUSTOM_QUERY', 'MIXED');

-- CreateEnum
CREATE TYPE "ExecutionStatus" AS ENUM ('PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'CANCELLED', 'TIMEOUT');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATED', 'UPDATED', 'DELETED', 'GENERATED', 'ACCESSED', 'SHARED', 'DOWNLOADED', 'SCHEDULED', 'UNSCHEDULED', 'ARCHIVED', 'RESTORED', 'PERMISSIONS_CHANGED', 'TEMPLATE_APPLIED', 'EXECUTION_STARTED', 'EXECUTION_COMPLETED', 'EXECUTION_FAILED', 'SHARE_REVOKED');

-- CreateTable
CREATE TABLE "security_logs" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "userId" TEXT,
    "ipHash" TEXT NOT NULL,
    "userAgentHash" TEXT,
    "details" JSONB NOT NULL,
    "severity" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "security_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LiveKitRoom" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "metadata" JSONB,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LiveKitRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "userType" "UserType" NOT NULL,
    "password" TEXT,
    "email" TEXT,
    "name" TEXT,
    "avatar" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "companyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "category" "NotificationCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "actionUrl" TEXT,
    "metadata" JSONB,
    "userId" TEXT,
    "companyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "addresses" (
    "id" TEXT NOT NULL,
    "street" TEXT,
    "city" TEXT,
    "country" "Country" NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "spelling" TEXT,
    "description" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "logo" TEXT,
    "industry" "Industry",
    "numberOfEmployees" INTEGER,
    "subscription" "SubscriptionType" NOT NULL DEFAULT 'FREE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invitations" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "email" TEXT,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "companyId" TEXT NOT NULL,
    "usedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "salary" TEXT NOT NULL,
    "type" "JobType" NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "responsibilities" TEXT NOT NULL,
    "requirements" TEXT NOT NULL,
    "benefits" TEXT NOT NULL,
    "skills" TEXT[],
    "experience" TEXT NOT NULL,
    "education" TEXT NOT NULL,
    "jobLevel" "JobLevel" NOT NULL,
    "workType" "WorkType" NOT NULL,
    "industry" TEXT NOT NULL,
    "companyDescription" TEXT NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'DRAFT',
    "companyId" TEXT NOT NULL,
    "cvAnalysisPrompt" TEXT,
    "interviewPrompt" TEXT,
    "aiSecondInterviewPrompt" TEXT,
    "interviewLanguage" TEXT NOT NULL DEFAULT 'english',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "applicants" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_profiles" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "nationality" "Country",
    "currentLocation" TEXT,
    "currentJobTitle" TEXT,
    "currentCompany" TEXT,
    "experienceLevel" "ExperienceLevel",
    "totalExperience" INTEGER,
    "expectedSalary" TEXT,
    "noticePeriod" TEXT,
    "highestEducation" "EducationLevel",
    "fieldOfStudy" TEXT,
    "university" TEXT,
    "graduationYear" INTEGER,
    "skills" TEXT[],
    "preferredJobTypes" "JobType"[],
    "preferredWorkType" "WorkType",
    "preferredIndustries" "Industry"[],
    "preferredLocations" TEXT[],
    "savedJobs" TEXT[],
    "resumeUrl" TEXT,
    "portfolioUrl" TEXT,
    "linkedInUrl" TEXT,
    "githubUrl" TEXT,
    "isProfilePublic" BOOLEAN NOT NULL DEFAULT true,
    "isOpenToWork" BOOLEAN NOT NULL DEFAULT true,
    "profileSummary" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidate_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_experiences" (
    "id" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "location" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "candidateId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_experiences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "education_history" (
    "id" TEXT NOT NULL,
    "degree" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "fieldOfStudy" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "grade" TEXT,
    "description" TEXT,
    "candidateId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "education_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cvs" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "originalFileName" TEXT,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "status" "CVStatus" NOT NULL DEFAULT 'UPLOADED',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "extractedData" JSONB,
    "candidateId" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cvs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhatsAppMessage" (
    "id" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT,
    "mediaUrl" TEXT,
    "error" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredAt" TIMESTAMP(3),
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhatsAppMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'SUBMITTED',
    "jobId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "coverLetter" TEXT,
    "resumeUrl" TEXT,
    "expectedSalary" TEXT,
    "noticePeriod" TEXT,
    "cvAnalysisScore" DOUBLE PRECISION,
    "cvAnalysisResults" JSONB,
    "analyzedAt" TIMESTAMP(3),
    "aiCvRecommendations" TEXT,
    "aiInterviewRecommendations" TEXT,
    "aiSecondInterviewRecommendations" TEXT,
    "recommendationsGeneratedAt" TIMESTAMP(3),
    "companyNotes" TEXT,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "interviewScheduledAt" TIMESTAMP(3),
    "interviewedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicationNote" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" "NoteSource" NOT NULL DEFAULT 'USER',
    "userId" TEXT,

    CONSTRAINT "ApplicationNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "available_candidates" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "cvUrl" TEXT NOT NULL,
    "cvFileName" TEXT NOT NULL,
    "currentJobTitle" TEXT,
    "currentCompany" TEXT,
    "totalExperience" INTEGER NOT NULL DEFAULT 0,
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

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "type" "ReportType" NOT NULL,
    "category" "ReportCategory" NOT NULL,
    "format" "ReportFormat" NOT NULL DEFAULT 'PDF',
    "status" "ReportStatus" NOT NULL DEFAULT 'DRAFT',
    "scope" "ReportScope" NOT NULL DEFAULT 'COMPANY',
    "priority" "ReportPriority" NOT NULL DEFAULT 'MEDIUM',
    "query" TEXT,
    "dataSource" "ReportDataSource" NOT NULL DEFAULT 'MIXED',
    "filters" JSONB,
    "parameters" JSONB,
    "config" JSONB,
    "executionStatus" "ExecutionStatus" NOT NULL DEFAULT 'PENDING',
    "maxExecutionTime" INTEGER DEFAULT 600,
    "timeoutAt" TIMESTAMP(3),
    "data" JSONB,
    "fileUrl" TEXT,
    "fileName" VARCHAR(255),
    "fileSize" INTEGER,
    "fileMimeType" VARCHAR(100),
    "templateId" TEXT,
    "companyId" TEXT,
    "userId" TEXT,
    "generatedBy" TEXT,
    "generatedAt" TIMESTAMP(3),
    "executionTime" INTEGER,
    "recordCount" INTEGER,
    "expiresAt" TIMESTAMP(3),
    "autoDelete" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" TIMESTAMP(3),
    "tags" TEXT[],
    "version" VARCHAR(10) NOT NULL DEFAULT '1.0',
    "checksum" VARCHAR(64),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_templates" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "type" "ReportType" NOT NULL,
    "category" "ReportCategory" NOT NULL,
    "format" "ReportFormat" NOT NULL DEFAULT 'PDF',
    "scope" "ReportScope" NOT NULL DEFAULT 'COMPANY',
    "dataSource" "ReportDataSource" NOT NULL DEFAULT 'MIXED',
    "queryTemplate" TEXT NOT NULL,
    "defaultFilters" JSONB,
    "defaultParameters" JSONB,
    "config" JSONB,
    "isValidated" BOOLEAN NOT NULL DEFAULT false,
    "validatedAt" TIMESTAMP(3),
    "validationError" TEXT,
    "version" VARCHAR(10) NOT NULL DEFAULT '1.0',
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsed" TIMESTAMP(3),
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "companyId" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "report_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_metrics" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "metricName" TEXT NOT NULL,
    "metricValue" DOUBLE PRECISION NOT NULL,
    "metricType" TEXT NOT NULL,
    "dimension" TEXT,
    "period" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "report_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_schedules" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "frequency" "ScheduleFrequency" NOT NULL,
    "cronExpression" VARCHAR(100),
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "nextRun" TIMESTAMP(3),
    "lastRun" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPaused" BOOLEAN NOT NULL DEFAULT false,
    "timezone" VARCHAR(50) NOT NULL DEFAULT 'UTC',
    "recipients" TEXT[],
    "deliveryFormat" "ReportFormat" NOT NULL DEFAULT 'PDF',
    "emailSubject" VARCHAR(255),
    "emailBody" TEXT,
    "includeAttachment" BOOLEAN NOT NULL DEFAULT true,
    "maxExecutionTime" INTEGER DEFAULT 1800,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "consecutiveFailures" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "lastSuccessfulRun" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "report_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_shares" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "sharedWith" VARCHAR(255),
    "permission" "SharePermission" NOT NULL DEFAULT 'VIEW_ONLY',
    "accessToken" VARCHAR(64),
    "expiresAt" TIMESTAMP(3),
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "revokedAt" TIMESTAMP(3),
    "accessCount" INTEGER NOT NULL DEFAULT 0,
    "maxAccessCount" INTEGER,
    "lastAccessed" TIMESTAMP(3),
    "ipRestrictions" TEXT[],
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "requireLogin" BOOLEAN NOT NULL DEFAULT true,
    "allowDownload" BOOLEAN NOT NULL DEFAULT true,
    "watermark" VARCHAR(255),
    "sharedBy" TEXT NOT NULL,
    "shareNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "report_shares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_audit_logs" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "details" JSONB,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "userId" VARCHAR(30),
    "sessionId" VARCHAR(50),
    "ipAddress" VARCHAR(45),
    "userAgent" VARCHAR(500),
    "requestId" VARCHAR(50),
    "duration" INTEGER,
    "oldValues" JSONB,
    "newValues" JSONB,
    "riskLevel" VARCHAR(10) DEFAULT 'LOW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "report_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "security_logs_type_createdAt_idx" ON "security_logs"("type", "createdAt");

-- CreateIndex
CREATE INDEX "security_logs_severity_createdAt_idx" ON "security_logs"("severity", "createdAt");

-- CreateIndex
CREATE INDEX "security_logs_userId_createdAt_idx" ON "security_logs"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "LiveKitRoom_name_key" ON "LiveKitRoom"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_userType_idx" ON "users"("userType");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_token_idx" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE INDEX "notifications_userId_read_idx" ON "notifications"("userId", "read");

-- CreateIndex
CREATE INDEX "notifications_companyId_read_idx" ON "notifications"("companyId", "read");

-- CreateIndex
CREATE INDEX "notifications_category_timestamp_idx" ON "notifications"("category", "timestamp");

-- CreateIndex
CREATE INDEX "notifications_type_timestamp_idx" ON "notifications"("type", "timestamp");

-- CreateIndex
CREATE INDEX "notifications_userId_timestamp_idx" ON "notifications"("userId", "timestamp");

-- CreateIndex
CREATE INDEX "notifications_companyId_timestamp_idx" ON "notifications"("companyId", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "addresses_companyId_key" ON "addresses"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "invitations_code_key" ON "invitations"("code");

-- CreateIndex
CREATE INDEX "invitations_code_idx" ON "invitations"("code");

-- CreateIndex
CREATE INDEX "invitations_companyId_idx" ON "invitations"("companyId");

-- CreateIndex
CREATE INDEX "jobs_companyId_idx" ON "jobs"("companyId");

-- CreateIndex
CREATE INDEX "jobs_status_idx" ON "jobs"("status");

-- CreateIndex
CREATE INDEX "jobs_type_idx" ON "jobs"("type");

-- CreateIndex
CREATE INDEX "jobs_jobLevel_idx" ON "jobs"("jobLevel");

-- CreateIndex
CREATE INDEX "jobs_industry_idx" ON "jobs"("industry");

-- CreateIndex
CREATE INDEX "jobs_featured_idx" ON "jobs"("featured");

-- CreateIndex
CREATE INDEX "jobs_status_deadline_idx" ON "jobs"("status", "deadline");

-- CreateIndex
CREATE INDEX "jobs_featured_status_deadline_idx" ON "jobs"("featured", "status", "deadline");

-- CreateIndex
CREATE INDEX "jobs_createdAt_idx" ON "jobs"("createdAt");

-- CreateIndex
CREATE INDEX "jobs_title_idx" ON "jobs"("title");

-- CreateIndex
CREATE INDEX "jobs_description_idx" ON "jobs"("description");

-- CreateIndex
CREATE INDEX "jobs_location_idx" ON "jobs"("location");

-- CreateIndex
CREATE INDEX "jobs_department_idx" ON "jobs"("department");

-- CreateIndex
CREATE INDEX "jobs_skills_idx" ON "jobs"("skills");

-- CreateIndex
CREATE UNIQUE INDEX "candidate_profiles_email_key" ON "candidate_profiles"("email");

-- CreateIndex
CREATE UNIQUE INDEX "candidate_profiles_userId_key" ON "candidate_profiles"("userId");

-- CreateIndex
CREATE INDEX "candidate_profiles_email_idx" ON "candidate_profiles"("email");

-- CreateIndex
CREATE INDEX "candidate_profiles_experienceLevel_idx" ON "candidate_profiles"("experienceLevel");

-- CreateIndex
CREATE INDEX "candidate_profiles_isOpenToWork_idx" ON "candidate_profiles"("isOpenToWork");

-- CreateIndex
CREATE INDEX "candidate_profiles_currentLocation_idx" ON "candidate_profiles"("currentLocation");

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
CREATE INDEX "work_experiences_candidateId_idx" ON "work_experiences"("candidateId");

-- CreateIndex
CREATE INDEX "education_history_candidateId_idx" ON "education_history"("candidateId");

-- CreateIndex
CREATE INDEX "cvs_candidateId_idx" ON "cvs"("candidateId");

-- CreateIndex
CREATE INDEX "cvs_status_idx" ON "cvs"("status");

-- CreateIndex
CREATE INDEX "cvs_isActive_idx" ON "cvs"("isActive");

-- CreateIndex
CREATE INDEX "WhatsAppMessage_to_idx" ON "WhatsAppMessage"("to");

-- CreateIndex
CREATE INDEX "WhatsAppMessage_from_idx" ON "WhatsAppMessage"("from");

-- CreateIndex
CREATE INDEX "WhatsAppMessage_status_idx" ON "WhatsAppMessage"("status");

-- CreateIndex
CREATE INDEX "applications_jobId_idx" ON "applications"("jobId");

-- CreateIndex
CREATE INDEX "applications_candidateId_idx" ON "applications"("candidateId");

-- CreateIndex
CREATE INDEX "applications_status_idx" ON "applications"("status");

-- CreateIndex
CREATE INDEX "applications_jobId_status_idx" ON "applications"("jobId", "status");

-- CreateIndex
CREATE INDEX "applications_candidateId_status_idx" ON "applications"("candidateId", "status");

-- CreateIndex
CREATE INDEX "applications_appliedAt_idx" ON "applications"("appliedAt");

-- CreateIndex
CREATE UNIQUE INDEX "applications_jobId_candidateId_key" ON "applications"("jobId", "candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "available_candidates_email_key" ON "available_candidates"("email");

-- CreateIndex
CREATE INDEX "available_candidates_email_idx" ON "available_candidates"("email");

-- CreateIndex
CREATE INDEX "available_candidates_isActive_isOpenToWork_idx" ON "available_candidates"("isActive", "isOpenToWork");

-- CreateIndex
CREATE INDEX "available_candidates_currentJobTitle_idx" ON "available_candidates"("currentJobTitle");

-- CreateIndex
CREATE INDEX "available_candidates_totalExperience_idx" ON "available_candidates"("totalExperience");

-- CreateIndex
CREATE INDEX "available_candidates_createdAt_idx" ON "available_candidates"("createdAt");

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
CREATE INDEX "interviews_jobId_status_idx" ON "interviews"("jobId", "status");

-- CreateIndex
CREATE INDEX "interviews_candidateId_scheduledAt_idx" ON "interviews"("candidateId", "scheduledAt");

-- CreateIndex
CREATE INDEX "interviews_companyId_scheduledAt_idx" ON "interviews"("companyId", "scheduledAt");

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

-- CreateIndex
CREATE INDEX "communications_companyId_candidateId_idx" ON "communications"("companyId", "candidateId");

-- CreateIndex
CREATE INDEX "communications_companyId_type_idx" ON "communications"("companyId", "type");

-- CreateIndex
CREATE INDEX "communications_sentAt_idx" ON "communications"("sentAt");

-- CreateIndex
CREATE INDEX "communications_candidateId_sentAt_idx" ON "communications"("candidateId", "sentAt");

-- CreateIndex
CREATE INDEX "communications_companyId_sentAt_idx" ON "communications"("companyId", "sentAt");

-- CreateIndex
CREATE INDEX "reports_companyId_idx" ON "reports"("companyId");

-- CreateIndex
CREATE INDEX "reports_userId_idx" ON "reports"("userId");

-- CreateIndex
CREATE INDEX "reports_type_category_idx" ON "reports"("type", "category");

-- CreateIndex
CREATE INDEX "reports_status_idx" ON "reports"("status");

-- CreateIndex
CREATE INDEX "reports_executionStatus_idx" ON "reports"("executionStatus");

-- CreateIndex
CREATE INDEX "reports_dataSource_idx" ON "reports"("dataSource");

-- CreateIndex
CREATE INDEX "reports_createdAt_idx" ON "reports"("createdAt");

-- CreateIndex
CREATE INDEX "reports_templateId_idx" ON "reports"("templateId");

-- CreateIndex
CREATE INDEX "reports_expiresAt_idx" ON "reports"("expiresAt");

-- CreateIndex
CREATE INDEX "reports_isArchived_archivedAt_idx" ON "reports"("isArchived", "archivedAt");

-- CreateIndex
CREATE INDEX "reports_companyId_category_status_idx" ON "reports"("companyId", "category", "status");

-- CreateIndex
CREATE INDEX "reports_companyId_isPublic_isArchived_idx" ON "reports"("companyId", "isPublic", "isArchived");

-- CreateIndex
CREATE INDEX "reports_generatedAt_idx" ON "reports"("generatedAt");

-- CreateIndex
CREATE INDEX "reports_tags_idx" ON "reports"("tags");

-- CreateIndex
CREATE INDEX "reports_timeoutAt_idx" ON "reports"("timeoutAt");

-- CreateIndex
CREATE UNIQUE INDEX "reports_name_companyId_key" ON "reports"("name", "companyId");

-- CreateIndex
CREATE INDEX "report_templates_companyId_idx" ON "report_templates"("companyId");

-- CreateIndex
CREATE INDEX "report_templates_type_category_idx" ON "report_templates"("type", "category");

-- CreateIndex
CREATE INDEX "report_templates_dataSource_idx" ON "report_templates"("dataSource");

-- CreateIndex
CREATE INDEX "report_templates_isSystem_isActive_idx" ON "report_templates"("isSystem", "isActive");

-- CreateIndex
CREATE INDEX "report_templates_isValidated_idx" ON "report_templates"("isValidated");

-- CreateIndex
CREATE INDEX "report_templates_isPublic_isActive_idx" ON "report_templates"("isPublic", "isActive");

-- CreateIndex
CREATE INDEX "report_templates_createdBy_idx" ON "report_templates"("createdBy");

-- CreateIndex
CREATE INDEX "report_templates_usageCount_idx" ON "report_templates"("usageCount");

-- CreateIndex
CREATE INDEX "report_templates_lastUsed_idx" ON "report_templates"("lastUsed");

-- CreateIndex
CREATE UNIQUE INDEX "report_templates_name_companyId_key" ON "report_templates"("name", "companyId");

-- CreateIndex
CREATE UNIQUE INDEX "report_templates_name_isSystem_key" ON "report_templates"("name", "isSystem");

-- CreateIndex
CREATE INDEX "report_metrics_reportId_idx" ON "report_metrics"("reportId");

-- CreateIndex
CREATE INDEX "report_metrics_metricName_idx" ON "report_metrics"("metricName");

-- CreateIndex
CREATE INDEX "report_metrics_reportId_metricName_idx" ON "report_metrics"("reportId", "metricName");

-- CreateIndex
CREATE UNIQUE INDEX "report_schedules_reportId_key" ON "report_schedules"("reportId");

-- CreateIndex
CREATE INDEX "report_schedules_nextRun_idx" ON "report_schedules"("nextRun");

-- CreateIndex
CREATE INDEX "report_schedules_isActive_isPaused_idx" ON "report_schedules"("isActive", "isPaused");

-- CreateIndex
CREATE INDEX "report_schedules_frequency_idx" ON "report_schedules"("frequency");

-- CreateIndex
CREATE INDEX "report_schedules_lastRun_idx" ON "report_schedules"("lastRun");

-- CreateIndex
CREATE INDEX "report_schedules_consecutiveFailures_idx" ON "report_schedules"("consecutiveFailures");

-- CreateIndex
CREATE INDEX "report_schedules_isActive_nextRun_idx" ON "report_schedules"("isActive", "nextRun");

-- CreateIndex
CREATE INDEX "report_schedules_timezone_idx" ON "report_schedules"("timezone");

-- CreateIndex
CREATE UNIQUE INDEX "report_shares_accessToken_key" ON "report_shares"("accessToken");

-- CreateIndex
CREATE INDEX "report_shares_reportId_idx" ON "report_shares"("reportId");

-- CreateIndex
CREATE INDEX "report_shares_sharedWith_idx" ON "report_shares"("sharedWith");

-- CreateIndex
CREATE INDEX "report_shares_accessToken_idx" ON "report_shares"("accessToken");

-- CreateIndex
CREATE INDEX "report_shares_sharedBy_idx" ON "report_shares"("sharedBy");

-- CreateIndex
CREATE INDEX "report_shares_expiresAt_idx" ON "report_shares"("expiresAt");

-- CreateIndex
CREATE INDEX "report_shares_isRevoked_idx" ON "report_shares"("isRevoked");

-- CreateIndex
CREATE INDEX "report_shares_isPublic_isRevoked_idx" ON "report_shares"("isPublic", "isRevoked");

-- CreateIndex
CREATE INDEX "report_shares_reportId_isRevoked_idx" ON "report_shares"("reportId", "isRevoked");

-- CreateIndex
CREATE UNIQUE INDEX "report_shares_reportId_sharedWith_key" ON "report_shares"("reportId", "sharedWith");

-- CreateIndex
CREATE INDEX "report_audit_logs_reportId_idx" ON "report_audit_logs"("reportId");

-- CreateIndex
CREATE INDEX "report_audit_logs_userId_idx" ON "report_audit_logs"("userId");

-- CreateIndex
CREATE INDEX "report_audit_logs_action_idx" ON "report_audit_logs"("action");

-- CreateIndex
CREATE INDEX "report_audit_logs_success_idx" ON "report_audit_logs"("success");

-- CreateIndex
CREATE INDEX "report_audit_logs_createdAt_idx" ON "report_audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "report_audit_logs_riskLevel_idx" ON "report_audit_logs"("riskLevel");

-- CreateIndex
CREATE INDEX "report_audit_logs_sessionId_idx" ON "report_audit_logs"("sessionId");

-- CreateIndex
CREATE INDEX "report_audit_logs_reportId_action_idx" ON "report_audit_logs"("reportId", "action");

-- CreateIndex
CREATE INDEX "report_audit_logs_userId_createdAt_idx" ON "report_audit_logs"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "report_audit_logs_action_createdAt_idx" ON "report_audit_logs"("action", "createdAt");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_profiles" ADD CONSTRAINT "candidate_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_experiences" ADD CONSTRAINT "work_experiences_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "education_history" ADD CONSTRAINT "education_history_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cvs" ADD CONSTRAINT "cvs_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationNote" ADD CONSTRAINT "ApplicationNote_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationNote" ADD CONSTRAINT "ApplicationNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transcripts" ADD CONSTRAINT "transcripts_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "interviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "communications" ADD CONSTRAINT "communications_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "communications" ADD CONSTRAINT "communications_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "communications" ADD CONSTRAINT "communications_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "report_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_templates" ADD CONSTRAINT "report_templates_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_templates" ADD CONSTRAINT "report_templates_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_metrics" ADD CONSTRAINT "report_metrics_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_schedules" ADD CONSTRAINT "report_schedules_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_shares" ADD CONSTRAINT "report_shares_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_shares" ADD CONSTRAINT "report_shares_sharedBy_fkey" FOREIGN KEY ("sharedBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
