# Render Deployment Guide - Backend

## Quick Deploy to Render

1. **Go to [render.com](https://render.com)** and sign in with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the `banau` repository

3. **Configure Service**
   - **Name**: `banau-backend`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: (leave empty - use repo root)
   - **Runtime**: `Node`
   - **Build Command**:
     ```bash
     pnpm install --frozen-lockfile && pnpm --filter @repo/shared build && pnpm --filter @repo/db build && pnpm turbo run build --filter=backend
     ```
   - **Start Command**:
     ```bash
     node apps/backend/dist/main.js
     ```
   - **Instance Type**: Free (or paid for better performance)

4. **Add Environment Variables**
   Click "Advanced" → Add these:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `JWT_SECRET`: Your secure secret key
   - `JWT_EXPIRES_IN`: `7d`
   - `NODE_ENV`: `production`
   - `PORT`: `3000`

5. **Click "Create Web Service"**

Your API will be available at: `https://banau-backend.onrender.com`

## Advantages over Vercel

- ✅ No serverless complexity
- ✅ Persistent connections (better for databases)
- ✅ WebSockets support
- ✅ Simpler deployment
- ✅ Free tier available

## Test Your API

```bash
curl -X POST https://banau-backend.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```
