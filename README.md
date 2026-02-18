# Banau Monorepo

Banau is a modern, multi-tenant SaaS starter built with Turborepo, NestJS, Vite, Prisma, and PostgreSQL. This monorepo contains everything you need for a scalable, production-ready SaaS platform.

---

## Table of Contents

- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Development](#development)
- [Building for Production](#building-for-production)
- [Testing, Linting & Formatting](#testing-linting--formatting)
- [Deployment](#deployment)
  - [Vercel](#vercel)
  - [Render](#render)
- [Environment Variables](#environment-variables)
- [Custom Domain & CORS](#custom-domain--cors)
- [Packages](#packages)
- [Useful Links](#useful-links)

---

## Project Structure

```
apps/
	backend/    # NestJS API (monolithic, multi-tenant)
	frontend/   # Vite + React (multi-tenant, subdomain-aware)
packages/
	db/         # Prisma schema, migrations, and client
	shared/     # Shared DTOs, types, and utilities
```

---

## Getting Started

1. **Clone the repository:**

   ```bash
   git clone <your-repo>
   cd banau
   ```

2. **Install dependencies:**

   ```bash
   pnpm install
   ```

3. **Set up your database:**
   - Create a PostgreSQL database (Neon, Supabase, etc.)
   - Copy your connection string.
   - Update `DATABASE_URL` in `packages/db/.env`.

4. **Push the database schema:**
   ```bash
   pnpm --filter @repo/db db:push
   ```

---

## Development

- **Start all apps:**
  ```bash
  pnpm dev
  ```
- **Start only backend:**
  ```bash
  pnpm --filter backend dev
  ```
  OR
  ```bash
   cd apps/backend && pnpm dev
  ```
- **Start only frontend:**
  ```bash
  pnpm --filter frontend dev
  ```
  OR
  ```bash
  cd apps/frontend  && pnpm dev
  ```

---

## Building for Production

```bash
pnpm build
```

---

## Testing, Linting & Formatting

- **Test (frontend):**
  ```bash
  pnpm --filter frontend test
  ```
- **Lint:**
  ```bash
  pnpm lint
  ```
- **Format:**
  ```bash
  pnpm format
  ```

---

## Deployment

### Vercel

See `DEPLOYMENT.md` for a full step-by-step guide for deploying both backend and frontend to Vercel, including environment variables, custom domains, and CORS.

### Render (Backend)

You can also deploy the backend API to [Render](https://render.com/). Render provides a simple way to host Node.js servers with environment variable management and automatic deploys from GitHub. See [Render banau on  main via  v24.2.0 took 44m43s
❯ pnpm --filter backend dev
No projects matched the filters in "/Users/developer/Projects/banau"s](https://render.com/docs/deploy-node-express-app) for details.

---

## Environment Variables

- **Backend:**
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `JWT_EXPIRES_IN`
- **Frontend:**
  - `VITE_API_URL`
  - `VITE_APP_TITLE`

See `.env.example` files in each app/package for details.

---

## Image Storage (Cloudinary)

Banau uses [Cloudinary](https://cloudinary.com/) for image upload and storage in the backend. To enable image features, set the following environment variables in your backend `.env` file:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

You can obtain these credentials from your Cloudinary dashboard. **Never commit your real secrets to version control.**

These variables are required for features such as user avatars, tenant logos, and other media uploads.

---

## Custom Domain & CORS

- Add your domain and wildcard subdomains in Vercel.
- Update CORS origins in `apps/backend/src/main.ts` as shown in `DEPLOYMENT.md`.

---

## Packages

- **@repo/db:** Prisma schema, migrations, and generated client.
- **@repo/shared:** Shared DTOs and types for API and frontend.

---

## Useful Links

- [DEPLOYMENT.md](DEPLOYMENT.md) — Vercel deployment guide
- [Prisma](https://www.prisma.io/)
- [NestJS](https://nestjs.com/)
- [Vite](https://vitejs.dev/)
- [Turborepo](https://turbo.build/)

---
