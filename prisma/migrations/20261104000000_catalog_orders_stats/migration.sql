-- CreateEnum
CREATE TYPE "CatalogSyncStatus" AS ENUM ('NOT_SYNCED', 'PENDING', 'SYNCED', 'ERROR');

-- AlterTable Category
ALTER TABLE "Category"
ADD COLUMN "description" TEXT NOT NULL DEFAULT '',
ADD COLUMN "imagePublicId" TEXT,
ADD COLUMN "imageVersion" INTEGER,
ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "metaProductSetId" TEXT;

-- AlterTable Product
ALTER TABLE "Product"
ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "retailerId" TEXT,
ADD COLUMN "metaProductId" TEXT,
ADD COLUMN "metaSyncStatus" "CatalogSyncStatus" NOT NULL DEFAULT 'NOT_SYNCED',
ADD COLUMN "metaSyncedAt" TIMESTAMP(3),
ADD COLUMN "metaSyncError" TEXT;

CREATE UNIQUE INDEX "Product_retailerId_key" ON "Product"("retailerId");
CREATE INDEX "Product_categoryId_active_idx" ON "Product"("categoryId", "active");

-- AlterTable ProductImage: replace url with Cloudinary fields
ALTER TABLE "ProductImage"
ADD COLUMN "publicId" TEXT,
ADD COLUMN "version" INTEGER,
ADD COLUMN "width" INTEGER,
ADD COLUMN "height" INTEGER,
ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "alt" TEXT;

-- Existing rows (if any) get placeholders; drop old url
UPDATE "ProductImage"
SET
  "publicId" = COALESCE("publicId", 'manjares/legacy/' || "id"::text),
  "version" = COALESCE("version", 1),
  "width" = COALESCE("width", 1),
  "height" = COALESCE("height", 1);

ALTER TABLE "ProductImage"
ALTER COLUMN "publicId" SET NOT NULL,
ALTER COLUMN "version" SET NOT NULL,
ALTER COLUMN "width" SET NOT NULL,
ALTER COLUMN "height" SET NOT NULL;

ALTER TABLE "ProductImage" DROP COLUMN "url";

CREATE INDEX "ProductImage_productId_sortOrder_idx" ON "ProductImage"("productId", "sortOrder");

-- AlterTable Order
ALTER TABLE "Order"
ADD COLUMN "discountAmount" DECIMAL(12,2),
ADD COLUMN "discountReason" TEXT,
ADD COLUMN "totalOverride" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "confirmedAt" TIMESTAMP(3),
ADD COLUMN "adminNotifiedAt" TIMESTAMP(3);

CREATE INDEX "Order_confirmedAt_idx" ON "Order"("confirmedAt");

-- Backfill confirmedAt for already-confirmed orders
UPDATE "Order"
SET "confirmedAt" = "updatedAt"
WHERE "status" NOT IN ('PENDIENTE_CONFIRMACION', 'CANCELADO')
  AND "confirmedAt" IS NULL;

-- AlterTable OrderItem: category snapshot
ALTER TABLE "OrderItem"
ADD COLUMN "categoryId" TEXT,
ADD COLUMN "categoryName" TEXT;

CREATE INDEX "OrderItem_productId_idx" ON "OrderItem"("productId");
CREATE INDEX "OrderItem_categoryId_idx" ON "OrderItem"("categoryId");

-- Backfill category snapshot from current product → category
UPDATE "OrderItem" AS oi
SET
  "categoryId" = p."categoryId",
  "categoryName" = c."name"
FROM "Product" AS p
JOIN "Category" AS c ON c."id" = p."categoryId"
WHERE oi."productId" = p."id"
  AND oi."categoryId" IS NULL;

-- CreateTable OrderChangeLog
CREATE TABLE "OrderChangeLog" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "adminEmail" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "before" JSONB NOT NULL,
    "after" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderChangeLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "OrderChangeLog_orderId_createdAt_idx" ON "OrderChangeLog"("orderId", "createdAt");

ALTER TABLE "OrderChangeLog" ADD CONSTRAINT "OrderChangeLog_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
