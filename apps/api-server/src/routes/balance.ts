import { Router } from "express";
import { AuthenticatedRequest, authMiddleware, validate } from "../lib/middleware";
import { onRampInrSchema, type OnRampInr, type InrBalance } from "@repo/types/balance"
import { prisma } from "@repo/db";
export const inrBalanceRouter: Router = Router()

/** Store amounts as paise (integer); API speaks in rupees. */
const toPaise = (rupees: number) => Math.round(rupees * 100)
const toRupees = (paise: number) => paise / 100
const balanceInRupees = (balance: { available: number; locked: number }): InrBalance => ({
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
        const { amount } = req.validatedData as OnRampInr
        const { id: userId } = req.user!
        const balance = await prisma.inrBalance.update({
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
        })
        res.status(200).json({ message: "Funds added successfully", data: balanceInRupees(balance) })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Something went wrong :(. Please try again later" })
    }
})
