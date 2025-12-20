# P2P Money Transfer System

A real-time peer-to-peer money transfer application with Socket.io integration.

## 🚀 Quick Start Guide

### Prerequisites

- Node.js (v18 or higher)
- Bun (for backend) OR npm/node
- MongoDB database (or your configured database)

### Step 1: Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # OR if you have bun:
   bun install
   ```

3. **Set up environment variables:**
   - Make sure `.env` file exists with:
     ```
     DATABASE_URL="your_database_connection_string"
     JWT_SECRET="your_secret_key"
     PORT=5000
     ```

4. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```

5. **Push database schema:**
   ```bash
   npx prisma db push
   ```

6. **Start the backend server:**
   ```bash
   npm run dev
   # OR with bun:
   bun dev
   ```

   The backend will run on `http://localhost:5000`

### Step 2: Frontend Setup

1. **Open a new terminal and navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the frontend development server:**
   ```bash
   npm run dev
   ```

   The frontend will run on `http://localhost:3000` (or next available port)

### Step 3: Access the Application

1. Open your browser and go to: `http://localhost:3000`
2. Register a new user account
3. Login with your credentials
4. Start transferring money!

## 📋 Complete Setup Commands

### Backend (Terminal 1)
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev
```

### Frontend (Terminal 2)
```bash
cd frontend
npm install
npm run dev
```

## 🧪 Testing the Application

1. **Register User 1:**
   - Go to the registration page
   - Create an account (e.g., username: `user1`, password: `password123`)
   - Note your User ID displayed on the dashboard

2. **Register User 2:**
   - Open an incognito window or different browser
   - Register another account (e.g., username: `user2`, password: `password123`)
   - Note this User ID as well

3. **Transfer Money:**
   - As User 2, enter User 1's ID in the transfer form
   - Enter an amount (e.g., ₹100)
   - Click "Send Money"
   - Watch the real-time notifications!

4. **Verify:**
   - Check that User 1's balance updated in real-time
   - Check transaction history on both accounts
   - Verify notifications appeared

## 🔧 Troubleshooting

### Backend Issues

- **Port already in use:** Change `PORT` in `.env` file
- **Database connection error:** Check `DATABASE_URL` in `.env`
- **Prisma errors:** Run `npx prisma generate` again

### Frontend Issues

- **Cannot connect to backend:** 
  - Make sure backend is running on port 5000
  - Check `http://localhost:5000` is accessible
- **Socket.io connection failed:**
  - Verify backend is running
  - Check CORS settings in backend

### Common Fixes

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Regenerate Prisma Client
npx prisma generate

# Reset database (if needed)
npx prisma db push --force-reset
```

## 📁 Project Structure

```
p2p-transfer-system/
├── backend/
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── middleware/    # Auth middleware
│   │   └── utils/         # Prisma client
│   ├── prisma/
│   │   └── schema.prisma  # Database schema
│   └── .env              # Environment variables
│
└── frontend/
    ├── app/              # Next.js app directory
    ├── components/        # React components
    └── hooks/            # Custom hooks
```

## 🌐 API Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `POST /api/transactions/transfer` - Transfer money (requires auth)
- `GET /api/transactions/balance` - Get current balance (requires auth)
- `GET /api/transactions/history` - Get transaction history (requires auth)

## 🔐 Authentication

- JWT tokens are stored in `localStorage`
- Tokens expire after 24 hours
- Protected routes require `Authorization: Bearer <token>` header

## 💡 Features

- ✅ Real-time balance updates via Socket.io
- ✅ Live notifications for sent/received money
- ✅ Automatic transaction history refresh
- ✅ Secure JWT authentication
- ✅ Atomic transactions (no partial transfers)
- ✅ Insufficient funds validation
- ✅ Beautiful, responsive UI

## 📝 Notes

- Default starting balance: ₹1,000.00
- Users transfer money using recipient's User ID (MongoDB ObjectId)
- All transactions are logged in AuditLog table
- Real-time updates work via Socket.io rooms

