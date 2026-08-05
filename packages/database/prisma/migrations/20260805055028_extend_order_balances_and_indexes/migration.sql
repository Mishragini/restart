/*
  Warnings:

  - Added the required column `updatedAt` to the `inrBalance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `stockBalance` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'PARTIALLY_FULFILLED';

-- AlterTable
ALTER TABLE "inrBalance" ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMPTZ(3) NOT NULL;

-- AlterTable
ALTER TABLE "order" ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "filledQuantity" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "quantity" INTEGER NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMPTZ(3) NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "stockBalance" ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMPTZ(3) NOT NULL;

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'USER';

-- CreateIndex
CREATE INDEX "order_marketId_idx" ON "order"("marketId");

-- CreateIndex
CREATE INDEX "order_userId_idx" ON "order"("userId");

-- CreateIndex
CREATE INDEX "stockBalance_marketId_idx" ON "stockBalance"("marketId");
