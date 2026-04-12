# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Good Job** là hệ thống peer recognition và reward nội bộ cho Amanotes. Users gửi "Kudos" kèm điểm (10–50 pts) cho đồng nghiệp với Core Value tag, feed real-time, và đổi điểm lấy phần thưởng.

## Tech Stack

- **Frontend:** `apps/web` — React 18, TypeScript, Vite, Material UI v6, React Query, Zustand, React Router v6
- **Backend:** `apps/api` — Express 4, TypeScript, Prisma ORM, PostgreSQL, Redis (ioredis), BullMQ, WebSocket (ws)
- **Monorepo:** npm workspaces

## Commands

```bash
# Khởi động toàn bộ stack
docker-compose up

# Backend (apps/api)
npm run dev -w apps/api          # dev server với tsx watch
npm run build -w apps/api        # TypeScript check
npm run lint -w apps/api         # ESLint
npm run test -w apps/api         # chạy tất cả tests (vitest)
npm run test -w apps/api -- --reporter=verbose --testNamePattern="budget"  # chạy 1 test cụ thể

# Frontend (apps/web)
npm run dev -w apps/web          # Vite dev server (port 5173)
npm run build -w apps/web        # TypeScript check + Vite build
npm run lint -w apps/web         # ESLint
npm run test -w apps/web         # vitest

# Database
cd apps/api && npx prisma migrate dev --name <migration-name>   # tạo migration mới
cd apps/api && npx prisma studio                                 # GUI xem DB
cd apps/api && npx prisma db seed                                # seed data

# Root
npm run lint        # lint cả api + web
npm run build       # build cả api + web
npm run test        # test cả api + web
```

## Architecture

### Monorepo Layout

```
good-job/
├── apps/
│   ├── api/                   # Express backend
│   │   ├── prisma/schema.prisma
│   │   └── src/
│   │       ├── app.ts          # Express factory (middleware, routes)
│   │       ├── server.ts       # HTTP + WebSocket server entry
│   │       ├── lib/            # prisma.ts, redis.ts — singletons
│   │       ├── middleware/     # auth.ts — JWT verify
│   │       ├── routes/         # auth, kudos, reactions, rewards, users
│   │       ├── services/       # kudos, points, rewards — business logic
│   │       ├── events/pubsub.ts  # Redis pub/sub wrapper
│   │       └── jobs/           # video.worker.ts (BullMQ), budget-reset.ts (cron)
│   └── web/                   # React frontend
│       └── src/
│           ├── App.tsx         # routes + ProtectedRoute
│           ├── main.tsx        # QueryClient, MUI Theme, BrowserRouter
│           ├── store/          # auth.store.ts — Zustand + localStorage persist
│           ├── hooks/          # useKudosFeed.ts — infinite query + WebSocket sync
│           ├── pages/          # Feed, SendKudo, Rewards, Profile, Login
│           └── components/     # KudoCard, Navbar
├── docker-compose.yml
└── .env.example
```

### Core Domain Logic

**Points Ledger** — mọi thay đổi điểm đều được ghi vào `LedgerEntry` (append-only). Balance của user = tổng `receivedBalance` trên bảng `User`, được cập nhật atomically trong transaction.

**Giving Budget** — mỗi user có 200 pts/tháng để tặng (separate khỏi received balance). Reset ngày 1 hàng tháng qua cron trong `src/jobs/budget-reset.ts`. Enforce bằng `SELECT FOR UPDATE` trong Prisma transaction.

**Double-spend prevention** — `src/services/rewards.service.ts`: Redis `SET NX` idempotency key (60s TTL) + DB `SELECT FOR UPDATE` để block concurrent redemption requests.

**Real-time feed** — API publish events lên Redis channel → `src/events/pubsub.ts` forward tới WebSocket clients. Frontend `useKudosFeed.ts` invalidate React Query cache khi nhận WS message.

**Video upload** — multer pipe stream ra temp file → API trả 202 ngay → BullMQ enqueue job → worker spawn `ffmpeg` child_process (không load vào memory) → update `KudoMedia.status = "ready"`.

### API Endpoints

| Method | Path | Auth | Mô tả |
|--------|------|------|-------|
| POST | `/api/auth/register` | — | Đăng ký + tạo GivingBudget |
| POST | `/api/auth/login` | — | Login → JWT |
| GET | `/api/users` | ✓ | Danh sách users (cho recipient picker) |
| GET | `/api/users/me` | ✓ | Profile + balance + giving budget |
| POST | `/api/kudos` | ✓ | Gửi kudo (multipart/form-data) |
| GET | `/api/kudos?cursor=&limit=` | ✓ | Feed với cursor pagination |
| POST | `/api/kudos/:id/reactions` | ✓ | Thêm emoji reaction |
| POST | `/api/kudos/:id/comments` | ✓ | Thêm comment |
| GET | `/api/rewards` | ✓ | Danh sách rewards |
| POST | `/api/rewards/:id/redeem` | ✓ | Đổi reward (idempotent) |
| GET | `/health` | — | Health check |

### Key Constraints

| Constraint | Enforcement |
|---|---|
| Giving budget 200 pts/month | `SELECT FOR UPDATE` trên `GivingBudget` trong tx |
| Không tự gửi kudo cho mình | Service-layer check trước khi vào DB |
| Points 10–50 per kudo | Zod schema validation |
| No double-spend redemption | Redis SET NX + SELECT FOR UPDATE |
| Video non-blocking | BullMQ + ffmpeg child_process |

### Environment Variables

Xem `.env.example` để biết tất cả biến. Bắt buộc khi dev local:
- `DATABASE_URL` — PostgreSQL connection string
- `REDIS_URL` — Redis connection string
- `JWT_SECRET` — secret cho JWT signing
