/*
  Warnings:

  - You are about to drop the column `planExpiry` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `planType` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "planExpiry",
DROP COLUMN "planType";

-- CreateTable
CREATE TABLE "subscription" (
    "id" SERIAL NOT NULL,
    "planType" TEXT,
    "planDuration" TEXT,
    "amount" INTEGER NOT NULL,
    "paymentid" TEXT,
    "startDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "isActive" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscription_pkey" PRIMARY KEY ("id")
);
