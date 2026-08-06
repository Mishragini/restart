import { loadFromDb } from "./db";
import type { RedisManager } from "./redisManager";
import { fromSnapshot, toSnapshot } from "./snapshot";

export const hydrateEngine = async (redisInstance: RedisManager) => {
    const redisSnap = await redisInstance.getSnapshot()
    if (!redisSnap) {
        const state = await loadFromDb()
        await redisInstance.setSnapShot(toSnapshot(state))
        return state
    }
    return fromSnapshot(JSON.parse(redisSnap))
}
