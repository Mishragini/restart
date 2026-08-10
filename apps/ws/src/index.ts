import WebSocket, { WebSocketServer } from "ws";
import { RedisManager } from "./redisManager";

const PORT = Number(process.env.PORT) || 8080
const MAX_CONNECTIONS_PER_IP = 5
const MAX_TOTAL_CONNECTIONS = 200
const ALLOWED_ORIGIN = (process.env.FRONTEND_BASE_URL || "").replace(/\/$/, "")

const wss = new WebSocketServer({ port: PORT })

const rooms = new Map<string, Set<WebSocket>>()
const connectionsByIp = new Map<string, number>()

function clientIp(req: { headers: Record<string, string | string[] | undefined>; socket: { remoteAddress?: string } }) {
    const forwarded = req.headers["x-forwarded-for"]
    if (typeof forwarded === "string" && forwarded.length > 0) {
        return forwarded.split(",")[0]!.trim()
    }
    return req.socket.remoteAddress || "unknown"
}

function releaseIp(ip: string) {
    const n = (connectionsByIp.get(ip) ?? 1) - 1
    if (n <= 0) connectionsByIp.delete(ip)
    else connectionsByIp.set(ip, n)
}

wss.on("connection", async (ws, req) => {
    const ip = clientIp(req)
    const origin = req.headers.origin

    // Block obvious cross-origin WS abuse when FRONTEND_BASE_URL is set
    if (ALLOWED_ORIGIN && origin && origin.replace(/\/$/, "") !== ALLOWED_ORIGIN) {
        ws.close(1008, "origin not allowed")
        return
    }

    if (wss.clients.size > MAX_TOTAL_CONNECTIONS) {
        ws.close(1013, "server at capacity")
        return
    }

    const ipCount = connectionsByIp.get(ip) ?? 0
    if (ipCount >= MAX_CONNECTIONS_PER_IP) {
        ws.close(1008, "too many connections")
        return
    }
    connectionsByIp.set(ip, ipCount + 1)

    const url = new URL(req.url ?? "/", `http://${req.headers.host}`)
    const marketId = url.pathname.match(/^\/markets\/([^/]+)$/)?.[1]

    if (!marketId) {
        releaseIp(ip)
        ws.close(1008, "marketId required")
        return
    }

    let room = rooms.get(marketId)
    if (!room) {
        room = new Set()
        rooms.set(marketId, room)
    }
    room.add(ws)

    try {
        await RedisManager.getInstance().ensureSubscribed(rooms)
    } catch (error) {
        console.error(error)
        room.delete(ws)
        if (room.size === 0) rooms.delete(marketId)
        releaseIp(ip)
        ws.close(1011, "subscribe failed")
        return
    }

    ws.on("close", () => {
        room.delete(ws)
        if (room.size === 0) rooms.delete(marketId)
        releaseIp(ip)
    })

    // Ignore inbound client messages — this socket is push-only
    ws.on("message", () => {
        /* no-op */
    })
})

console.log(`WS listening on ${PORT}`)
