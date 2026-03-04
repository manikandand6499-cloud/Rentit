-- CreateTable
CREATE TABLE "Property" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "city" TEXT NOT NULL,
    "propertyType" TEXT NOT NULL,
    "propertyType2" TEXT NOT NULL,
    "propertyName" TEXT,
    "category" TEXT,
    "floor" INTEGER,
    "totalFloor" INTEGER,
    "description" TEXT,
    "ownershipType" TEXT,
    "builtUpArea" DOUBLE PRECISION,
    "propertyAge" TEXT,
    "facing" TEXT,
    "noticePeriod" INTEGER,
    "occupancy" TEXT,
    "availableFrom" TIMESTAMP(3),
    "location" TEXT,
    "street" TEXT,
    "locality" TEXT,
    "landmark" TEXT,
    "pincode" TEXT,
    "parking" TEXT,
    "gateSecurity" BOOLEAN,
    "furnishing" TEXT,
    "rent" DOUBLE PRECISION,
    "maintenance" DOUBLE PRECISION,
    "deposit" DOUBLE PRECISION,
    "rentNegotiable" BOOLEAN,
    "currentStep" INTEGER NOT NULL DEFAULT 1,
    "isDraft" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
