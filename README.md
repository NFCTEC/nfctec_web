# NFCTEC Website CMS (nfctec_web)

Content management API and admin panel for [client-site-muse](https://github.com/NFCTEC/client-site-muse).

## Stack

- **API**: NestJS + Prisma + PostgreSQL
- **Admin**: React + Vite + Ant Design
- **Auth**: JWT (admin only; C-end dashboard deferred)

## Quick start (local)

### 1. Start PostgreSQL

```bash
docker compose -f docker/docker-compose.yml up -d
```

### 2. Configure API

```bash
cp api/.env.example api/.env
cd api
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run start:dev
```

API: http://localhost:3000/api/health

### 3. Start Admin

```bash
cd apps/admin
npm install
npm run dev
```

Admin: http://localhost:5173

**Default login** (change after first login):

- Email: `admin@nfctec.com`
- Password: `changeme123`

## VPS deployment (outline)

1. Install Node 20+, PostgreSQL 16, Nginx, PM2 (or Docker).
2. Set production values in `api/.env` (`JWT_*`, `DATABASE_URL`, `CORS_ORIGINS`, `PUBLIC_API_URL`).
3. `cd api && npm ci && npx prisma migrate deploy && npm run build`
4. `cd apps/admin && npm ci && npm run build` — serve `dist/` via Nginx at `admin.nfctec.com`.
5. Run API with PM2: `pm2 start dist/main.js --name nfctec-api`
6. Point Nginx `/api` and `/uploads` to the API process.

## API routes

| Area | Prefix |
|------|--------|
| Health | `GET /api/health` |
| Auth | `POST /api/auth/login`, `/refresh`, `/logout`, `GET /api/auth/me` |
| Admin CMS | `/api/admin/*` (JWT required) |
| Public (for SSR frontend) | `/api/public/*` |

## Monorepo scripts (from root)

```bash
npm install
npm run dev:api
npm run dev:admin
```
