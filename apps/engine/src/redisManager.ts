import { ENGINE_ARCHIVER_STREAM, redis } from "@repo/redis"
import type { EngineRes, EngineSnapshot, MarketUpdateMessage } from "@repo/types/engine"

export class RedisManager {
    private static instance: RedisManager
    private queue
    private publisher
    private snapshot

    private constructor() {
        this.queue = redis.duplicate()
        this.publisher = redis.duplicate()
        this.snapshot = redis.duplicate()
    }

    private async connect() {
        if (!this.queue.isOpen) {
            await this.queue.connect()
        }
        if (!this.publisher.isOpen) {
            await this.publisher.connect()
        }
        if (!this.snapshot.isOpen) {
            await this.snapshot.connect()
        }
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new RedisManager()
        }
        return this.instance
    }

    async readFromQueue() {
        await this.connect()
        const request = await this.queue.brPop("api_engine_queue", 0)
        return request
    }

    async publishMessage(channel: string, message: EngineRes | MarketUpdateMessage) {
        await this.connect()
        await this.publisher.publish(channel, JSON.stringify(message))
    }

    async publishToArchiver(message: EngineRes) {
        await this.connect()
        await this.publisher.xAdd(ENGINE_ARCHIVER_STREAM, "*", {
            payload: JSON.stringify(message),
        })
    }

    async getSnapshot() {
        await this.connect()
        return await this.snapshot.get("engine:snapshot")
    }

    async setSnapShot(snap: EngineSnapshot) {
        await this.connect()
        return await this.snapshot.set("engine:snapshot", JSON.stringify(snap))
    }
}
