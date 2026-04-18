/*
  Warnings:

  - You are about to drop the column `deposit` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `depositNegotiable` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `drinking` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `guardiansStay` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `laundry` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `noOfBeds` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `noOfRooms` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `nonVegAllowed` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `powerBackup` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `rent` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `rentNegotiable` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `roomCleaning` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `sharingType` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `smoking` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `wifi` on the `Property` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Property" DROP COLUMN "deposit",
DROP COLUMN "depositNegotiable",
DROP COLUMN "drinking",
DROP COLUMN "gender",
DROP COLUMN "guardiansStay",
DROP COLUMN "laundry",
DROP COLUMN "noOfBeds",
DROP COLUMN "noOfRooms",
DROP COLUMN "nonVegAllowed",
DROP COLUMN "powerBackup",
DROP COLUMN "rent",
DROP COLUMN "rentNegotiable",
DROP COLUMN "roomCleaning",
DROP COLUMN "sharingType",
DROP COLUMN "smoking",
DROP COLUMN "wifi",
ADD COLUMN     "parking" TEXT;

-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "senderId" INTEGER NOT NULL,
    "receiverId" INTEGER NOT NULL,
    "propertyId" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
