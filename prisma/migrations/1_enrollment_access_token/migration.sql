-- AlterTable
ALTER TABLE "Enrollment" ADD COLUMN "accessToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_accessToken_key" ON "Enrollment"("accessToken");
