import z from "zod";
import { Side } from "./market";

export const PlaceOrderSchema = z.object({
    price: z.number()
        .min(5, "Amount must be at least ₹5")
        .refine(
            (n) => Math.abs(n * 100 - Math.round(n * 100)) < 1e-8,
            "Amount can have at most 2 decimal places",
        ),
    marketId: z.string().min(1, "MarketId is required"),
    quantity: z.number().min(1, "Quantity be at least be one"),
    side: z.enum(Side)
})

export type PlaceOrderInput = z.infer<typeof PlaceOrderSchema>