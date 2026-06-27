# Database Seeder Guide

This guide explains how to use the SmartCX AI database seeder to populate your database with test data.

---

## 🌱 What is the Seeder?

The seeder is a utility that populates your database with realistic test data for development and testing. It creates:

- **4 Test Users** with different personas
- **9 Test Tasks** with various statuses and priorities
- **7 Test Projects** with progress tracking
- **8 Test Events** for calendar functionality

---

## 🚀 Quick Start

### Prerequisites
- Backend running on port 3000 (or configured port)
- PostgreSQL database running and connected
- Backend dependencies installed: `npm install`

### Run the Seeder

```bash
# Using ts-node (development)
npm run seed

# After building for production
npm run seed:build
```

**Expected Output:**
```
🌱 Starting database seeding...
🧹 Clearing existing data...
✅ Users created: 4
✅ Tasks created: 9
✅ Projects created: 7
✅ Events created: 8
✨ Database seeding completed successfully!

📝 Test Credentials:
-------------------
Email: manager@smartcx.local
Password: password123
Persona: Manager
---
Email: freelancer@smartcx.local
Password: password123
Persona: Freelancer
---
Email: executive@smartcx.local
Password: password123
Persona: Executive
---
Email: demo@smartcx.local
Password: password123
Persona: Manager
---
```

---

## 📝 Test Credentials

After running the seeder, use these credentials to login:

| Email | Password | Persona | Description |
|-------|----------|---------|------------|
| manager@smartcx.local | password123 | Manager | Full management access |
| freelancer@smartcx.local | password123 | Freelancer | Freelancer perspective |
| executive@smartcx.local | password123 | Executive | Executive view |
| demo@smartcx.local | password123 | Manager | Demo/testing account |

---

## 📊 Seeded Data Details

### Users (4)

1. **John Manager** (manager@smartcx.local)
   - Persona: Manager
   - 3 tasks, 3 projects, 3 events

2. **Sarah Freelancer** (freelancer@smartcx.local)
   - Persona: Freelancer
   - 2 tasks, 2 projects, 2 events

3. **Alex Executive** (executive@smartcx.local)
   - Persona: Executive
   - 2 tasks, 1 project, 2 events

4. **Demo User** (demo@smartcx.local)
   - Persona: Manager
   - 2 tasks, 1 project, 1 event

### Tasks (9)

#### John Manager's Tasks
- ✋ Complete Q4 Report (HIGH priority, PENDING)
- ⚙️ Review Team Performance (HIGH priority, IN-PROGRESS)
- ✅ Plan Next Sprint (MEDIUM priority, COMPLETED)

#### Sarah Freelancer's Tasks
- ✋ Design UI Mockups (HIGH priority, IN-PROGRESS)
- ✋ Client Presentation (MEDIUM priority, PENDING)

#### Alex Executive's Tasks
- ✋ Board Meeting Preparation (HIGH priority, PENDING)
- ✅ Budget Review (HIGH priority, COMPLETED)

#### Demo User's Tasks
- ✋ Get Started Tutorial (MEDIUM priority, PENDING)
- ⚙️ Explore Dashboard (LOW priority, IN-PROGRESS)

### Projects (7)

1. **Mobile App Development** (John Manager, 65% complete)
2. **Cloud Migration** (John Manager, 40% complete)
3. **Legacy System Upgrade** (John Manager, 100% complete)
4. **Website Redesign** (Sarah Freelancer, 75% complete)
5. **Branding Project** (Sarah Freelancer, 10% complete)
6. **Digital Transformation** (Alex Executive, 50% complete)
7. **Learning Project** (Demo User, 25% complete)

### Events (8)

1. **Team Standup** (John Manager, Tomorrow)
2. **One-on-One with Sarah** (John Manager, Next Week)
3. **Project Review Meeting** (John Manager, Two Weeks)
4. **Client Call** (Sarah Freelancer, Tomorrow)
5. **Design Workshop** (Sarah Freelancer, Next Week)
6. **Board Meeting** (Alex Executive, Tomorrow)
7. **Strategy Session** (Alex Executive, Two Weeks)
8. **Sample Meeting** (Demo User, Tomorrow)

---

## 🔄 Seeder Workflow

When you run the seeder, it performs the following steps:

1. **Clear Database** - Removes all existing data to start fresh
2. **Create Users** - Creates 4 test users with hashed passwords
3. **Create Tasks** - Creates tasks for each user with various statuses
4. **Create Projects** - Creates projects with progress tracking
5. **Create Events** - Creates calendar events
6. **Display Credentials** - Shows all test login credentials

### Important: Database Clearing

⚠️ **The seeder CLEARS ALL existing data before seeding!**

Make sure you:
- Back up any important data before running
- Only use in development environments
- Don't run in production without caution

---

## 💾 Using Seeded Data for Testing

### Test User Authentication
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@smartcx.local",
    "password": "password123"
  }'
```

### Get User's Tasks
```bash
# After login and getting token
curl http://localhost:3000/tasks \
  -H "Authorization: Bearer <your-token>"
```

### View Tasks by Status
```bash
# Get all pending tasks
curl http://localhost:3000/tasks?status=pending \
  -H "Authorization: Bearer <your-token>"

# Get all completed tasks
curl http://localhost:3000/tasks?status=completed \
  -H "Authorization: Bearer <your-token>"
```

### Get Projects
```bash
curl http://localhost:3000/projects \
  -H "Authorization: Bearer <your-token>"
```

### Get Calendar Events
```bash
curl http://localhost:3000/events \
  -H "Authorization: Bearer <your-token>"
```

---

## 🔧 Customizing the Seeder

### Add More Test Data

Edit `src/database/seeds/seed.service.ts` to:

1. **Add more users** - Modify `createUsers()` method
2. **Add more tasks** - Modify `createTasks()` method
3. **Add more projects** - Modify `createProjects()` method
4. **Add more events** - Modify `createEvents()` method

### Example: Adding a New User

```typescript
// In createUsers() method
const usersData = [
  // ... existing users ...
  {
    fullName: 'New User',
    email: 'newuser@smartcx.local',
    password: 'password123',
    persona: 'Manager',
  },
];
```

### Example: Adding a New Task

```typescript
// In createTasks() method
{
  title: 'New Task Title',
  description: 'Task description here',
  status: 'pending',  // pending, in-progress, completed
  priority: 'high',    // high, medium, low
  dueDate: tomorrow,
  userId: users[0].id,
}
```

---

## 🐛 Troubleshooting

### Error: "No database connection"

```bash
# Check if PostgreSQL is running
docker-compose ps

# Start PostgreSQL
docker-compose up -d

# Or with manual PostgreSQL
brew services start postgresql@15

# Then try seeding again
npm run seed
```

### Error: "Module not found"

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Try seeding again
npm run seed
```

### Error: "Table does not exist"

```bash
# Make sure the backend has run once to create tables
npm run start:dev

# Wait for it to initialize (watch for "successfully started" message)
# Then Ctrl+C to stop

# Now run seeder
npm run seed
```

### Error: "Permission denied"

The seeder needs write access to your database. Verify:
- Database credentials in `.env` are correct
- PostgreSQL user has proper permissions
- Database exists and is accessible

---

## 📋 Workflow: Local Development Setup

Here's the recommended workflow for fresh local setup:

### Step 1: Start PostgreSQL
```bash
docker-compose up -d
# OR
brew services start postgresql@15
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Initialize Database Schema
```bash
# Run backend once to let TypeORM create tables
npm run start:dev
# Wait for "successfully started" message
# Press Ctrl+C to stop
```

### Step 4: Seed Test Data
```bash
npm run seed
```

### Step 5: Start Backend for Development
```bash
npm run start:dev
```

### Step 6: Start Frontend (in another terminal)
```bash
cd SmartCX-AI-Frontend-main
npm install
ng serve
```

### Step 7: Login with Test Credentials
- Open http://localhost:4200
- Email: manager@smartcx.local
- Password: password123

---

## ✨ Features of the Seeder

✅ **Automatic Password Hashing** - Passwords are hashed with bcrypt  
✅ **Realistic Test Data** - Tasks, projects, and events mirror real usage  
✅ **User Isolation** - Each user has their own data  
✅ **Status Variety** - Mix of pending, in-progress, and completed items  
✅ **Priority Levels** - High, medium, and low priority tasks  
✅ **Date Distribution** - Events spread across different dates  
✅ **Progress Tracking** - Projects have realistic progress percentages  
✅ **Easy Customization** - Modify seeder.service.ts to add more data  

---

## 🔒 Security Notes

⚠️ **For Development Only!**

The seeder is designed for local development. In production:
- Don't use default passwords
- Don't run seeder on production database
- Change all credentials
- Use strong passwords
- Follow security best practices

---

## 📚 Related Files

- `src/database/seeds/seed.service.ts` - Main seeding logic
- `src/database/seeds/seed.module.ts` - NestJS module
- `src/database/seeds/seed.command.ts` - CLI command
- `package.json` - Seed scripts

---

## 🎯 Next Steps

1. **Run the seeder**: `npm run seed`
2. **Start the backend**: `npm run start:dev`
3. **Start the frontend**: `ng serve`
4. **Login** with test credentials
5. **Explore the app** with pre-populated data
6. **Modify seeder** as needed for your testing scenarios

---

## ❓ FAQ

### Q: Can I run the seeder multiple times?
**A:** Yes, it clears old data each time and recreates it fresh.

### Q: Does the seeder modify the schema?
**A:** No, it only adds data. Schema is created by TypeORM on backend startup.

### Q: Can I seed production data?
**A:** Not recommended. Use only for development and testing.

### Q: How do I add custom data?
**A:** Edit `src/database/seeds/seed.service.ts` and modify the data arrays.

### Q: Can I seed without clearing existing data?
**A:** Yes, modify `clearDatabase()` method in seed.service.ts to comment out deletions.

### Q: What if password hashing fails?
**A:** Ensure `bcryptjs` is installed: `npm install bcryptjs`

---

## 🚀 Tips & Tricks

### Seed Only Specific Data

Comment out methods in `seed()` to seed only certain data:

```typescript
async seed() {
  await this.clearDatabase();
  const users = await this.createUsers();
  // await this.createTasks(users);  // Skip tasks
  // await this.createProjects(users);  // Skip projects
  // await this.createEvents(users);  // Skip events
}
```

### Add More Realistic Data

Modify date calculations to create events spanning different time periods:

```typescript
// Create events for the next 30 days
const futureDate = new Date(today.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000);
```

### Generate Test Data Programmatically

Modify the data arrays to use loops:

```typescript
// Generate 50 tasks automatically
for (let i = 0; i < 50; i++) {
  tasksData.push({
    title: `Task ${i + 1}`,
    description: `Generated task ${i + 1}`,
    status: ['pending', 'in-progress', 'completed'][i % 3],
    priority: ['high', 'medium', 'low'][i % 3],
    dueDate: new Date(today.getTime() + i * 24 * 60 * 60 * 1000),
    userId: users[i % users.length].id,
  });
}
```

---

**Last Updated:** 2026-06-23  
**Version:** 1.0.0  
**Status:** ✅ Ready to Use

Happy seeding! 🌱
