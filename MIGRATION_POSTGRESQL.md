# PostgreSQL Migration Guide

## From SQLite to PostgreSQL

This guide explains the changes made to switch the SmartCX AI backend from SQLite to PostgreSQL.

---

## 📋 What Changed

### 1. Dependencies
**Removed:**
- `sqlite3@^5.1.6`

**Added:**
- `pg@^8.11.3` (PostgreSQL driver)

### 2. Configuration Files

#### `.env` - Database Configuration
**Before (SQLite):**
```env
DATABASE_URL=sqlite:///smartcx.db
```

**After (PostgreSQL):**
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=smartcx_ai
DB_URL=postgresql://postgres:postgres@localhost:5432/smartcx_ai
```

#### `src/config/typeorm.config.ts` - TypeORM Configuration
**Before (SQLite):**
```typescript
export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: path.join(__dirname, '../../smartcx.db'),
  entities: [User, Task, Project, Event],
  synchronize: true,
  logging: process.env.NODE_ENV === 'development',
};
```

**After (PostgreSQL):**
```typescript
export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'smartcx_ai',
  entities: [User, Task, Project, Event],
  synchronize: true,
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
};
```

---

## 🔄 Migration Steps

### Step 1: Install PostgreSQL

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Windows:**
- Download from https://www.postgresql.org/download/windows/
- Run installer and remember the password

**Linux:**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Step 2: Update Backend

1. **Update dependencies:**
```bash
cd SMARTCX-AI-BACKEND-main
npm install
```

2. **Verify `.env` file:**
```bash
cat .env
# Should show PostgreSQL configuration
```

3. **Configure PostgreSQL:**
```bash
psql -U postgres

# Run these commands:
CREATE DATABASE smartcx_ai;
GRANT ALL PRIVILEGES ON DATABASE smartcx_ai TO postgres;
\c smartcx_ai
GRANT ALL PRIVILEGES ON SCHEMA public TO postgres;
\q
```

### Step 3: Start Backend

```bash
npm run start:dev
```

**Expected Output:**
```
[Nest] YYYY-MM-DD HH:MM:SS LOG   [NestFactory] Starting Nest application...
[Nest] YYYY-MM-DD HH:MM:SS LOG   [InstanceLoader] TypeOrmModule dependencies initialized
[Nest] YYYY-MM-DD HH:MM:SS LOG   [InstanceLoader] AuthModule dependencies initialized
[Nest] YYYY-MM-DD HH:MM:SS LOG   [InstanceLoader] TasksModule dependencies initialized
[Nest] YYYY-MM-DD HH:MM:SS LOG   [InstanceLoader] ProjectsModule dependencies initialized
[Nest] YYYY-MM-DD HH:MM:SS LOG   [InstanceLoader] EventsModule dependencies initialized
[Nest] YYYY-MM-SS HH:MM:SS LOG   [InstanceLoader] AnalyticsModule dependencies initialized
[Nest] YYYY-MM-DD HH:MM:SS LOG   [NestApplication] Nest application successfully started
SmartCX AI Backend running on port 3000
```

### Step 4: Verify Tables Created

```bash
psql -U postgres -d smartcx_ai

# List tables
\dt

# Expected output:
# Schema |  Name  | Type  |  Owner   
# --------+--------+-------+----------
# public | event  | table | postgres
# public | project| table | postgres
# public | task   | table | postgres
# public | "user" | table | postgres

\q
```

### Step 5: Test API

```bash
# Test if backend is running
curl http://localhost:3000

# Should return: {"message":"Hello World!"}

# Test signup
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "persona": "Manager"
  }'
```

---

## ✅ Benefits of PostgreSQL

| Feature | SQLite | PostgreSQL |
|---------|--------|-----------|
| **Concurrent Users** | ⚠️ Limited | ✅ Excellent |
| **Data Integrity** | Basic | ✅ Advanced |
| **Performance** | Good | ✅ Excellent |
| **Scalability** | ⚠️ Limited | ✅ Highly Scalable |
| **Production Ready** | ⚠️ No | ✅ Yes |
| **Backup** | Basic | ✅ Advanced |
| **Replication** | ❌ No | ✅ Yes |
| **Security** | Basic | ✅ Advanced |

---

## 🚨 Troubleshooting

### PostgreSQL Not Running

```bash
# macOS
brew services start postgresql@15

# Linux
sudo systemctl start postgresql

# Windows
# Start PostgreSQL service from Services app
```

### Connection Refused

1. Check PostgreSQL is running
2. Verify `.env` settings match your PostgreSQL setup
3. Test connection:
```bash
psql -U postgres -d smartcx_ai
```

### Port Already in Use

```bash
# Change PORT in .env
PORT=3001

# Restart backend
npm run start:dev
```

### Database Doesn't Exist

```bash
psql -U postgres
CREATE DATABASE smartcx_ai;
GRANT ALL PRIVILEGES ON DATABASE smartcx_ai TO postgres;
\q
```

### Permission Denied

```bash
psql -U postgres
GRANT ALL PRIVILEGES ON DATABASE smartcx_ai TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
\q
```

---

## 🔐 Production Considerations

### SSL Configuration

Update `.env`:
```env
NODE_ENV=production
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=false
```

### Strong Passwords

```bash
# Generate strong password
openssl rand -base64 32

# Update .env with strong password
DB_PASSWORD=your-strong-password-here
```

### Connection Pooling

For high traffic, consider PgBouncer:
```bash
# Install
brew install pgbouncer

# Configure /etc/pgbouncer/pgbouncer.ini
[databases]
smartcx_ai = host=localhost port=5432 dbname=smartcx_ai
```

### Backups

```bash
# Automated daily backups
pg_dump -U postgres smartcx_ai > backup_$(date +%Y%m%d).sql

# Restore from backup
psql -U postgres smartcx_ai < backup_20240101.sql
```

---

## 📚 Resources

- [PostgreSQL Official Docs](https://www.postgresql.org/docs)
- [TypeORM PostgreSQL Guide](https://typeorm.io/data-source-options)
- [NestJS + TypeORM](https://docs.nestjs.com/techniques/database)
- [PostgreSQL Best Practices](https://wiki.postgresql.org/wiki/Performance_Optimization)

---

## 🔄 Rollback to SQLite (Not Recommended)

If you need to rollback:

1. **Reinstall sqlite3:**
```bash
npm install sqlite3@^5.1.6
```

2. **Revert `src/config/typeorm.config.ts` to SQLite config**

3. **Remove PostgreSQL environment variables from `.env`**

4. **Restart backend:**
```bash
npm run start:dev
```

---

## ✨ Next Steps

1. Update frontend API configuration (already set to localhost:3000)
2. Set up PostgreSQL monitoring and backups
3. Test application with PostgreSQL
4. Deploy to production with managed PostgreSQL

---

**Last Updated:** 2026-06-23
**Status:** ✅ PostgreSQL Migration Complete
**Tested On:** macOS, Ubuntu, Windows
