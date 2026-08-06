import { Router } from "express";
import { type AuthenticatedRequest, authMiddleware, validate } from "../lib/middleware";
import { onRampInrSchema, type OnRampInr, type Balance } from "@repo/types/balance"
import { prisma } from "@repo/db";
import { RedisManager } from "../lib/redisManager";
export const inrBalanceRouter: Router = Router()

/** Store amounts as paise (integer); API speaks in rupees. */
const toPaise = (rupees: number) => Math.round(rupees * 100)
const toRupees = (paise: number) => paise / 100
const balanceInRupees = (balance: { available: number; locked: number }): Balance => ({
    available: toRupees(balance.available),
    locked: toRupees(balance.locked),
})

inrBalanceRouter.get("/", authMiddleware, async (req: AuthenticatedRequest, res) => {
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

inrBalanceRouter.post("/webhook", authMiddleware, validate(onRampInrSchema), async (req: AuthenticatedRequest, res) => {
    try {
        const redisInstance = RedisManager.getInstance()
        const { amount } = req.validatedData as OnRampInr
        const { id: userId } = req.user!
        const [balance] = await Promise.all([prisma.inrBalance.update({
            where: {
                userId
            },
            data: {
                available: {
                    increment: toPaise(amount)
                }
            },
            select: {
                available: true,
                locked: true,
            },
        }),
        redisInstance.sendAndAwait(userId, { amount })
        ])
        res.status(200).json({ message: "Funds added successfully", data: balanceInRupees(balance) })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Something went wrong :(. Please try again later" })
    }
})
