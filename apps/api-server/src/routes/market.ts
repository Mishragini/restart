import { Router } from "express";
import { adminMiddleware, AuthenticatedRequest, authMiddleware, validate } from "../lib/middleware";
import { User } from "@repo/types/user";
import { prisma } from "@repo/db";
import { CreateMarketSchema, FetchMarketSchema, type CreateMarketInput, type FetchMarketInput } from "@repo/types/market";
import { closeExpiredMarkets } from "../jobs/closeExpiredMarkets";

export const marketRouter: Router = Router()

marketRouter.post("/create", adminMiddleware, validate(CreateMarketSchema), async (req: AuthenticatedRequest, res) => {
    try {
        const { title, description, sourceOfTruth, categoryIds, endsAt } = req.validatedData as CreateMarketInput
        const { id: userId } = req.user as User

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