import { Router } from "express";
import { type AuthenticatedRequest, authMiddleware, requireRole, validate } from "../lib/middleware";
import { prisma, MarketStatus, Role, Side } from "@repo/db";
import { CreateMarketSchema, FetchMarketSchema, type MintInput, MintSchema, UpdateMarketStatusSchema, type CreateMarketInput, type FetchMarketInput, type UpdateMarketStatusInput } from "@repo/types/market";
import { closeExpiredMarkets } from "../jobs/closeExpiredMarkets";
import { updateMarketStatus } from "../lib/settle";
import { RedisManager } from "../lib/redisManager";

const isTerminalMarketStatus = (status: MarketStatus) =>
    status === MarketStatus.RESOLVED || status === MarketStatus.CANCELLED

export const marketRouter: Router = Router()

marketRouter.post("/create", authMiddleware, requireRole([Role.ADMIN]), validate(CreateMarketSchema), async (req: AuthenticatedRequest, res) => {
    try {
        const { title, description, sourceOfTruth, categoryIds, endsAt } = req.validatedData as CreateMarketInput
        const { id: userId } = req.user!

        const db_response = await prisma.market.create({
            data: {
                title,
                description,
                sourceOfTruth,
                endsAt: new Date(endsAt),
                categories: {
                    connect: categoryIds.map((id: string) => ({ id }))
                },
                createdBy: {
                    connect: { id: userId }
                }
            }
        })

        res.status(201).json({ message: "Market created successfully", data: db_response })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Something went wrong :(. Please try again later" })
    }
})

marketRouter.get("/", authMiddleware, validate(FetchMarketSchema, "query"), async (req: AuthenticatedRequest, res) => {
    try {
        const { status, categoryIds } = req.validatedData as FetchMarketInput

        await closeExpiredMarkets()

        const markets = await prisma.market.findMany({
            where: {
                ...(status && { status }),
                ...(categoryIds?.length && {
                    categories: { some: { id: { in: categoryIds } } }
                })
            },
            include: {
                categories: {
                    select: { id: true, name: true }
                }
            }
        })

        res.status(200).json({ data: markets })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Something went wrong :(. Please try again later" })
    }
})

marketRouter.get("/:marketId", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
        const { marketId } = req.params as { marketId: string }

        const market = await prisma.market.findUnique({
            where: { id: marketId },
            include: {
                categories: {
                    select: { id: true, name: true }
                }
            }
        })

        if (!market) {
            res.status(404).json({ error: "Market not found" })
            return
        }

        res.status(200).json({ data: market })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Something went wrong :(. Please try again later" })
    }
})

marketRouter.patch(
    "/:marketId/status",
    authMiddleware,
    requireRole([Role.ADMIN]),
    validate(UpdateMarketStatusSchema),
    async (req: AuthenticatedRequest, res) => {
        try {
            const { marketId } = req.params as { marketId: string }
            const { status: nextStatus, outcome } = req.validatedData as UpdateMarketStatusInput

            const market = await prisma.market.findUnique({ where: { id: marketId } })

            if (!market) {
                res.status(404).json({ error: "Market not found" })
                return
            }

            if (isTerminalMarketStatus(market.status)) {
                res.status(400).json({
                    error: `Cannot change status of a ${market.status.toLowerCase()} market`,
                })
                return
            }

            const updated = await updateMarketStatus(marketId, nextStatus, outcome)

            res.status(200).json({ message: "Market status updated", data: updated })
        } catch (error) {
            console.error(error)
            res.status(500).json({ error: "Something went wrong :(. Please try again later" })
        }
    },
)

/** Complete set (1 Yes + 1 No) costs ₹10 → stored as paise, matching InrBalance. */
const MINT_COST_PER_PAIR_PAISE = 1000

marketRouter.post("/mint", authMiddleware, requireRole([Role.ADMIN]), validate(MintSchema), async (req: AuthenticatedRequest, res) => {
    try {
        const redisInstance = RedisManager.getInstance()
        const { amount, marketId } = req.validatedData as MintInput
        const { id: userId } = req.user!
        const cost = amount * MINT_COST_PER_PAIR_PAISE

        const [market, inrBalance] = await Promise.all([
            prisma.market.findFirst({
                where: { id: marketId, status: MarketStatus.ACTIVE }
            }),
            prisma.inrBalance.findUnique({
                where: { userId }
            })
        ])

        if (!market) {
            res.status(404).json({ error: "No active market found." })
            return
        }

        if (!inrBalance || inrBalance.available < cost) {
            res.status(400).json({ error: "Insufficient INR balance." })
            return
        }

        const [result] = await Promise.all([
            prisma.$transaction(async (tx) => {
                // Upsert uses @@unique([userId, marketId, side]) → compound where key userId_marketId_side
                const upsertStock = (side: Side) =>
                    tx.stockBalance.upsert({
                        where: {
                            userId_marketId_side: { userId, marketId, side }
                        },
                        create: {
                            side,
                            available: amount,
                            user: { connect: { id: userId } },
                            market: { connect: { id: marketId } }
                        },
                        update: {
                            available: { increment: amount }
                        }
                    })

                // All three succeed or the whole transaction rolls back
                const [yesBalance, noBalance, updatedInr] = await Promise.all([
                    upsertStock(Side.YES),
                    upsertStock(Side.NO),
                    tx.inrBalance.update({
                        where: { userId },
                        data: { available: { decrement: cost } }
                    })
                ])

                return { yesBalance, noBalance, updatedInr }
            }),
            redisInstance.sendAndAwait(userId, { amount, marketId })
        ])

        res.status(200).json({
            message: "Minted successfully",
            data: {
                yes: result.yesBalance,
                no: result.noBalance,
                inrBalance: {
                    available: result.updatedInr.available / 100,
                    locked: result.updatedInr.locked / 100
                }
            }
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Something went wrong :(. Please try again later" })
    }
})
