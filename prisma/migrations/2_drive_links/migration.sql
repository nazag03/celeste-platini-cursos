-- DropIndex
DROP INDEX "Enrollment_accessToken_key";

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "driveUrl" TEXT;

-- AlterTable
ALTER TABLE "Enrollment" DROP COLUMN "accessToken";

-- AlterTable
ALTER TABLE "DigitalProduct" ADD COLUMN     "driveUrl" TEXT;

-- CreateTable
CREATE TABLE "AccessLink" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "mpOrderId" TEXT,
    "enrollmentId" TEXT,
    "purchaseId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccessLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AccessLink_token_key" ON "AccessLink"("token");

-- CreateIndex
CREATE UNIQUE INDEX "AccessLink_mpOrderId_key" ON "AccessLink"("mpOrderId");

-- AddForeignKey
ALTER TABLE "AccessLink" ADD CONSTRAINT "AccessLink_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessLink" ADD CONSTRAINT "AccessLink_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

