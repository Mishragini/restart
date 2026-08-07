import { Router } from "express";
import { prisma } from "@repo/db";
import { type AuthenticatedRequest, authMiddleware, validate } from "../lib/middleware";
import {
    GetUserOrdersSchema,
    getOrderbookSchema,
    PlaceOrderSchema,
    type GetUserOrdersInput,
    type getOrderbookInput,
    type PlaceOrderInput,
} from "@repo/types/order";
import { RedisManager } from "../lib/redisManager";

export const orderRouter: Router = Router()

orderRouter.get("/", authMiddleware, validate(getOrderbookSchema, "query"), async (req: AuthenticatedRequest, res) => {
    try {
        const { marketId } = req.validatedData as getOrderbookInput
        const { id: userId } = req.user!
        const engine_response = await RedisManager.getInstance().sendAndAwait(userId, "get_orderbook", { marketId })
        if ("error" in engine_response) {
            throw new Error(engine_response.error)
        }
        res.json({ message: engine_response.message, data: engine_response.data })
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

        res.status(200).json({ data: orders })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Something went wrong :(. Please try again later" })
    }
})

orderRouter.post("/place-order", authMiddleware, validate(PlaceOrderSchema), async (req: AuthenticatedRequest, res) => {
    try {
        const data = req.validatedData as PlaceOrderInput
        const { id: userId } = req.user!
        // add req to queue and await the response from the engine via pub sub 
        const response = await RedisManager.getInstance().sendAndAwait(userId, "place_order", data)
        if ('error' in response) {
            throw new Error(response.error)
        }
        res.json(response)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Something went wrong :(. Please try again later" })
    }

})