import WebSocket, { WebSocketServer } from "ws";
import { RedisManager } from "./redisManager";

const wss = new WebSocketServer({
    port: Number(process.env.PORT) || 8080
})

const rooms = new Map<string, Set<WebSocket>>()

wss.on("connection", async (ws, req) => {
    await RedisManager.getInstance().subscribe(ws)
    const url = new URL(req.url ?? "/", `http://${req.headers.host}`)

    const marketId = url.pathname.match(/^\/markets\/([^/]+)$/)?.[1]

    if (!marketId) {
        ws.close(1008, "marketId required")
        return;
    }

    let room = rooms.get(marketId)
    if (!room) {
        room = new Set()
        rooms.set(marketId, room)
    }
    room.add(ws)

    ws.on("close", () => {
        room.delete(ws)
        if (room.size === 0) rooms.delete(marketId)
    })
})