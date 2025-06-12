/*
  Warnings:

  - You are about to drop the column `isTwoFactorEnabled` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `twoFactorSecret` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "isTwoFactorEnabled",
DROP COLUMN "twoFactorSecret";
