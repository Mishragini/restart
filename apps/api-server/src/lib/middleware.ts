import type { NextFunction, Request, Response } from "express";
import { auth } from "./auth";
import { fromNodeHeaders } from "better-auth/node";
import type { Role, User } from "@repo/db";
import z, { type ZodType } from "zod";
import type { Session } from "better-auth";



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
    req.user = {
        ...session.user,
        image: session.user.image ?? null,
    };
    req.session = session.session;
    next()
}

export const requireRole = (roles: Role[]) =>
    (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
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