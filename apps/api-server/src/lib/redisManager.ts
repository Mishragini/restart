import { redis } from "@repo/redis";
import { type EngineReqData } from "@repo/types/engine";

export class RedisManager {
    private static instance: RedisManager
    private queue
    private subscriber
    private constructor() {
        this.queue = redis.duplicate()
        this.subscriber = redis.duplicate()
    }

    private async connect() {
        if (!this.queue.isOpen) {
            await this.queue.connect()
        }
        if (!this.subscriber.isOpen) {
            await this.subscriber.connect()
        }
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new RedisManager()
        }
        return this.instance
    }

    async sendAndAwait(userId: string, req: EngineReqData) {

        await this.connect()

        const reqId = crypto.randomUUID()

        const responsePromise = new Promise(async (resolve, reject) => {
            const timer = setTimeout(() => {
                void this.subscriber.unsubscribe(reqId)
                reject("Engine response timeout")
            }, 5000)
            await this.subscriber.subscribe(reqId, (message) => {
                void this.subscriber.unsubscribe(reqId)
                resolve(JSON.parse(message))
            })
        })

        this.queue.lPush("api_engine_queue", JSON.stringify({ reqId, userId, data: req }))
        return responsePromise
    }
}