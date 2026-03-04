/*
  Warnings:

  - Made the column `propertyType2` on table `Property` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Property" ALTER COLUMN "propertyType2" SET NOT NULL,
ALTER COLUMN "propertyType2" SET DEFAULT '';
