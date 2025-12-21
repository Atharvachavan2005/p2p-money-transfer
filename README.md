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
- ✅ Beautiful, responsive UI with dark mode

## 📝 Notes

- Default starting balance: ₹1,000.00
- Users transfer money using recipient's username
- All transactions are logged in AuditLog table (immutable, append-only)
- Real-time updates work via Socket.io rooms
- Atomic transactions ensure data consistency (both debit and credit succeed or both fail)

---

## 🤖 AI Tool Usage Log (MANDATORY)

### AI-Assisted Tasks Completed

| Task | AI Tool Used | Description |
|------|-------------|-------------|
| Transaction Service Boilerplate | GitHub Copilot | Generated atomic transaction logic using Prisma `$transaction()` wrapper for consistent money transfer (debit + credit or both fail) |
| Audit Log Implementation | GitHub Copilot | Created immutable, append-only AuditLog table schema and logic to ensure audit trail cannot be modified |
| JWT Authentication Middleware | GitHub Copilot | Generated JWT token verification and protected route middleware with proper error handling |
| React Transaction History Table | GitHub Copilot | Created sortable transaction history component with timestamp formatting and transaction status display |
| TypeScript Type Definitions | GitHub Copilot | Generated comprehensive type interfaces for Transaction, User, and AuditLog models |
| Socket.io Real-time Updates | GitHub Copilot | Implemented real-time balance update broadcasts to sender and receiver via Socket.io rooms |
| Database Schema (Prisma) | GitHub Copilot | Generated User, Transaction, and AuditLog models with proper relationships and validation |
| API Error Handling | GitHub Copilot | Created centralized error handling for insufficient funds, user validation, and transaction failures |
| Form Validation Logic | GitHub Copilot | Generated input validation for transfer amounts, username verification, and self-transfer prevention |
| Dark Mode Implementation | GitHub Copilot | Configured next-themes integration and Tailwind dark mode CSS variables |
| Responsive UI Components | GitHub Copilot | Generated responsive dashboard, transfer form, and transaction history components |

### Effectiveness Score: **4.5/5** ⭐⭐⭐⭐

**Justification:**
- ✅ **Saved ~6-8 hours** on boilerplate code generation (transaction logic, authentication, database models)
- ✅ **Accelerated API design** with proper RESTful patterns and error handling
- ✅ **Quick TypeScript setup** with accurate type definitions
- ✅ **Fast UI component creation** with responsive design patterns
- ⚠️ **Minor debugging needed** for Prisma transaction variable naming (fixed duplicate variable declarations)
- ⚠️ **Required refinement** on Socket.io event naming and real-time update logic
- ✅ **Highly effective** for scaffolding and boilerplate, reducing development cycle significantly

**How AI Was Used Effectively:**
1. **Scaffolding**: AI generated the core transaction service with proper atomic operations, saving manual implementation time
2. **Pattern Implementation**: Used AI suggestions for Prisma `$transaction()` syntax and MongoDB ObjectId handling
3. **Type Safety**: AI-generated TypeScript interfaces ensured type consistency across backend and frontend
4. **Real-time Architecture**: AI provided Socket.io pattern for real-time balance updates
5. **Database Schema**: Generated comprehensive Prisma schema with proper relationships
6. **Error Handling**: AI suggested comprehensive error messages and validation rules

**Why Effectiveness Score Isn't Perfect (4.5 instead of 5):**
- Some AI-generated code required debugging (variable naming conflicts)
- Initial Socket.io implementation needed refinement for edge cases
- Required manual optimization of Prisma queries for better performance

---

## 📦 Database Schema

### User Model
```
{
  id: ObjectId (primary key)
  username: String (unique)
  passwordHash: String (bcrypt hashed)
  balance: Float (default: 1000.00)
  sentTrans: Transaction[] (foreign key relation)
  receivedTrans: Transaction[] (foreign key relation)
}
```

### Transaction Model
```
{
  id: ObjectId (primary key)
  senderId: ObjectId (foreign key → User.id)
  receiverId: ObjectId (foreign key → User.id)
  amount: Float
  status: String (SUCCESS, FAILED)
  createdAt: DateTime (timestamp)
  sender: User (relation)
  receiver: User (relation)
}
```

### AuditLog Model (Immutable, Append-Only)
```
{
  id: ObjectId (primary key)
  transactionId: ObjectId (reference to transaction)
  senderId: ObjectId (foreign key → User.id)
  receiverId: ObjectId (foreign key → User.id)
  amount: Float
  status: String (SUCCESS, FAILED)
  timestamp: DateTime (created at)
  
  Note: This table is write-once, never modified or deleted
}
```

---

## 📊 Architecture Overview

### Atomic Transaction Flow
```
1. User initiates transfer
   ↓
2. Validate sender has sufficient funds
   ↓
3. Open Prisma Transaction Block
   ├─ Deduct amount from sender balance
   ├─ Credit amount to receiver balance
   └─ Create Transaction record
   ↓
4. If all succeed → Commit | If any fail → Rollback (automatic)
   ↓
5. Asynchronously create AuditLog entry
   ↓
6. Emit Socket.io real-time balance update to both users
```

### Real-time Communication
- **Socket.io Rooms**: Each user has a room with their userId
- **Events**: `balance_update` emitted after successful transfer
- **Payload**: `{ message, amount, newBalance }`

---

## 🔐 Security Features

1. **Atomic Transactions**: Both debit and credit succeed or both fail (no partial transfers)
2. **JWT Authentication**: All endpoints protected with token-based authentication
3. **Password Hashing**: bcryptjs for secure password storage
4. **Input Validation**: Amount checks, username verification, self-transfer prevention
5. **Audit Trail**: Immutable audit log for compliance and fraud detection
6. **CORS Protection**: Configured for specific origins

---

## 🎯 Core API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and receive JWT token

### Transactions
- `POST /api/transactions/transfer` - Atomic fund transfer (requires auth)
- `GET /api/transactions/balance` - Get current user balance (requires auth)
- `GET /api/transactions/history` - Get audit log of all transactions (requires auth)

### Response Status Codes
- `200`: Success
- `201`: Created (registration)
- `400`: Bad request (validation errors, insufficient funds)
- `401`: Unauthorized (missing/invalid token)
- `404`: Not found (user/receiver not found)
- `500`: Server error

---

## ✅ Submission Readiness Checklist

- ✅ **Atomic Transaction Implementation** - Debit & credit in single transaction block
- ✅ **Immutable Audit Log** - Append-only transaction history (never modified)
- ✅ **Real-time Updates** - Socket.io balance notifications
- ✅ **Transaction History API** - GET /history with proper sorting
- ✅ **JWT Authentication** - Protected endpoints with token validation
- ✅ **Input Validation** - Username, amount, self-transfer checks
- ✅ **Beautiful UI** - Responsive design with dark mode
- ✅ **Database Schema** - User, Transaction, AuditLog models
- ✅ **Comprehensive README** - All required sections
- ✅ **API Documentation** - Full endpoint descriptions
- ✅ **AI Tool Usage Log** - Complete with effectiveness score
- ⏳ **GitHub Repository** - Ready to push for submission
- ⏳ **Screen Recording** - Ready to create demo video

`

