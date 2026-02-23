/*
  Warnings:

  - The values [COMPLETED] on the enum `OrderStatus` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `subtotal` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "OrderStatus_new" AS ENUM ('PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED', 'FAILED');
ALTER TABLE "public"."Order" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Order" ALTER COLUMN "status" TYPE "OrderStatus_new" USING ("status"::text::"OrderStatus_new");
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "public"."OrderStatus_old";
ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "ShippingAddress" TEXT,
ADD COLUMN     "ShippingCity" TEXT,
ADD COLUMN     "ShippingContactNumber" TEXT,
ADD COLUMN     "ShippingCountry" TEXT,
ADD COLUMN     "ShippingDistrict" TEXT,
ADD COLUMN     "ShippingEmail" TEXT,
ADD COLUMN     "ShippingState" TEXT,
ADD COLUMN     "ShippingfirstName" TEXT,
ADD COLUMN     "ShippinglastName" TEXT,
ADD COLUMN     "deliveredAt" TIMESTAMP(3),
ADD COLUMN     "discount" DECIMAL(10,2),
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "paymentIntentId" TEXT,
ADD COLUMN     "paymentMethod" TEXT,
ADD COLUMN     "shippedAt" TIMESTAMP(3),
ADD COLUMN     "shipping" DECIMAL(10,2),
ADD COLUMN     "subtotal" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "tax" DECIMAL(10,2),
ADD COLUMN     "trackingCarrier" TEXT,
ADD COLUMN     "trackingNumber" TEXT,
ADD COLUMN     "trackingUrl" TEXT;
