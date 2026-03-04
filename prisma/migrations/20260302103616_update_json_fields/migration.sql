/*
  Warnings:

  - The `parking` column on the `Property` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `furnishing` column on the `Property` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "bhkType" TEXT,
ADD COLUMN     "contactName" TEXT,
ADD COLUMN     "foodIncluded" BOOLEAN,
ADD COLUMN     "gatedCommunity" BOOLEAN,
ADD COLUMN     "mobileNo" TEXT,
ADD COLUMN     "noOfBalcony" TEXT,
ADD COLUMN     "noOfFloors" TEXT,
ADD COLUMN     "nonVegAllowed" BOOLEAN,
ADD COLUMN     "petAllowed" BOOLEAN,
ADD COLUMN     "preferredTenant" TEXT,
ADD COLUMN     "repliesWithin" TEXT,
ADD COLUMN     "restrictions" JSONB,
ADD COLUMN     "roomType" JSONB,
ADD COLUMN     "rulesAndRegulation" TEXT,
ADD COLUMN     "sharingType" JSONB,
ADD COLUMN     "societyAmenities" JSONB,
DROP COLUMN "parking",
ADD COLUMN     "parking" JSONB,
DROP COLUMN "furnishing",
ADD COLUMN     "furnishing" JSONB;
