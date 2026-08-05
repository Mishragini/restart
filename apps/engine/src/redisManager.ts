import { redis } from "@repo/redis"
import { EngineReq } from "@repo/types/engine"

export class RedisManager {
    private static instance: RedisManager
    private queue
    private publisher

    private constructor() {
        this.queue = redis.duplicate()
        this.publisher = redis.duplicate()
    }

    private async connect() {
        if (!this.queue.isOpen) {
            await this.queue.connect()
        }
        if (!this.publisher.isOpen) {
            await this.publisher.connect()
        }
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new RedisManager()
        }
        return this.instance
    }

    async processReq() {
        await this.connect()

        while (true) {
            const request = await this.queue.brPop("api_engine_queue", 0)

            if (!request) continue

            const message = JSON.parse(request.element) as EngineReq
            //process req 

            this.publisher.publish(message.reqId, JSON.stringify({ ok: true }))
        }
    }

}