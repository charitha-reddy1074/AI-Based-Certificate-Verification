# CertChain - Quick Start Guide

## 🚀 One-Command Startup (RECOMMENDED)

```bash
npm run run
```

This will:
1. ✅ Install dependencies
2. ✅ Check TypeScript types  
3. ✅ Start development server
4. ✅ Open http://127.0.0.1:5000 in browser

**Done!** The application is ready to use.

---

## 🐳 With Docker & PostgreSQL

If you have Docker installed, use this for production-like environment:

```bash
npm run full-start
```

This will:
1. ✅ Install dependencies
2. ✅ Check types
3. ✅ Start PostgreSQL via Docker
4. ✅ Start development server

---

## 📋 All Available Commands

| Command | Purpose |
|---------|---------|
| `npm run run` | ⭐ Start everything (simple) |
| `npm run full-start` | 🐳 Start with Docker database |
| `npm run dev` | Start development server only |
| `npm run db:start` | Start PostgreSQL via Docker |
| `npm run db:stop` | Stop PostgreSQL |
| `npm run db:reset` | Reset database |
| `npm run check` | TypeScript type check |
| `npm run build` | Build for production |

---

## 🔑 Default Admin Credentials

After startup, login with:
- **Email:** `admin@example.com`
- **Password:** `Admin@2026`

---

## 🌐 Access Points

| Service | URL |
|---------|-----|
| **Application** | http://127.0.0.1:5000 |
| **Login** | http://127.0.0.1:5000/login |
| **Signup** | http://127.0.0.1:5000/signup |
| **Admin Dashboard** | http://127.0.0.1:5000/admin |

---

## 📦 Storage Options

### 🚀 Default (No Database Required)
- Uses **in-memory storage**
- Data is lost on restart
- Perfect for testing/development
- **No Docker needed**

### 🐘 PostgreSQL (Persistent Data)
- Uses **Docker for PostgreSQL**
- Data persists across restarts
- Required for production
- Run: `npm run full-start`

### 🌥️ Cloud Deployment
- Set `DATABASE_URL` environment variable
- Use hosted PostgreSQL (AWS RDS, Heroku, etc.)
- Run: `npm run build && npm start`

---

## 🚢 Deployment to Production

### Option 1: Docker Compose (Easiest)
```bash
docker-compose up -d
npm install
npm run db:push
npm run build
npm start
```

### Option 2: Cloud Hosting (AWS, Heroku, Azure)
1. Push code to Git
2. Set `DATABASE_URL` as environment variable
3. Set `NODE_ENV=production`
4. Run:
```bash
npm install
npm run db:push
npm run build
npm start
```

### Option 3: Your Own Server
```bash
# SSH into server
ssh user@your-server.com

# Install Node.js 18+
node --version

# Clone and setup
git clone <repo-url>
cd CertChain-main
npm install

# Setup PostgreSQL
sudo apt-get install postgresql
# Create database

# Run application
npm run build
NODE_ENV=production npm start
```

---

## ✅ Verify Everything Works

After running `npm run run`, you should see:

```
⏳ Installing dependencies...
✅ Installing dependencies

⏳ Running TypeScript check...
✅ Running TypeScript check

🎯 Starting development server on http://127.0.0.1:5000

✅ Using in-memory storage (database unavailable)
Admin user seeded
12:34:56 PM [express] serving on http://127.0.0.1:5000
```

Then open: **http://127.0.0.1:5000** ✅

---

## 🐛 Troubleshooting

### Problem: Command not found
```bash
npm install
npm run run
```

### Problem: Port 5000 already in use
```bash
# Kill process using port 5000
# Windows: taskkill /PID <pid> /F
# Mac/Linux: lsof -ti:5000 | xargs kill -9

npm run run
```

### Problem: Database connection timeout
- Just use the default (no database required)
- Data saves in memory
- Perfect for demo/testing

### Problem: Want to persist data?
```bash
# Install Docker first
npm run full-start
```

---

## 📚 Features Working Out-of-Box

✅ **Student Registration** - Create account, upload face  
✅ **Certificate Issuance** - With blockchain hash  
✅ **Certificate Download** - PDF export  
✅ **Certificate Verification** - Search by roll number  
✅ **Verifier Dashboard** - Check certificates  
✅ **Payment** - ₹1000 verification fee  
✅ **Face Recognition** - Biometric authentication  
✅ **Admin Panel** - Approve users  

---

## 🎯 What You Need to Know

### Database Behavior
- **Without Docker:** Uses in-memory storage (data lost on restart)
- **With Docker:** Uses PostgreSQL (data persists)
- **On Deployment:** Uses production PostgreSQL (cloud or self-hosted)

### Is Data Safe on Deployment?
✅ **YES!** When deployed:
- PostgreSQL stores data persistently
- Data survives server restarts
- Can backup database
- Can migrate to other servers

---

**Ready?** Just run:
```bash
npm run run
```

🎉 That's it!

