import { createClient } from "redis";

const globalForRedis = globalThis as unknown as {
    redis: ReturnType<typeof createClient> | undefined
}

export const redis = globalForRedis.redis ?? createClient({
    url: process.env.REDIS_URL
})

if (!globalForRedis.redis) {
    globalForRedis.redis = redis
}

redis.on("error", (error) => {
    console.error("Redis Client Error:", error)
})

export async function connectRedis() {
    if (!redis.isOpen) {
        await redis.connect()
    }
}