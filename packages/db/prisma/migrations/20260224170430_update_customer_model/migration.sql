-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "averageSpent" DECIMAL(10,2),
ADD COLUMN     "lastOrderAt" TIMESTAMP(3);
