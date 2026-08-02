/*
  Warnings:

  - You are about to drop the column `endAt` on the `market` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `category` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `createdById` to the `market` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endsAt` to the `market` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "category" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "market" DROP COLUMN "endAt",
ADD COLUMN     "createdById" TEXT NOT NULL,
ADD COLUMN     "endsAt" TIMESTAMPTZ(3) NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "category_name_key" ON "category"("name");

-- AddForeignKey
ALTER TABLE "market" ADD CONSTRAINT "market_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
