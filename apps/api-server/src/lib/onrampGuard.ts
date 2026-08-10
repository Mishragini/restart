import { redis } from "@repo/redis"
import { ONRAMP_DAILY_MAX_INR } from "@repo/types/limits"

const utcDayKey = () => new Date().toISOString().slice(0, 10)

const dayKey = (userId: string) => `onramp:daily:${utcDayKey()}:${userId}`

/**
 * Enforce a per-user daily on-ramp ceiling (demo credits).
 * Returns null if allowed, or an error message if blocked.
 * Call `recordOnramp` only after the credit succeeds.
 */
export async function assertOnrampAllowed(
    userId: string,
    amountInr: number,
): Promise<string | null> {
    try {
        const currentRaw = await redis.get(dayKey(userId))
        const current = currentRaw ? Number(currentRaw) : 0
        if (!Number.isFinite(current)) {
            return "On-ramp temporarily unavailable"
        }
        if (current + amountInr > ONRAMP_DAILY_MAX_INR) {
            const remaining = Math.max(0, ONRAMP_DAILY_MAX_INR - current)
            return `Daily on-ramp limit reached (₹${ONRAMP_DAILY_MAX_INR}). Remaining today: ₹${remaining}`
        }
        return null
    } catch (error) {
        console.error("onrampGuard error:", error)
        return "On-ramp temporarily unavailable. Please try again later."
    }
}

export async function recordOnramp(userId: string, amountInr: number) {
    const key = dayKey(userId)
    try {
        const currentRaw = await redis.get(key)
        const current = currentRaw ? Number(currentRaw) : 0
        const next = (Number.isFinite(current) ? current : 0) + amountInr
        await redis.set(key, String(next), { EX: 60 * 60 * 48 })
    } catch (error) {
        console.error("recordOnramp error:", error)
    }
}
