-- CreateTable
CREATE TABLE "trade" (
    "id" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "marketId" TEXT NOT NULL,
    "buyOrderId" TEXT NOT NULL,
    "sellOrderId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "trade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "trade_marketId_idx" ON "trade"("marketId");

-- AddForeignKey
ALTER TABLE "trade" ADD CONSTRAINT "trade_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "market"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trade" ADD CONSTRAINT "trade_buyOrderId_fkey" FOREIGN KEY ("buyOrderId") REFERENCES "order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trade" ADD CONSTRAINT "trade_sellOrderId_fkey" FOREIGN KEY ("sellOrderId") REFERENCES "order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
