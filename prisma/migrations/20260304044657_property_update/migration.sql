/*
  Warnings:

  - Made the column `userId` on table `Property` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Property" DROP CONSTRAINT "Property_userId_fkey";

-- AlterTable
ALTER TABLE "Property" ALTER COLUMN "userId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
