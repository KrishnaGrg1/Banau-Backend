# Deployment Guide - Banau

## 🚀 Quick Deploy

### Prerequisites
1. [Vercel Account](https://vercel.com)
2. [Neon PostgreSQL](https://neon.tech) or any PostgreSQL database
3. GitHub repository

---

## 📦 Step 1: Prepare Database

### Option A: Neon (Recommended)
1. Go to [console.neon.tech](https://console.neon.tech)
2. Create new project
3. Copy connection string
4. It looks like: `postgresql://user:password@host.neon.tech/neondb?sslmode=require`

### Option B: Supabase
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings > Database
4. Copy connection string (Transaction pooler)

### Apply Database Schema
```bash
cd /Users/developer/Projects/banau/banau
cp apps/backend/.env packages/db/.env
# Update DATABASE_URL in packages/db/.env
pnpm --filter @repo/db db:push
```

---

## 🎯 Step 2: Deploy Backend (API)

### Via Vercel Dashboard

1. **Import Project**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your repository
   - Select `apps/backend` as root directory

2. **Configure Build Settings**
   - Framework Preset: **Other**
   - Root Directory: `apps/backend`
   - Build Command: `cd ../.. && pnpm --filter @repo/db build && pnpm turbo run build --filter=banau`
   - Output Directory: `dist`
   - Install Command: `pnpm install`

3. **Add Environment Variables**
   ```
   DATABASE_URL=postgresql://...your-neon-url...
   JWT_SECRET=your-super-secret-key-min-32-chars
   JWT_EXPIRES_IN=7d
   NODE_ENV=production
   ```

4. **Deploy**
   - Click "Deploy"
   - Note your API URL: `https://your-backend.vercel.app`

### Via CLI (Alternative)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy from backend directory
cd apps/backend
vercel --prod

# Set environment variables
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add JWT_EXPIRES_IN
```

---

## 🌐 Step 3: Deploy Frontend

### Via Vercel Dashboard

1. **Import Project** (or add to existing)
   - Select `apps/frontend` as root directory

2. **Configure Build Settings**
   - Framework Preset: **Vite**
   - Root Directory: `apps/frontend`
   - Build Command: `cd ../.. && pnpm turbo run build --filter=frontend`
   - Output Directory: `dist`
   - Install Command: `pnpm install`

3. **Add Environment Variables**
   ```
   VITE_API_URL=https://your-backend.vercel.app/api
   VITE_APP_TITLE=Banau
   ```

4. **Deploy**
   - Click "Deploy"
   - Your frontend URL: `https://your-app.vercel.app`

### Via CLI (Alternative)

```bash
cd apps/frontend
vercel --prod

# Set environment variables
vercel env add VITE_API_URL
vercel env add VITE_APP_TITLE
```

---

## 🔗 Step 4: Configure Custom Domain (Optional)

### Add Custom Domain to Frontend
1. Go to Vercel Project Settings > Domains
2. Add your domain: `banau.com`
3. Add wildcard subdomain: `*.banau.com`
4. Update DNS records as instructed

### DNS Configuration
Add these records to your domain:

```
Type    Name    Value
A       @       76.76.21.21 (Vercel IP)
A       *       76.76.21.21 (Vercel IP)
CNAME   www     cname.vercel-dns.com
```

### Backend Domain (Optional)
- Add `api.banau.com` to backend project
- Update `VITE_API_URL` in frontend to `https://api.banau.com`

---

## 🔒 Step 5: Update CORS Settings

Update `apps/backend/src/main.ts`:

```typescript
app.enableCors({
  origin: [
    'https://banau.com',
    'https://www.banau.com',
    'https://*.banau.com',
    'http://localhost:3000' // for development
  ],
  credentials: true,
});
```

Redeploy backend after changes.

---

## 🔄 Step 6: Continuous Deployment

### Automatic Deployments
Vercel automatically deploys on:
- **Production**: Push to `main` branch
- **Preview**: Push to any other branch or PR

### Manual Deployments
```bash
# Production
vercel --prod

# Preview
vercel
```

---

## 📊 Monitoring & Logs

### View Logs
```bash
# Backend logs
vercel logs https://your-backend.vercel.app

# Frontend logs
vercel logs https://your-frontend.vercel.app
```

### Vercel Dashboard
- Real-time logs
- Analytics
- Deployment history
- Environment variables

---

## 🎯 Quick Checklist

- [ ] Database created and schema applied
- [ ] Backend deployed with environment variables
- [ ] Frontend deployed with API URL configured
- [ ] CORS configured for your domains
- [ ] Custom domain configured (optional)
- [ ] Test login/register flows
- [ ] Test website creation
- [ ] Test subdomain routing

---

## 🐛 Troubleshooting

### Backend Issues

**Error: Cannot connect to database**
- Check DATABASE_URL is correct
- Ensure database allows connections from Vercel IPs
- For Neon: Use connection pooler URL

**Error: Module not found @repo/db**
- Ensure build command includes `--filter=@repo/backend`
- Check pnpm-workspace.yaml is present

### Frontend Issues

**Error: API calls failing**
- Check VITE_API_URL is set correctly
- Verify CORS is configured on backend
- Check backend is deployed and running

**Subdomain routing not working**
- Ensure wildcard domain `*.banau.com` is added
- Check DNS records are correct
- Wait for DNS propagation (up to 48 hours)

### Build Issues

**Turborepo build failing**
- Ensure build command starts from root: `cd ../..`
- Check all workspace packages are properly linked
- Run `pnpm install` in root

---

## 🚀 Production URLs

After deployment, your app will be available at:

- **Admin**: `https://admin.banau.com` or `https://banau.com/login`
- **API**: `https://api.banau.com` or `https://your-backend.vercel.app`
- **Public Sites**: `https://[subdomain].banau.com`

---

## 📝 Post-Deployment

1. **Test Authentication**
   - Register a new account
   - Login
   - Logout

2. **Test Website Creation**
   - Create a website
   - Publish it
   - Test preview and live URLs

3. **Monitor Performance**
   - Check Vercel Analytics
   - Monitor error logs
   - Set up alerts

4. **Security**
   - Rotate JWT_SECRET regularly
   - Monitor API usage
   - Enable rate limiting (add middleware)

---

## 💡 Tips

- Use Vercel's preview deployments for testing
- Keep staging environment separate
- Use environment-specific database
- Enable Vercel Analytics for insights
- Set up custom error pages
- Configure build caching for faster deploys

---

## 📚 Resources

- [Vercel Documentation](https://vercel.com/docs)
- [TanStack Start Deployment](https://tanstack.com/start/latest/docs/deployment)
- [NestJS Deployment](https://docs.nestjs.com/deployment)
- [Turborepo Deployment](https://turbo.build/repo/docs/handbook/deploying-with-docker)
