/*
  Warnings:

  - You are about to drop the column `LockinPeriod` on the `Property` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Property" DROP COLUMN "LockinPeriod",
ADD COLUMN     "buildingType" TEXT,
ADD COLUMN     "lockinPeriod" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "planExpiry" TIMESTAMP(3),
ADD COLUMN     "planType" TEXT;
