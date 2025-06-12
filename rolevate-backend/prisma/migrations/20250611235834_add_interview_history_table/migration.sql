-- CreateTable
CREATE TABLE "interview_history" (
    "id" SERIAL NOT NULL,
    "user_id" VARCHAR(64),
    "question" TEXT,
    "answer" TEXT,
    "language" VARCHAR(8),
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interview_history_pkey" PRIMARY KEY ("id")
);
