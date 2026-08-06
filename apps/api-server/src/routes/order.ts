import { Router } from "express";
import { type AuthenticatedRequest, authMiddleware, validate } from "../lib/middleware";
import { type PlaceOrderInput, PlaceOrderSchema } from "@repo/types/order";
import { RedisManager } from "../lib/redisManager";

export const orderRouter: Router = Router()

orderRouter.post("/place-order", authMiddleware, validate(PlaceOrderSchema), async (req: AuthenticatedRequest, res) => {
    try {
        const data = req.validatedData as PlaceOrderInput
        const { id: userId } = req.user!
        // add req to queue and await the response from the engine via pub sub 
        const response = await RedisManager.getInstance().sendAndAwait(userId, data)
        res.json(response)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Something went wrong :(. Please try again later" })
    }

})