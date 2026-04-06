/*
  Warnings:

  - The `placeisavailablefor` column on the `Property` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "foodType" JSONB,
ADD COLUMN     "roomAmenities" JSONB,
ALTER COLUMN "gender" SET DATA TYPE TEXT,
DROP COLUMN "placeisavailablefor",
ADD COLUMN     "placeisavailablefor" JSONB;
