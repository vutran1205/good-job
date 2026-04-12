# Good Job

A peer recognition and rewards platform for internal teams. Employees send **Kudos** with points (10–50 pts) to teammates tagged with a Core Value, view a real-time feed, and redeem accumulated points for rewards.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Material UI v6, React Query, Zustand, React Router v6 |
| Backend | Express 4, TypeScript, Prisma ORM, PostgreSQL, Redis, BullMQ, WebSocket (ws) |
| Storage | MinIO (S3-compatible) |
| Monorepo | npm workspaces |

---

## Project Structure

```
good-job/
├── apps/
│   ├── api/                        # Express backend
│   │   ├── docker-compose.yml      # Dev stack (Postgres, Redis, MinIO, API)
│   │   ├── .env                    # Local env vars (gitignored)
│   │   ├── .env.example            # Env template
│   │   ├── Dockerfile              # Dev image with hot reload
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── seed.ts
│   │   └── src/
│   │       ├── app.ts              # Express factory (middleware, routes)
│   │       ├── server.ts           # HTTP + WebSocket entry point
│   │       ├── lib/                # prisma.ts, redis.ts, storage.ts
│   │       ├── middleware/         # auth.ts — JWT verification
│   │       ├── routes/             # auth, kudos, reactions, rewards, users
│   │       ├── services/           # kudos, points, rewards — business logic
│   │       ├── events/pubsub.ts    # Redis pub/sub → WebSocket broadcast
│   │       └── jobs/               # video.worker.ts (BullMQ), budget-reset.ts (cron)
│   └── web/                        # React frontend
│       ├── .env                    # Local env vars (gitignored)
│       ├── .env.example            # Env template
│       └── src/
│           ├── App.tsx             # Routes + ProtectedRoute
│           ├── main.tsx            # QueryClient, MUI Theme, BrowserRouter
│           ├── store/              # auth.store.ts — Zustand + localStorage
│           ├── hooks/              # useKudosFeed.ts, useCurrentUser.ts
│           ├── pages/              # Feed, Rewards, Profile, Login
│           └── components/         # KudoCard, KudoComposerDialog, Navbar
```

---

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) & Docker Compose
- Node.js 20+
- npm 10+

### 1. Configure environment

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

Edit `apps/api/.env` and set secure values for `JWT_SECRET` and `JWT_REFRESH_SECRET`.

### 2. Start backend services

```bash
cd apps/api
docker compose up
```

This starts PostgreSQL, Redis, MinIO, and the API with hot reload on port `3000`. The MinIO admin console is available at [http://localhost:9001](http://localhost:9001).

> First run takes ~30s to build the image. Subsequent starts are instant.

### 3. Seed the database (optional)

```bash
cd apps/api && npx prisma db seed
```

Seeds 5 sample rewards. Safe to run multiple times — skips if data already exists.

| Reward | Points |
|--------|--------|
| Coffee Voucher | 100 |
| Company Hoodie | 500 |
| Team Lunch | 800 |
| Friday Afternoon Off | 1,000 |
| Amazon Gift Card $20 | 1,500 |

### 4. Start the frontend

In a separate terminal:

```bash
npm install
npm run dev -w apps/web
```

Open [http://localhost:5173](http://localhost:5173). Vite proxies `/api` and `/ws` to `localhost:3000`.

---

## Commands

```bash
# Backend (apps/api)
npm run dev -w apps/api           # dev server with tsx watch
npm run build -w apps/api         # TypeScript check
npm run lint -w apps/api          # ESLint
npm run test -w apps/api          # run all tests (vitest)

# Frontend (apps/web)
npm run dev -w apps/web           # Vite dev server (port 5173)
npm run build -w apps/web         # TypeScript check + Vite build
npm run lint -w apps/web          # ESLint
npm run test -w apps/web          # vitest

# Root (both apps)
npm run lint                      # lint api + web
npm run build                     # build api + web
npm run test                      # test api + web

# Database
cd apps/api && npx prisma migrate dev --name <name>   # create migration
cd apps/api && npx prisma studio                       # GUI
cd apps/api && npx prisma db seed                      # seed rewards

# Rebuild API image (after package.json or schema.prisma changes)
cd apps/api && docker compose up --build
```

---

## Environment Variables

All variables are documented in `apps/api/.env.example`.

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `JWT_SECRET` | Secret for signing access tokens |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens |
| `JWT_ACCESS_EXPIRES_IN` | Access token lifetime (e.g. `15m`) |
| `API_PORT` | Port the API listens on |
| `CORS_ORIGIN` | Allowed CORS origin |
| `MINIO_ENDPOINT` | Internal MinIO endpoint used by the API |
| `MINIO_PUBLIC_URL` | Public URL for media files (proxied through API at `/media`) |
| `MINIO_ACCESS_KEY` | MinIO access key |
| `MINIO_SECRET_KEY` | MinIO secret key |
| `MINIO_BUCKET` | Bucket name for media storage |
| `FFMPEG_PATH` | Path to the ffmpeg binary |

> **Note:** `DATABASE_URL`, `REDIS_URL`, and `MINIO_ENDPOINT` in `.env` use `localhost` for local tooling (Prisma CLI, etc.). The `docker-compose.yml` overrides these three with internal Docker hostnames at runtime.

---

## API Reference

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/auth/register` | — | Register and create a giving budget |
| `POST` | `/api/auth/login` | — | Login → access token + refresh cookie |
| `POST` | `/api/auth/refresh` | — | Rotate refresh token → new access token |
| `POST` | `/api/auth/logout` | — | Invalidate refresh token |
| `GET` | `/api/users` | ✓ | List users (for recipient picker) |
| `GET` | `/api/users/me` | ✓ | Current user profile + balances |
| `GET` | `/api/users/ledger` | ✓ | Point transaction history |
| `POST` | `/api/kudos` | ✓ | Send a kudo (multipart/form-data) |
| `GET` | `/api/kudos?cursor=&limit=` | ✓ | Paginated kudos feed |
| `POST` | `/api/kudos/:id/reactions` | ✓ | Add emoji reaction |
| `POST` | `/api/kudos/:id/comments` | ✓ | Add comment |
| `GET` | `/api/rewards` | ✓ | List available rewards |
| `POST` | `/api/rewards/:id/redeem` | ✓ | Redeem a reward (idempotent) |
| `GET` | `/media/:bucket/:key` | — | Stream media file from internal MinIO |
| `GET` | `/health` | — | Health check |

---

## Architecture

### Points Ledger
Every point change is recorded as an append-only `LedgerEntry`. A user's balance is stored on the `User` row and updated atomically within a transaction.

### Giving Budget
Each user has a monthly budget of **200 pts** to give (separate from received balance). Resets on the 1st of each month via a cron job (`src/jobs/budget-reset.ts`). Enforced with `SELECT FOR UPDATE` inside a Prisma transaction.

### Double-spend Prevention
`rewards.service.ts` uses two layers:
1. Redis `SET NX` creates a 60-second idempotency key per `userId:rewardId:minute` — concurrent clicks are rejected without hitting the DB.
2. `SELECT FOR UPDATE` inside a Prisma transaction re-checks the balance at the DB level, blocking any race that slips through.

### Real-time Feed
API publishes events to Redis channels → `src/events/pubsub.ts` forwards to all connected WebSocket clients → frontend `useKudosFeed.ts` invalidates the React Query cache on each message.

### Video Upload
multer buffers the upload → API returns `202` immediately → BullMQ enqueues a transcode job → worker spawns ffmpeg as a child process (no memory buffering) → updates `KudoMedia.status = "ready"` when done.

### Key Constraints

| Constraint | Enforcement |
|------------|-------------|
| Giving budget 200 pts/month | `SELECT FOR UPDATE` on `GivingBudget` in transaction |
| Cannot send kudo to yourself | Service-layer check before DB write |
| Points 10–50 per kudo | Zod schema validation |
| No double-spend on redemption | Redis SET NX + SELECT FOR UPDATE |
| Video processing non-blocking | BullMQ + ffmpeg child process |
