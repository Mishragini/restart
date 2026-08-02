import { NextFunction, Request, Response } from "express";
import { auth } from "./auth";
import { fromNodeHeaders } from "better-auth/node";
import { type User } from "@repo/types/user"
import z, { ZodType } from "zod"

export interface AuthenticatedRequest extends Request {
    user?: User
}

export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers)
    })
    if (!session) {
        res.status(401).json({ error: "Unauthorized" })
        return;
    }
    req.user = session.user
    next()
}


export const adminMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers)
    })
    if (!session || session.user.role !== "ADMIN") {
        res.status(403).json({ error: "Forbidden! Admin access required." })
        return;
    }
    req.user = session.user
    next()
}

//middleware currying
export const validate = (validationSchema: ZodType) =>
    (req: AuthenticatedRequest, res: Response, next: NextFunction) => {

        const result = validationSchema.safeParse(req.body)

        if (!result.success) {
            console.error(z.flattenError(result.error).fieldErrors)
            res.status(400).json({ error: 'Bad Request' })
            return
        }
        next()
    }