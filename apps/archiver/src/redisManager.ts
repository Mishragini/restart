import { ARCHIVER_GROUP, ENGINE_ARCHIVER_STREAM, redis } from "@repo/redis"

/**
 * How Redis Streams work here (simple mental model):
 *
 * 1. Engine appends a message to the stream with XADD  (like pushing onto a log)
 * 2. Archiver reads the next unread message with XREADGROUP
 * 3. Archiver writes it to Postgres, then XACK ("I'm done with this message")
 *
 * The consumer group tracks which messages were already handled,
 * so a restart won't re-process acked messages.
 */
export class RedisManager {
    private static instance: RedisManager
    private client

    private constructor() {
        this.client = redis.duplicate()
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new RedisManager()
        }
        return this.instance
    }

    private async connect() {
        if (!this.client.isOpen) {
            await this.client.connect()
        }
    }

    /** Create the stream + consumer group once. Safe to call again if they already exist. */
    private async createGroupIfNeeded() {
        try {
            // "0" = start from the beginning of the stream
            // MKSTREAM = also create the stream key if it's missing
            await this.client.xGroupCreate(ENGINE_ARCHIVER_STREAM, ARCHIVER_GROUP, "0", {
                MKSTREAM: true,
            })
        } catch (error) {
            const msg = error instanceof Error ? error.message : String(error)
            // BUSYGROUP = group already exists — that's fine
            if (!msg.includes("BUSYGROUP")) throw error
        }
    }

    /** Forever: wait for a message from the engine → run handler → ack. */
    async listen(onMessage: (payload: string) => Promise<void>) {
        await this.connect()
        await this.createGroupIfNeeded()

        while (true) {
            // ">" = only messages this group has never delivered yet
            // BLOCK 5000 = wait up to 5 seconds, then loop again
            const results = await this.client.xReadGroup(
                ARCHIVER_GROUP,
                "archiver-1",
                { key: ENGINE_ARCHIVER_STREAM, id: ">" },
                { COUNT: 1, BLOCK: 5000 },
            )

            // Timed out with nothing new — just wait again
            if (!results) continue

            for (const stream of results) {
                for (const entry of stream.messages) {
                    const payload = entry.message.payload
                    if (!payload) {
                        await this.client.xAck(ENGINE_ARCHIVER_STREAM, ARCHIVER_GROUP, entry.id)
                        continue
                    }

                    try {
                        await onMessage(payload)
                        // Only ack after a successful save
                        await this.client.xAck(ENGINE_ARCHIVER_STREAM, ARCHIVER_GROUP, entry.id)
                    } catch (error) {
                        // No ack → Redis keeps it pending so we can retry later
                        console.error("Failed to archive message:", entry.id, error)
                    }
                }
            }
        }
    }
}
