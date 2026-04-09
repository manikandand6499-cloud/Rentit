-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "mobile" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT,
    "isProfileComplete" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "planType" TEXT NOT NULL,
    "planDuration" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "paymentId" TEXT NOT NULL,
    "propertyType" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Otp" (
    "id" SERIAL NOT NULL,
    "mobile" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Otp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Like" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "propertyId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Like_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Visit" (
    "id" SERIAL NOT NULL,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "language" TEXT NOT NULL DEFAULT 'en',
    "userId" INTEGER NOT NULL,
    "propertyId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Visit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Property" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "city" TEXT NOT NULL,
    "propertyType" TEXT NOT NULL,
    "propertyType2" TEXT NOT NULL DEFAULT '',
    "propertyName" TEXT,
    "category" TEXT,
    "floor" INTEGER,
    "totalFloor" INTEGER,
    "description" TEXT,
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
    "gateSecurity" BOOLEAN,
    "rent" DOUBLE PRECISION,
    "deposit" DOUBLE PRECISION,
    "rentType" TEXT,
    "rentNegotiable" BOOLEAN,
    "currentStep" INTEGER NOT NULL DEFAULT 1,
    "isDraft" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "video" TEXT,
    "bhkType" TEXT,
    "contactName" TEXT,
    "foodIncluded" BOOLEAN,
    "gatedCommunity" BOOLEAN,
    "mobileNo" TEXT,
    "noOfBalcony" TEXT,
    "noOfFloors" TEXT,
    "nonVegAllowed" BOOLEAN,
    "petAllowed" BOOLEAN,
    "repliesWithin" TEXT,
    "restrictions" JSONB,
    "roomType" JSONB,
    "rulesAndRegulation" TEXT,
    "sharingType" JSONB,
    "societyAmenities" JSONB,
    "parking" JSONB,
    "furnishing" JSONB,
    "whatsapp" BOOLEAN,
    "preferredTenant" JSONB,
    "ownershipType" JSONB,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "deletedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "GymAllowed" BOOLEAN,
    "IdealFor" JSONB,
    "SecondmobileNo" TEXT,
    "Washroom" JSONB,
    "addOthertags" TEXT,
    "availabilityDay" JSONB,
    "availableAllDay" BOOLEAN,
    "bathroom" TEXT,
    "closingTime" TIMESTAMP(3),
    "commonTV" BOOLEAN,
    "cookingAllowed" BOOLEAN,
    "depositNegotiable" BOOLEAN,
    "drinking" BOOLEAN,
    "expectedRent" DOUBLE PRECISION,
    "feedback" TEXT,
    "flatParking" JSONB,
    "gateClosingTime" TIMESTAMP(3),
    "gender" TEXT,
    "guardiansStay" BOOLEAN,
    "isBusinessRunning" JSONB,
    "laundry" JSONB,
    "leaseDuration" TEXT,
    "lift" JSONB,
    "maintenanceAmount" TEXT,
    "maintenanceExtra" BOOLEAN,
    "mess" BOOLEAN,
    "monthlyMaintenance" JSONB,
    "noOfAvailableSlots" TEXT,
    "otherFeatures" JSONB,
    "parkingType" JSONB,
    "pgAmenities" JSONB,
    "powerBackup" BOOLEAN,
    "preferredGuests" BOOLEAN,
    "propertyCondition" JSONB,
    "propertyDescription" TEXT,
    "propertyavailablefor" JSONB,
    "propertycleaned" BOOLEAN,
    "propertypainted" BOOLEAN,
    "refrigerator" BOOLEAN,
    "roomCleaning" JSONB,
    "setDirection" TEXT,
    "shownBy" TEXT,
    "smoking" BOOLEAN,
    "startTime" TEXT,
    "endTime" TEXT,
    "suitableFor" TEXT[],
    "unitsPropertiesavailaible" JSONB,
    "warden" JSONB,
    "waterStorageFacility" BOOLEAN,
    "waterSupply" JSONB,
    "whatsappupdates" BOOLEAN,
    "wifi" BOOLEAN,
    "foodType" JSONB,
    "roomAmenities" JSONB,
    "placeisavailablefor" JSONB,
    "buildingType" TEXT,
    "lockinPeriod" TEXT,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_mobile_key" ON "User"("mobile");

-- CreateIndex
CREATE UNIQUE INDEX "Like_userId_propertyId_key" ON "Like"("userId", "propertyId");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
