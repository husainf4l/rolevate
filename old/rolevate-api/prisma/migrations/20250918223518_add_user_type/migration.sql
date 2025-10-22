-- CreateEnum
CREATE TYPE "public"."UserType" AS ENUM ('CANDIDATE', 'BUSINESS');

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "userType" "public"."UserType" NOT NULL DEFAULT 'CANDIDATE';
