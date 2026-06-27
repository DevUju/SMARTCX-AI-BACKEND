# SmartCX AI Backend

A NestJS backend for managing tasks, projects, events, and productivity analytics with PostgreSQL.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 12+ ([Setup Guide](./POSTGRESQL_SETUP.md))
- npm or yarn

### Setup

1. **Install dependencies**
```bash
npm install
```

2. **Configure PostgreSQL** (see [POSTGRESQL_SETUP.md](./POSTGRESQL_SETUP.md))
```bash
# Create database and user
psql -U postgres
# Follow instructions in POSTGRESQL_SETUP.md
```

3. **Configure environment variables**
Edit `.env` file:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=smartcx_ai
```

4. **Start the server**
```bash
# Development mode (with auto-reload)
npm run start:dev

# Production mode
npm run start:prod
```

Server runs on `http://localhost:3000`

### 5. (Optional) Seed Test Data
```bash
# Populate database with test users and data
npm run seed

# Test credentials after seeding:
# Email: manager@smartcx.local
# Password: password123
```

See [SEEDER_GUIDE.md](./SEEDER_GUIDE.md) for details on test data.

---

## 📚 API Documentation

### Base URL
```
http://localhost:3000
```

### Authentication Endpoints
- `POST /auth/signup` - Register new user
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user profile

### Task Endpoints
- `GET /tasks` - Get all tasks
- `POST /tasks` - Create task
- `GET /tasks/:id` - Get specific task
- `PUT /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task
- `PATCH /tasks/:id/complete` - Mark task as complete

### Project Endpoints
- `GET /projects` - Get all projects
- `POST /projects` - Create project
- `GET /projects/:id` - Get specific project
- `PUT /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project

### Event Endpoints
- `GET /events` - Get all events
- `POST /events` - Create event
- `GET /events/:id` - Get specific event
- `PUT /events/:id` - Update event
- `DELETE /events/:id` - Delete event

### Analytics Endpoints
- `GET /analytics/productivity` - Get productivity metrics
- `GET /analytics/summary` - Get task summary

---

## 🗄️ Database

### Database Type: PostgreSQL

### Tables
- `user` - User accounts
- `task` - Tasks and todo items
- `project` - Projects
- `event` - Calendar events

### Connection String
```
postgresql://postgres:postgres@localhost:5432/smartcx_ai
```

For detailed setup instructions, see [POSTGRESQL_SETUP.md](./POSTGRESQL_SETUP.md)

---

## 🏗️ Architecture

```
src/
├── auth/              # Authentication (JWT, login, signup)
├── tasks/             # Task management
├── projects/          # Project management
├── events/            # Event management
├── analytics/         # Productivity analytics
├── entities/          # Database models
├── config/            # Configuration
├── common/            # Utilities
├── app.module.ts      # App module
└── main.ts            # Entry point
```

---

## 🔐 Security Features

- ✅ JWT authentication (7-day tokens)
- ✅ Password hashing (bcrypt)
- ✅ CORS configuration
- ✅ DTO validation
- ✅ SQL injection protection (TypeORM)
- ✅ SSL support (production)

---

## 📝 Development

### Running Tests
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Linting
```bash
npm run lint
```

### Formatting
```bash
npm run format
```

### Building for Production
```bash
npm run build
```

---

## 🔧 Environment Variables

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# JWT Configuration
JWT_SECRET=your-secret-key-here

# PostgreSQL Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=smartcx_ai
```

---

## 🚨 Troubleshooting

### PostgreSQL Connection Issues
- Verify PostgreSQL is running
- Check `.env` credentials
- See [POSTGRESQL_SETUP.md](./POSTGRESQL_SETUP.md)

### Port Already in Use
```bash
# Change PORT in .env
PORT=3001
```

### Tables Not Created
- Restart the server
- Check logs for errors
- Verify database connection

---

## 📦 Dependencies

- **NestJS 11** - Framework
- **TypeORM 0.3** - ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Class Validator** - Input validation

---

## 🚀 Deployment

### Docker
```bash
docker build -t smartcx-backend .
docker run -p 3000:3000 smartcx-backend
```

### Environment Setup
```bash
NODE_ENV=production
JWT_SECRET=strong-secret-here
DB_HOST=your-postgres-host
DB_USER=your-db-user
DB_PASSWORD=strong-password
```

---

## 📖 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [JWT Documentation](https://jwt.io)

---

## 📞 Support

For issues or questions:
1. Check logs: `npm run start:dev`
2. Review [POSTGRESQL_SETUP.md](./POSTGRESQL_SETUP.md)
3. Check API endpoints documentation above

---

**Last Updated:** 2026-06-23
**Database:** PostgreSQL 12+
**Version:** 1.0.0
