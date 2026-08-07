import { EngineRes } from "@repo/types/engine";
import { orderMutation } from "./orderMutation";

export async function performDBMutation(message: string) {
    try {
        // Engine pub/sub publishes the EngineRes JSON directly (not { element } like brPop).
        const payload = JSON.parse(message) as EngineRes
        if (!payload || "error" in payload) {
            if (payload && "error" in payload) {
                console.error("Skipping engine error payload:", payload.error)
            }
            return
        }

        switch (payload.type) {
            case "place_order":
                await orderMutation(payload.userId, payload.data)
                break
            default:
                break
        }
    } catch (error) {
        console.error("Archiver mutation failed:", error)
    }
}
