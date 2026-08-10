import type { NextFunction, Request, Response } from "express"
import { redis } from "@repo/redis"
import type { AuthenticatedRequest } from "./middleware"

type RateLimitOptions = {
    /** Redis key namespace */
    name: string
    /** Max requests in the window */
    limit: number
    /** Window length in seconds */
    windowSec: number
    /** Build the bucket key (defaults to client IP) */
    key?: (req: Request) => string
    /** Skip this request entirely */
    skip?: (req: Request) => boolean
}

const INCR_SCRIPT = `
local current = redis.call('INCR', KEYS[1])
if current == 1 then
  redis.call('EXPIRE', KEYS[1], ARGV[1])
end
local ttl = redis.call('TTL', KEYS[1])
return { current, ttl }
`

export function clientIp(req: Request): string {
    // trust proxy is set so req.ip is the real client behind Caddy
    return req.ip || req.socket.remoteAddress || "unknown"
}

/**
 * Fixed-window rate limiter backed by Redis (1 EVAL round-trip).
 * Fail-open on Redis errors so a Redis blip doesn't take down the API.
 */
export function rateLimit(options: RateLimitOptions) {
    const { name, limit, windowSec, key, skip } = options

    return async (req: Request, res: Response, next: NextFunction) => {
        if (skip?.(req)) {
            next()
            return
        }

        const bucket = key?.(req) ?? clientIp(req)
        const redisKey = `rl:${name}:${bucket}`

        try {
            const result = (await redis.eval(INCR_SCRIPT, {
                keys: [redisKey],
                arguments: [String(windowSec)],
            })) as [number, number]

            const [count, ttl] = result
            const remaining = Math.max(0, limit - count)
            const resetSec = ttl > 0 ? ttl : windowSec

            res.setHeader("X-RateLimit-Limit", String(limit))
            res.setHeader("X-RateLimit-Remaining", String(remaining))
            res.setHeader("X-RateLimit-Reset", String(resetSec))

            if (count > limit) {
                res.setHeader("Retry-After", String(resetSec))
                res.status(429).json({
                    error: "Too many requests. Please slow down.",
                })
                return
            }
        } catch (error) {
            console.error("rateLimit error:", error)
            // fail open
        }

        next()
    }
}

/** Global IP limit for all API traffic. */
export const globalLimiter = rateLimit({
    name: "global",
    limit: 300,
    windowSec: 15 * 60,
    skip: (req) => req.path === "/health",
})

/** Auth endpoints are a common brute-force / signup-spam target. */
export const authLimiter = rateLimit({
    name: "auth",
    limit: 30,
    windowSec: 15 * 60,
})

/** Mutating trading / balance ops — keyed by user when available. */
export const writeLimiter = rateLimit({
    name: "write",
    limit: 30,
    windowSec: 60,
    key: (req) => {
        const userId = (req as AuthenticatedRequest).user?.id
        return userId ? `u:${userId}` : `ip:${clientIp(req)}`
    },
})

/** S3 presign minting — unauthenticated signup uploads, so IP-only. */
export const uploadLimiter = rateLimit({
    name: "upload",
    limit: 10,
    windowSec: 60 * 60,
})
