-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "hoverImagePublicId" TEXT,
ADD COLUMN     "hoverImageVersion" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "contactName" TEXT,
ADD COLUMN     "contactPhone" TEXT,
ADD COLUMN     "contactEmail" TEXT;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "contactEmail" TEXT;
