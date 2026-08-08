import { EngineRes } from "@repo/types/engine"
import { orderMutation } from "./orderMutation"

/** Turn one engine message into a Postgres write. Throws on failure (so we don't ack). */
export async function performDBMutation(message: string) {
    const payload = JSON.parse(message) as EngineRes

    if ("error" in payload) {
        console.error("Skipping engine error payload:", payload.error)
        return
    }

    if (payload.type === "place_order") {
        await orderMutation(payload.userId, payload.data)
    }
}
