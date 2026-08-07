import { redis } from "@repo/redis";
import { type EngineOp, type EngineOps, type EngineRes } from "@repo/types/engine";

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

    async sendAndAwait<K extends EngineOp>(userId: string, type: K, data: EngineOps[K]["req"]): Promise<EngineRes> {
        await this.connect()

        const reqId = crypto.randomUUID()

        const responsePromise = new Promise<EngineRes>((resolve, reject) => {
            const timer = setTimeout(() => {
                void this.subscriber.unsubscribe(reqId)
                reject(new Error("Engine response timeout"))
            }, 5000)

            this.subscriber.subscribe(reqId, (message) => {
                clearTimeout(timer)
                void this.subscriber.unsubscribe(reqId)
                resolve(JSON.parse(message) as EngineRes)
            }).then(() =>
                this.queue.lPush("api_engine_queue", JSON.stringify({ reqId, userId, type, data }))
            ).catch((error) => {
                clearTimeout(timer)
                void this.subscriber.unsubscribe(reqId)
                reject(error)
            })
        })

        return responsePromise
    }
}
