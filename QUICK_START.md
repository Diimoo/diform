# DIForM - Quick Start Guide

## 🚀 5-Minute Setup

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Setup Environment
```bash
chmod +x setup.sh
./setup.sh
```

### Step 3: Edit .env
```bash
# Required variables
MONGODB_URI=mongodb://localhost:27017/diform
JWT_SECRET=$(openssl rand -base64 32)  # Generate and paste here
```

### Step 4: Start MongoDB
```bash
docker-compose up mongodb -d
```

### Step 5: Run Application
```bash
npm run dev
```

Application will be available at:
- Backend: http://localhost:5000
- Frontend: http://localhost:3000

---

## 🔑 First Time Authentication

### Register Your First User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123",
    "name": "Your Name"
  }'
```

### Login and Get Token
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123"
  }'
```

Copy the `token` from the response.

### Test Protected Endpoint
```bash
curl -X POST http://localhost:5000/api/process \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "command": "Test command"
  }'
```

---

## 📋 Common Commands

### Development
```bash
npm run dev          # Start both frontend and backend
npm run server       # Backend only
npm run client       # Frontend only
```

### Testing
```bash
npm test             # Run all tests
npm run test:coverage # With coverage report
npm run test:watch   # Watch mode
```

### Docker
```bash
docker-compose up -d              # Start all services
docker-compose logs -f server     # View server logs
docker-compose down               # Stop all services
```

### Production
```bash
npm run build        # Build frontend
npm start            # Start production server
```

---

## 🔍 Health Check

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-16T...",
  "uptime": 123.456,
  "environment": "development",
  "database": "connected"
}
```

---

## 📚 API Endpoints

### Authentication (Public)
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user

### Protected (Require Token)
- `GET /api/auth/me` - Get current user
- `POST /api/process` - Process command
- `GET /api/task/:taskId` - Get task status
- `GET /api/history` - Get execution history

---

## 🐛 Troubleshooting

### MongoDB Connection Error
```bash
# Start MongoDB with Docker
docker-compose up mongodb -d
```

### Port 5000 Already in Use
```bash
# Kill the process
lsof -ti:5000 | xargs kill -9
```

### JWT Secret Error
```bash
# Generate a proper secret
openssl rand -base64 32
# Then paste it in .env as JWT_SECRET
```

---

## 📖 More Information

- Full documentation: `README.md`
- All fixes: `CRITICAL_ISSUES_FIXED.md`
- Summary: `FIXES_SUMMARY.md`
- Deployment: `DEPLOYMENT_GUIDE.md`
