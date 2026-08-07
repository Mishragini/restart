import { redis } from "@repo/redis"

export class RedisManager {
    private static instance: RedisManager
    private subscriber

    private constructor() {
        this.subscriber = redis.duplicate()
    }

    private async connect() {
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

    async subscribe(callback: (message: string) => Promise<void>) {
        await this.connect()
        this.subscriber.subscribe("archiver", (message) => {
            void callback(message).catch((error) => {
                console.error("Archiver subscriber error:", error)
            })
        }).catch((error) => {
            console.log("error while subscribing:", error)
        })
    }
}