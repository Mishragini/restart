-- CreateEnum
CREATE TYPE "Side" AS ENUM ('Yes', 'No');

-- AlterTable
ALTER TABLE "market" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateTable
CREATE TABLE "stockBalance" (
    "id" TEXT NOT NULL,
    "side" "Side" NOT NULL,
    "available" INTEGER NOT NULL DEFAULT 0,
    "locked" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,

    CONSTRAINT "stockBalance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "stockBalance_userId_marketId_side_key" ON "stockBalance"("userId", "marketId", "side");

-- AddForeignKey
ALTER TABLE "stockBalance" ADD CONSTRAINT "stockBalance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stockBalance" ADD CONSTRAINT "stockBalance_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "market"("id") ON DELETE CASCADE ON UPDATE CASCADE;
