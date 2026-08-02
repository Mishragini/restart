import { Router } from "express";
import { adminMiddleware, AuthenticatedRequest, validate } from "../lib/middleware";
import { User } from "@repo/types/user";
import { prisma } from "@repo/db";
import { MarketSchema } from "@repo/types/market";

export const marketRouter: Router = Router()

marketRouter.post("/create", adminMiddleware, validate(MarketSchema), async (req: AuthenticatedRequest, res) => {
    try {
        const { title, description, sourceOfTruth, categoryIds, endsAt } = req.body
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
                    connect: {
                        id: userId
                    }
                }
            }
        })

        res.status(201).json({ message: "Market created successfully", data: db_response })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Something went wrong :(. Please try again later" })
    }
})