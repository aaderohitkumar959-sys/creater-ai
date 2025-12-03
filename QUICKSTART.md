# Quick Start: Running CreatorAI Platform

## Current Status
✅ Frontend: Running at http://localhost:3000
⚠️ Backend: Needs database connection

## Fix: Start PostgreSQL Database

### Option 1: Using Docker (Recommended - Easiest)
```bash
# Install Docker Desktop from https://www.docker.com/products/docker-desktop/

# Then run this command:
docker run --name creatorai-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=creatorai -p 5432:5432 -d postgres:16-alpine

# Verify it's running:
docker ps
```

### Option 2: Install PostgreSQL Directly
1. Download from: https://www.postgresql.org/download/windows/
2. Install with default settings
3. Remember the password you set
4. Create database:
```bash
psql -U postgres
CREATE DATABASE creatorai;
\q
```

### Option 3: Use Free Cloud Database
- **Supabase**: https://supabase.com (Free tier)
- **Neon**: https://neon.tech (Free tier)
- Get DATABASE_URL and update apps/api/.env

## After Database is Running

1. **Run Migrations:**
```bash
cd packages/database
npx prisma migrate deploy
npx prisma db seed
```

2. **Restart Backend:**
The backend will automatically detect the database and start successfully.

3. **Access Platform:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Admin Dashboard: http://localhost:3000/admin

## Current Environment Setup

**Frontend (.env.local):**
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
```

**Backend (.env):**
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/creatorai?schema=public
```

## Troubleshooting

**If backend still crashes:**
1. Check PostgreSQL is running: `docker ps` or check Windows Services
2. Verify connection: `psql -U postgres -d creatorai`
3. Check logs in terminal where backend is running

**If frontend can't reach backend:**
1. Verify backend is running (no errors in terminal)
2. Check http://localhost:3001 shows something
3. Verify .env.local has NEXT_PUBLIC_API_URL set
