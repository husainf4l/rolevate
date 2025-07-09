-- CreateEnum
CREATE TYPE "SubscriptionType" AS ENUM ('FREE', 'PRO', 'ENTERPRISE');

-- AlterTable
ALTER TABLE "companies" ADD COLUMN     "subscription" "SubscriptionType" NOT NULL DEFAULT 'FREE';
