import express from "express"
import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import { FRONTEND_BASE_URL, PORT } from "./config.js"
import { auth } from "./lib/auth.js";
import cors from "cors"
import { pfpRouter } from "./routes/pfp.js";
import { marketRouter } from "./routes/market.js";
import { categoryRouter } from "./routes/category.js";
import { schedule } from 'node-cron'
import { closeExpiredMarkets } from "./jobs/closeExpiredMarkets.js";

const app = express()
console.log("FRONTEND_BASE_URL", FRONTEND_BASE_URL)

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

app.get("/health", (req, res) => {
    res.json({ status: "ok" })
})

app.use("/api/v1/pfp", pfpRouter)
app.use("/api/v1/markets", marketRouter)
app.use("/api/v1/categories", categoryRouter)


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