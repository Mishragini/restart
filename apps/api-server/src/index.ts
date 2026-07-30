import express from "express"
import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import { FRONTEND_BASE_URL, PORT } from "./config.js"
import { auth } from "./lib/auth.js";
import cors from "cors"
import { pfpRouter } from "./routes/pfp.js";

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

app.listen(PORT, () => {
    console.log(`Server is listening on ${PORT}`)
})