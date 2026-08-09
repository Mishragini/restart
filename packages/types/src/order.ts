import z from "zod";
import { Side } from "./market";

export const OrderType = {
    BUY: "BUY",
    SELL: "SELL",
} as const
export type OrderType = (typeof OrderType)[keyof typeof OrderType]

export const OrderStatus = {
    PENDING: "PENDING",
    PARTIALLY_FULFILLED: "PARTIALLY_FULFILLED",
    FULFILLED: "FULFILLED",
    CANCELLED: "CANCELLED",
} as const
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus]

/** Mirrors the Prisma Order model — kept here so web can build without @repo/db. */
export type Order = {
    id: string
    side: Side
    price: number
    quantity: number
    filledQuantity: number
    type: OrderType
    status: OrderStatus
    marketId: string
    userId: string
    createdAt: Date | string
    updatedAt: Date | string
}

export const PlaceOrderSchema = z.object({
    price: z.number()
        .min(5, "Price must be at least ₹5")
        .max(9.5, "Price must be at most ₹9.5")
        .refine(
            (n) => Math.abs(n * 100 - Math.round(n * 100)) < 1e-8,
            "Price can have at most 2 decimal places",
        ),
    marketId: z.string().min(1, "MarketId is required"),
    quantity: z.number().int("Quantity must be a whole number").min(1, "Quantity must be at least one"),
    type: z.enum(OrderType),
    side: z.enum(Side)
})

export type PlaceOrderInput = z.infer<typeof PlaceOrderSchema>

export const getOrderbookSchema = z.object({
    marketId: z.string().min(1, "MarketId is required.")
})

export type getOrderbookInput = z.infer<typeof getOrderbookSchema>

export const getTradesSchema = getOrderbookSchema
export type getTradesInput = getOrderbookInput

export const GetUserOrdersSchema = z.object({
    marketId: z.string().min(1, "MarketId is required."),
    status: z.enum(OrderStatus).optional(),
})

export type GetUserOrdersInput = z.infer<typeof GetUserOrdersSchema>
export type GetUserOrdersRes = Order[]