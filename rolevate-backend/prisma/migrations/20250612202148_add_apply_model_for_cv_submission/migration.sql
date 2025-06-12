-- CreateTable
CREATE TABLE "Apply" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "jobPostId" TEXT NOT NULL,
    "cvUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Apply_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Apply" ADD CONSTRAINT "Apply_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Apply" ADD CONSTRAINT "Apply_jobPostId_fkey" FOREIGN KEY ("jobPostId") REFERENCES "job_posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
