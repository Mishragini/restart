import { Router } from "express";
import { type AuthenticatedRequest, authMiddleware, validate } from "../lib/middleware";
import {
    onRampInrSchema,
    getStockBalanceSchema,
    type OnRampInr,
    type Balance,
    type GetStockBalanceInput,
    type GetStockBalanceRes,
} from "@repo/types/balance"
import { prisma } from "@repo/db";
import { RedisManager } from "../lib/redisManager";
import { toPaise, toRupees } from "../lib/utils";
import { writeLimiter } from "../lib/rateLimit";
import { assertOnrampAllowed, recordOnramp } from "../lib/onrampGuard";

export const balanceRouter: Router = Router()

const balanceInRupees = (balance: { available: number; locked: number }): Balance => ({
    available: toRupees(balance.available),
    locked: toRupees(balance.locked),
})

const emptyStock = (): Balance => ({ available: 0, locked: 0 })

balanceRouter.get("/", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
        const { id: userId } = req.user!
        const balance = await prisma.inrBalance.findUnique({
            where: { userId },
            select: {
                available: true,
                locked: true,
            },
        })

        if (!balance) {
            return res.status(404).json({ error: "Balance not found" })
        }

        res.status(200).json({ data: balanceInRupees(balance) })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Something went wrong :(. Please try again later" })
    }
})

balanceRouter.get("/stock", authMiddleware, validate(getStockBalanceSchema, "query"), async (req: AuthenticatedRequest, res) => {
    try {
        const { marketId } = req.validatedData as GetStockBalanceInput
        const { id: userId } = req.user!

        const rows = await prisma.stockBalance.findMany({
            where: { userId, marketId },
            select: { side: true, available: true, locked: true },
        })

        const data: GetStockBalanceRes = {
            marketId,
            YES: emptyStock(),
            NO: emptyStock(),
        }

        for (const row of rows) {
            data[row.side] = {
                available: row.available,
                locked: row.locked,
            }
        }

        res.status(200).json({ data })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Something went wrong :(. Please try again later" })
    }
})

balanceRouter.post(
    "/webhook",
    authMiddleware,
    writeLimiter,
    validate(onRampInrSchema),
    async (req: AuthenticatedRequest, res) => {
        try {
            const redisInstance = RedisManager.getInstance()
            const { amount } = req.validatedData as OnRampInr
            const { id: userId } = req.user!

            const blocked = await assertOnrampAllowed(userId, amount)
            if (blocked) {
                res.status(429).json({ error: blocked })
                return
            }

            const amountPaise = toPaise(amount)
            const [balance] = await Promise.all([prisma.inrBalance.update({
                where: {
                    userId
                },
                data: {
                    available: {
                        increment: amountPaise
                    }
                },
                select: {
                    available: true,
                    locked: true,
                },
            }),
            redisInstance.sendAndAwait(userId, "onramp_inr", { amount: amountPaise })
            ])
            await recordOnramp(userId, amount)
            res.status(200).json({ message: "Funds added successfully", data: balanceInRupees(balance) })
        } catch (error) {
            console.error(error)
            res.status(500).json({ error: "Something went wrong :(. Please try again later" })
        }
    },
)
