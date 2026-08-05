/*
  Warnings:

  - The values [Yes,No] on the enum `Side` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('BUY', 'SELL');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'FULFILLED', 'CANCELLED');

-- AlterEnum
BEGIN;
CREATE TYPE "Side_new" AS ENUM ('YES', 'NO');
ALTER TABLE "market" ALTER COLUMN "outcome" TYPE "Side_new" USING (
  CASE "outcome"::text
    WHEN 'Yes' THEN 'YES'::"Side_new"
    WHEN 'No' THEN 'NO'::"Side_new"
    ELSE NULL
  END
);
ALTER TABLE "stockBalance" ALTER COLUMN "side" TYPE "Side_new" USING (
  CASE "side"::text
    WHEN 'Yes' THEN 'YES'::"Side_new"
    WHEN 'No' THEN 'NO'::"Side_new"
  END
);
ALTER TYPE "Side" RENAME TO "Side_old";
ALTER TYPE "Side_new" RENAME TO "Side";
DROP TYPE "public"."Side_old";
COMMIT;

-- CreateTable
CREATE TABLE "order" (
    "id" TEXT NOT NULL,
    "side" "Side" NOT NULL,
    "price" INTEGER NOT NULL,
    "type" "OrderType" NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "marketId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "order_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "market"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
