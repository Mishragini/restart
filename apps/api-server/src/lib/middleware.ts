import { NextFunction, Request, Response } from "express";
import { auth } from "./auth";
import { fromNodeHeaders } from "better-auth/node";
import { type User } from "@repo/types/user"
import z, { ZodType } from "zod"
import { Session } from "better-auth";
import { Role } from "@repo/db";

export interface AuthenticatedRequest extends Request {
    user?: User,
    validatedData?: unknown,
    session?: Session
}

export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers)
    })
    if (!session) {
        res.status(401).json({ error: "Unauthorized" })
        return;
    }
    req.user = session.user;
    req.session = session.session;
    next()
}

export const requireRole = (roles: Role[]) =>
    (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role as Role)) {
            res.status(403).json({ error: "Forbidden" });
            return;
        }
        next()
    }

//middleware currying
export const validate = (validationSchema: ZodType, source: "body" | "query" = "body") =>
    (req: AuthenticatedRequest, res: Response, next: NextFunction) => {

        const result = validationSchema.safeParse(req[source])

        if (!result.success) {
            console.error(z.flattenError(result.error).fieldErrors)
            res.status(400).json({ error: 'Bad Request' })
            return
        }
        req.validatedData = result.data
        next()
    }