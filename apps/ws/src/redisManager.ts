import { redis } from "@repo/redis"
import WebSocket from "ws"
import type { MarketUpdateMessage } from "@repo/types/engine"

export class RedisManager {
    private static instance: RedisManager
    private subscriber
    private subscribed = false

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

    /**
     * One Redis subscription shared by all sockets.
     * Fan-out only to the market room — avoids N× bandwidth / Upstash cost.
     */
    async ensureSubscribed(rooms: Map<string, Set<WebSocket>>) {
        await this.connect()
        if (this.subscribed) return

        await this.subscriber.subscribe("engine:ws", (message) => {
            let parsed: MarketUpdateMessage
            try {
                parsed = JSON.parse(message) as MarketUpdateMessage
            } catch {
                return
            }
            if (!parsed?.marketId) return

            const room = rooms.get(parsed.marketId)
            if (!room || room.size === 0) return

            for (const client of Array.from(room)) {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(message)
                }
            }
        })
        this.subscribed = true
    }
}
