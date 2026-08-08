-- Convert order prices from rupees (float) to paise (int)
ALTER TABLE "order" ALTER COLUMN "price" SET DATA TYPE INTEGER USING ROUND(price * 100)::INTEGER;
