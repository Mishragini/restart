import { Engine } from "./engine"
import { hydrateEngine } from "./hydrate"
import { RedisManager } from "./redisManager"

async function main() {
    const redisInstance = RedisManager.getInstance()
    const state = await hydrateEngine(redisInstance)
    const engine = Engine.getInstance(state)
    while (true) {
        const message = await redisInstance.readFromQueue()
        if (message) {
            await engine.processReq(redisInstance, message.element)
        }
    }
}

main()