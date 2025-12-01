# Deployment Guide - Vercel + NeonDB

This guide explains how to deploy your ORB Trading Suggestion app to Vercel with NeonDB PostgreSQL.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **NeonDB Account**: Sign up at [neon.tech](https://neon.tech)
3. **Alpaca API Keys**: From [alpaca.markets](https://alpaca.markets)

## Step 1: Set Up NeonDB

1. **Create a new project** at https://console.neon.tech
2. **Create a database** (e.g., "orb-trading-db")
3. **Copy the connection string**:
   - Format: `postgresql://username:password@host/database?sslmode=require`
   - Save this for later

## Step 2: Prepare Your Code for Deployment

### Update backend/package.json scripts:
Already done! The `vercel-build` script will:
- Generate Prisma Client
- Run database migrations
- Build TypeScript

### Environment Variables Needed:
```
DATABASE_URL=your_neondb_connection_string
ALPACA_API_KEY=your_alpaca_key
ALPACA_SECRET_KEY=your_alpaca_secret
ALPACA_BASE_URL=https://paper-api.alpaca.markets
JWT_SECRET=your_random_secure_string
JWT_EXPIRES_IN=7d
PORT=3000
NODE_ENV=production
```

## Step 3: Initialize Database Locally (First Time)

```bash
cd backend

# Install dependencies including Prisma
npm install

# Generate Prisma Client
npx prisma generate

# Create initial migration (local test first)
npx prisma migrate dev --name init

# View your database in Prisma Studio (optional)
npx prisma studio
```

## Step 4: Deploy to Vercel

### Option A: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from project root
cd /path/to/ORB-trading-suggestion
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? orb-trading-suggestion
# - Directory? ./
```

### Option B: Deploy via GitHub (Recommended)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Add authentication and deployment config"
   git push origin main
   ```

2. **Import to Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Vercel will auto-detect the configuration

3. **Add Environment Variables** in Vercel Dashboard:
   - Go to Project Settings → Environment Variables
   - Add all the variables listed in Step 2

4. **Deploy**:
   - Click "Deploy"
   - Vercel will build and deploy automatically

## Step 5: Run Database Migrations on Production

After first deployment:

```bash
# Install Vercel CLI if not already
npm install -g vercel

# Link to your project
vercel link

# Run migrations on production database
vercel env pull .env.production
DATABASE_URL="your_neondb_url" npx prisma migrate deploy
```

Or use Vercel's deployment command:
```bash
vercel --prod
```

## Step 6: Test Your Deployment

1. **Check Health Endpoint**:
   ```
   https://your-app.vercel.app/api/health
   ```

2. **Test Registration**:
   ```bash
   curl -X POST https://your-app.vercel.app/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
   ```

3. **Test Login**:
   ```bash
   curl -X POST https://your-app.vercel.app/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123"}'
   ```

## Architecture

```
Frontend (React + Vite)
    ↓
Vercel Edge Network
    ↓
Backend (Express API)
    ↓
NeonDB (PostgreSQL)
    ↓
User Auth + Watchlists
```

## Database Schema

**Users Table**:
- id (UUID)
- email (unique)
- password (hashed with bcrypt)
- name
- timestamps

**Watchlist Items Table**:
- id (UUID)
- userId (foreign key)
- symbol, price, tier
- ORB data (opening range, breakout %)
- expiration date
- timestamps

## Security Features

✅ **Password Hashing**: bcryptjs with 10 rounds
✅ **JWT Authentication**: 7-day expiration
✅ **Protected Routes**: Middleware checks tokens
✅ **Per-User Data**: Watchlists isolated by userId
✅ **SQL Injection Protection**: Prisma ORM parameterized queries

## Maintenance

### View Logs:
```bash
vercel logs
```

### Update Environment Variables:
```bash
vercel env add DATABASE_URL production
```

### Redeploy:
```bash
git push origin main  # Auto-deploys if connected to GitHub
# OR
vercel --prod
```

### Database Migrations:
```bash
# Create new migration locally
cd backend
npx prisma migrate dev --name add_new_field

# Deploy to production
DATABASE_URL="prod_url" npx prisma migrate deploy
```

## Troubleshooting

**"Cannot find module '@prisma/client'"**
- Run `npx prisma generate` in backend folder

**"Database connection error"**
- Check DATABASE_URL in Vercel environment variables
- Ensure NeonDB allows connections from Vercel IPs
- Verify connection string includes `?sslmode=require`

**"JWT Secret not found"**
- Add JWT_SECRET to Vercel environment variables
- Generate secure random string: `openssl rand -base64 32`

**"Migrations failed"**
- Run `npx prisma migrate deploy` manually
- Check Vercel build logs for errors

## Cost Estimates

- **Vercel**: Free tier (Hobby) includes:
  - 100 GB bandwidth
  - Unlimited deployments
  - Serverless functions

- **NeonDB**: Free tier includes:
  - 512 MB storage
  - Always-available compute
  - Autoscaling

- **Total**: $0/month for development/testing!

## Going to Production

For production with real money trading:

1. **Upgrade Plans**:
   - Vercel Pro: $20/month (custom domains, more bandwidth)
   - NeonDB Pro: $19/month (more storage, better performance)

2. **Add Monitoring**:
   - Vercel Analytics
   - Sentry for error tracking
   - Datadog/New Relic for APM

3. **Security Enhancements**:
   - Rate limiting (express-rate-limit)
   - HTTPS only (Vercel provides)
   - CORS restrictions
   - 2FA for accounts

4. **Backup Strategy**:
   - NeonDB automated backups
   - Export watchlist data daily

---

**Ready to deploy?** Follow the steps above and your ORB Trading app will be live!
