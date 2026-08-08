-- DropForeignKey
ALTER TABLE "trade" DROP CONSTRAINT "trade_buyOrderId_fkey";

-- DropForeignKey
ALTER TABLE "trade" DROP CONSTRAINT "trade_marketId_fkey";

-- DropForeignKey
ALTER TABLE "trade" DROP CONSTRAINT "trade_sellOrderId_fkey";

-- AddForeignKey
ALTER TABLE "trade" ADD CONSTRAINT "trade_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "market"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trade" ADD CONSTRAINT "trade_buyOrderId_fkey" FOREIGN KEY ("buyOrderId") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trade" ADD CONSTRAINT "trade_sellOrderId_fkey" FOREIGN KEY ("sellOrderId") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
