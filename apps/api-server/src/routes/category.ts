import { Router } from "express";
import { adminMiddleware, AuthenticatedRequest, validate } from "../lib/middleware";
import { prisma } from "@repo/db";
import { CategorySchema } from "@repo/types/category";

export const categoryRouter: Router = Router()

categoryRouter.post("/create", adminMiddleware, validate(CategorySchema), async (req: AuthenticatedRequest, res) => {
    try {
        const { name } = req.body

        const dbResponse = await prisma.category.create({
            data: {
                name
            }
        })

        res.status(201).json({ message: "Category created successfully", data: dbResponse })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Something went wrong :(. Please try again later" })
    }
})

categoryRouter.get("/", adminMiddleware, async (req, res) => {
    try {
        const db_response = await prisma.category.findMany({})
        res.json({ message: "Categories fetched successfully", categories: db_response })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Something went wrong :(. Please try again later" })
    }
})