# PostgreSQL Setup Guide for SmartCX AI

## Installation

### macOS
```bash
# Using Homebrew
brew install postgresql@15
brew services start postgresql@15

# Verify installation
psql --version
```

### Windows
1. Download from https://www.postgresql.org/download/windows/
2. Run the installer
3. Remember the password you set for the `postgres` user
4. PostgreSQL runs as a service automatically

### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# Start the service
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

---

## Setup SmartCX AI Database

### Step 1: Connect to PostgreSQL
```bash
# macOS/Linux
psql -U postgres

# Windows (using psql)
psql -U postgres
```

### Step 2: Create Database and User
```sql
-- Create the database
CREATE DATABASE smartcx_ai;

-- Create a user (or use default postgres user)
CREATE USER smartcx_user WITH PASSWORD 'smartcx_password';

-- Grant privileges
ALTER ROLE smartcx_user SET client_encoding TO 'utf8';
ALTER ROLE smartcx_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE smartcx_user SET default_transaction_deferrable TO on;
ALTER ROLE smartcx_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE smartcx_ai TO smartcx_user;

-- Connect to the database and grant schema privileges
\c smartcx_ai
GRANT ALL PRIVILEGES ON SCHEMA public TO smartcx_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO smartcx_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO smartcx_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO smartcx_user;

-- Exit psql
\q
```

---

## Configure Backend

### Update .env file
The `.env` file has been updated with PostgreSQL settings:

```env
# PostgreSQL Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=smartcx_ai
```

**Modify these values** to match your PostgreSQL setup:
- `DB_HOST` - PostgreSQL server address (default: localhost)
- `DB_PORT` - PostgreSQL port (default: 5432)
- `DB_USER` - PostgreSQL user (default: postgres)
- `DB_PASSWORD` - PostgreSQL password (change from default!)
- `DB_NAME` - Database name (default: smartcx_ai)

---

## Start the Backend

### Step 1: Install dependencies
```bash
cd SMARTCX-AI-BACKEND-main
npm install
```

### Step 2: Verify PostgreSQL is running
```bash
# Test connection
psql -U postgres -d smartcx_ai
```

### Step 3: Start the backend
```bash
npm run start:dev
```

The backend will automatically:
1. Connect to PostgreSQL
2. Create tables (synchronize database schema)
3. Start listening on http://localhost:3000

---

## Verify Setup

### Check if backend is running
```bash
curl http://localhost:3000
# Should return: {"message":"Hello World!"}
```

### Check tables in PostgreSQL
```bash
psql -U postgres -d smartcx_ai

# List tables
\dt

# You should see:
# - public | event
# - public | project
# - public | task
# - public | user

# Exit
\q
```

---

## Useful PostgreSQL Commands

```bash
# Connect to database
psql -U postgres -d smartcx_ai

# List databases
\l

# List tables
\dt

# Describe a table
\d tablename

# View table contents
SELECT * FROM "user";

# Delete database (be careful!)
DROP DATABASE smartcx_ai;

# Exit psql
\q
```

---

## Troubleshooting

### "Connection refused"
- Check if PostgreSQL is running: `brew services list` (macOS)
- Restart PostgreSQL: `brew services restart postgresql@15`

### "Authentication failed for user"
- Verify password in .env matches PostgreSQL user
- Try connecting manually: `psql -U postgres -d smartcx_ai`

### "Database does not exist"
- Create the database using the SQL commands above

### "Tables not created"
- Restart backend: `npm run start:dev`
- Check backend console for errors
- Verify database is created and accessible

### Port already in use
- PostgreSQL default: 5432
- Change DB_PORT in .env and restart

---

## Docker Setup (Alternative)

If you prefer to use Docker:

```bash
# Pull PostgreSQL image
docker pull postgres:15

# Run PostgreSQL container
docker run --name smartcx_postgres \
  -e POSTGRES_DB=smartcx_ai \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgres:15

# Verify running
docker ps

# Connect to database
psql -h localhost -U postgres -d smartcx_ai
```

---

## Production Setup

For production environments:

1. **Use strong passwords** - Change default postgres password
2. **Enable SSL** - Configure `.env` with SSL certificate paths
3. **Use managed database** - Consider AWS RDS, Google Cloud SQL, or Azure Database
4. **Backup regularly** - Set up automated PostgreSQL backups
5. **Monitor performance** - Use PostgreSQL monitoring tools
6. **Scale database** - Use connection pooling (PgBouncer)

---

## Reset Database

To completely reset and start fresh:

```bash
# Connect to PostgreSQL
psql -U postgres

# Drop existing database
DROP DATABASE IF EXISTS smartcx_ai;

# Create new database
CREATE DATABASE smartcx_ai;

# Grant privileges to user
GRANT ALL PRIVILEGES ON DATABASE smartcx_ai TO postgres;

# Exit
\q

# Restart backend to recreate tables
npm run start:dev
```

---

## Performance Tips

1. **Enable Query Logging** in .env:
   ```env
   # For development
   LOGGING=true
   ```

2. **Create Indexes** - Already configured in entities (UUID primary keys)

3. **Connection Pooling** - Consider pgBouncer for production

4. **Regular Maintenance**:
   ```sql
   ANALYZE smartcx_ai;
   VACUUM ANALYZE smartcx_ai;
   ```

---

For more information, visit: https://www.postgresql.org/docs/
