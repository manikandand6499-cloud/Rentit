/*
  Warnings:

  - The `preferredTenant` column on the `Property` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Property" ALTER COLUMN "propertyType2" DROP NOT NULL,
DROP COLUMN "preferredTenant",
ADD COLUMN     "preferredTenant" JSONB;
