/*
  Warnings:

  - Added the required column `role` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "MarketStatus" AS ENUM ('ACTIVE', 'CLOSED', 'CANCELLED', 'RESOLVED');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "role" "Role" NOT NULL;

-- CreateTable
CREATE TABLE "category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "market" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sourceOfTruth" TEXT NOT NULL,
    "status" "MarketStatus" NOT NULL DEFAULT 'ACTIVE',
    "endAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "market_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CategoryToMarket" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CategoryToMarket_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CategoryToMarket_B_index" ON "_CategoryToMarket"("B");

-- AddForeignKey
ALTER TABLE "_CategoryToMarket" ADD CONSTRAINT "_CategoryToMarket_A_fkey" FOREIGN KEY ("A") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToMarket" ADD CONSTRAINT "_CategoryToMarket_B_fkey" FOREIGN KEY ("B") REFERENCES "market"("id") ON DELETE CASCADE ON UPDATE CASCADE;
