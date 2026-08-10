# Probo Turbo

Opinion-market exchange monorepo: API, matching engine, WebSocket fan-out, archiver, and Vite web app.

## Architecture

![Architecture](docs/architecture.png)

HTTP for mutations, an in-memory matching engine for the book, Redis for queue / pub-sub / stream / snapshot, WebSockets for live fans, and an archiver writing Postgres.

```
client ──HTTP──► api-server ──queue──► engine (in-memory db)
                     │                    │
                     │                    ├─ pub-sub ──► api-server (request reply)
                     │                    ├─ pub-sub ──► ws ──► clients
                     │                    ├─ redis stream ──► archiver ──► DB
                     │                    └─ redis snapshot (engine hydrate)
                     └── DB (auth, markets, reads)
```

| Piece | Role |
| --- | --- |
| **api-server** | Auth + HTTP API; enqueues engine work; waits on per-request pub/sub reply |
| **engine** | In-memory orderbook / balances; matches orders; publishes results |
| **ws** | Live market updates to clients (`engine:ws` pub/sub) |
| **archiver** | Consumes `engine:archiver` stream → Postgres |
| **web** | React (Vite) frontend |

**Redis contracts**

| Kind | Key / channel | Purpose |
| --- | --- | --- |
| Queue (list) | `api_engine_queue` | api → engine requests |
| Pub/sub | `<reqId>` | engine → api request–reply |
| Pub/sub | `engine:ws` | engine → ws live market updates |
| Stream | `engine:archiver` | engine → archiver persistence log |
| Snapshot | `engine:snapshot` | engine crash recovery / hydrate |

## Apps

```
apps/api-server   HTTP API + Better Auth
apps/engine       Matching engine
apps/ws           WebSocket server
apps/archiver     Persistence worker
apps/web          Frontend
```

## Quick start

**1. Env**

```bash
cp .env.example .env          # fill DATABASE_URL, REDIS_URL, auth, etc.
cp apps/web/.env.example apps/web/.env
```

**2. Backend (Docker)**

```bash
docker compose up -d --build
```

- API: `http://localhost:3000`
- WS: `ws://localhost:8080`
- Caddy (optional): `http://localhost`

**3. Frontend (local)**

```bash
pnpm install
pnpm --filter web dev
```

`apps/web/.env`:

```
VITE_BACKEND_BASE_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:8080
```

## Notes

- Postgres + Redis are external (`DATABASE_URL`, `REDIS_URL` in `.env`).
- Never commit `.env` files — use `.env.example` as the template.
