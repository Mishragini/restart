import { redis } from "@repo/redis"
import WebSocket from "ws"

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

    async subscribe(ws: WebSocket) {
        await this.connect()
        await this.subscriber.subscribe("engine:ws", (message) => {
            ws.send(message)
        })
    }
}