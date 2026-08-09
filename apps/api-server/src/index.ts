import express from "express"
import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import { FRONTEND_BASE_URL, PORT } from "./config"
import { auth } from "./lib/auth";
import cors from "cors"
import { pfpRouter } from "./routes/pfp";
import { marketRouter } from "./routes/market";
import { categoryRouter } from "./routes/category";
import { balanceRouter } from "./routes/balance";
import { schedule } from 'node-cron'
import { closeExpiredMarkets } from "./jobs/closeExpiredMarkets";
import { connectRedis, redis } from "@repo/redis";
import { orderRouter } from "./routes/order";

const app = express()

app.use(cors({
    origin: FRONTEND_BASE_URL,
    credentials: true
}))

app.all('/api/auth/{*any}', toNodeHandler(auth));

app.use(express.json())

app.get("/api/me", async (req, res) => {
    const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers)
    })
    return res.json(session)
})

app.get("/health", async (req, res) => {
    try {
        const pong = await redis.ping();
        res.json({ status: "ok", redis: pong });
    } catch (error) {
        console.error(error);
        res.status(503).json({ status: "error", redis: "down" });
    }
})

app.use("/api/v1/pfp", pfpRouter)
app.use("/api/v1/markets", marketRouter)
app.use("/api/v1/categories", categoryRouter)
app.use("/api/v1/balance", balanceRouter)
app.use("/api/v1/orders", orderRouter)

async function main() {
    await connectRedis()

    app.listen(PORT, () => {
        console.log(`Server is listening on ${PORT}`)
    })

    schedule('0 0 0 * * *', async () => {
        try {
            await closeExpiredMarkets()
        } catch (error) {
            console.log(error)
        }
    })
}

main().catch((error) => {
    console.error(error)
    process.exit(1)
})
