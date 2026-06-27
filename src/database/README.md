# Database Directory

This directory contains database configuration and utilities for SmartCX AI backend.

## 📁 Structure

```
database/
├── seeds/              # Database seeding utilities
│   ├── seed.service.ts  # Main seeding logic
│   ├── seed.module.ts   # NestJS module for seeding
│   ├── seed.command.ts  # CLI command to run seeder
│   └── index.ts         # Exports
```

## 🌱 Database Seeding

The seeder populates your database with test data for development and testing.

### Quick Start

```bash
# Run the seeder
npm run seed
```

This creates:
- 4 test users with different personas
- 9 test tasks with various statuses
- 7 test projects with progress tracking
- 8 test calendar events

### Test Credentials

After seeding, use these to login:

- **Email:** manager@smartcx.local
- **Password:** password123

[See SEEDER_GUIDE.md for more details](../SEEDER_GUIDE.md)

## 📚 Usage

### Seed Database
```bash
npm run seed
```

### Seed After Build
```bash
npm run seed:build
```

### Verify Data
```bash
# Query database
psql -U postgres -d smartcx_ai

# List users
SELECT * FROM "user";

# List tasks
SELECT * FROM "task";

# Exit
\q
```

## ⚙️ How It Works

1. **Connects** to PostgreSQL database
2. **Clears** all existing data (⚠️ destructive!)
3. **Creates** test users with hashed passwords
4. **Creates** test data (tasks, projects, events)
5. **Displays** login credentials
6. **Completes** and exits

## 🔧 Customization

Edit `seeds/seed.service.ts` to:

- Add more test users
- Modify task data
- Add more projects
- Create different events
- Change data generation logic

Example: Add more users

```typescript
// In createUsers() method
const usersData = [
  // ... existing ...
  {
    fullName: 'Your Name',
    email: 'user@smartcx.local',
    password: 'password123',
    persona: 'Manager',
  },
];
```

## 📖 Full Documentation

See [SEEDER_GUIDE.md](../SEEDER_GUIDE.md) for:
- Detailed setup instructions
- Seeded data descriptions
- Testing examples
- Troubleshooting
- Customization tips

## 🐛 Troubleshooting

**Database connection error?**
- Start PostgreSQL: `docker-compose up -d`
- Check `.env` credentials

**Tables not created?**
- Run backend once: `npm run start:dev`
- Wait for initialization
- Then run seeder

**Permission denied?**
- Verify database user has proper permissions
- Check PostgreSQL is running

## ⚠️ Important

- Seeder **clears all data** before seeding
- Use only in **development environments**
- Don't run in **production** without caution
- Back up data before running seeder

## 🔗 Related Files

- [SEEDER_GUIDE.md](../SEEDER_GUIDE.md) - Full seeding documentation
- [README.md](../README.md) - Backend overview
- [.env](../.env) - Database configuration
- [src/config/typeorm.config.ts](../src/config/typeorm.config.ts) - TypeORM setup

## ✨ Features

✅ Automatic password hashing  
✅ Realistic test data  
✅ User data isolation  
✅ Multiple status types  
✅ Priority levels  
✅ Date distribution  
✅ Easy customization  

---

**Version:** 1.0.0  
**Last Updated:** 2026-06-23
