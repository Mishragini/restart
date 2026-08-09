import { Router } from "express";
import { MarketStatus, prisma } from "@repo/db";
import { type AuthenticatedRequest, authMiddleware, validate } from "../lib/middleware";
import {
    GetUserOrdersSchema,
    getOrderbookSchema,
    getTradesSchema,
    PlaceOrderSchema,
    type GetUserOrdersInput,
    type getOrderbookInput,
    type getTradesInput,
    type PlaceOrderInput,
} from "@repo/types/order";
import { RedisManager } from "../lib/redisManager";
import { orderbookInRupees, placeOrderResInRupees, toPaise, toRupees, tradesInRupees } from "../lib/utils";

export const orderRouter: Router = Router()

orderRouter.get("/", authMiddleware, validate(getOrderbookSchema, "query"), async (req: AuthenticatedRequest, res) => {
    try {
        const { marketId } = req.validatedData as getOrderbookInput
        const { id: userId } = req.user!
        const engine_response = await RedisManager.getInstance().sendAndAwait(userId, "get_orderbook", { marketId })
        if ("error" in engine_response) {
            throw new Error(engine_response.error)
        }
        if (engine_response.type !== "get_orderbook") {
            throw new Error("Unexpected engine response")
        }
        res.json({
            message: engine_response.message,
            data: orderbookInRupees(engine_response.data),
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Something went wrong :(. Please try again later" })
    }
})

orderRouter.get("/trades", authMiddleware, validate(getTradesSchema, "query"), async (req: AuthenticatedRequest, res) => {
    try {
        const { marketId } = req.validatedData as getTradesInput
        const { id: userId } = req.user!
        const engine_response = await RedisManager.getInstance().sendAndAwait(userId, "get_trades", { marketId })
        if ("error" in engine_response) {
            throw new Error(engine_response.error)
        }
        if (engine_response.type !== "get_trades") {
            throw new Error("Unexpected engine response")
        }
        res.json({
            message: engine_response.message,
            data: tradesInRupees(engine_response.data),
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Something went wrong :(. Please try again later" })
    }
})

orderRouter.get("/user", authMiddleware, validate(GetUserOrdersSchema, "query"), async (req: AuthenticatedRequest, res) => {
    try {
        const { marketId, status } = req.validatedData as GetUserOrdersInput
        const { id: userId } = req.user!

        const orders = await prisma.order.findMany({
            where: {
                userId,
                marketId,
                ...(status && { status }),
            },
            orderBy: { createdAt: "desc" },
        })

        res.status(200).json({
            data: orders.map((o) => ({ ...o, price: toRupees(o.price) })),
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Something went wrong :(. Please try again later" })
    }
})

orderRouter.post("/place-order", authMiddleware, validate(PlaceOrderSchema), async (req: AuthenticatedRequest, res) => {
    try {
        const input = req.validatedData as PlaceOrderInput
        const { id: userId } = req.user!

        // Engine has no market metadata — gate closed/resolved markets here.
        const market = await prisma.market.findUnique({
            where: { id: input.marketId },
            select: { status: true },
        })
        if (!market) {
            res.status(404).json({ error: "Market not found" })
            return
        }
        if (market.status !== MarketStatus.ACTIVE) {
            res.status(400).json({ error: "Market is not open for trading" })
            return
        }

        const data = { ...input, price: toPaise(input.price) }
        const response = await RedisManager.getInstance().sendAndAwait(userId, "place_order", data)
        if ('error' in response) {
            res.status(400).json({ error: response.error })
            return
        }
        if (response.type !== "place_order") {
            throw new Error("Unexpected engine response")
        }
        res.json({
            ...response,
            data: placeOrderResInRupees(response.data),
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Something went wrong :(. Please try again later" })
    }

})
