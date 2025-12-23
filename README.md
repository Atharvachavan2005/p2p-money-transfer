# P2P Money Transfer System

A peer-to-peer fund transfer application with real-time updates and immutable audit logging. Built as part of Assignment 2: Real-time Transaction & Audit Log System.

## 🎥 Demo Video

<p align="center">
  <a href="https://drive.google.com/file/d/101CjNC4RYNxKbAFyL0Cd2sOGEoTNP3MR/preview" target="_blank" rel="noopener noreferrer">
    <img src="https://img.shields.io/badge/▶️%20Play%20Demo%20Video-red?style=for-the-badge&logo=google-drive" alt="Play Demo Video" />
  </a>
</p>

The demo covers: user registration, login, fund transfers, real-time balance updates, and transaction history. You can also open the video directly: **[Watch the Demo Video](https://drive.google.com/file/d/101CjNC4RYNxKbAFyL0Cd2sOGEoTNP3MR/preview)**

## 🌐 Live Deployment
- **Frontend**: [https://p2p-money-transfer.vercel.app](https://p2p-money-transfer.vercel.app)
- **Backend API**: [https://p2p-money-transfer-server.vercel.app](https://p2p-money-transfer-server.vercel.app)

---

## Project Overview

This project implements a simple peer-to-peer money transfer system where users can:
- Register and login with secure authentication (JWT)
- Transfer funds to other users using their username
- View transaction history with timestamps
- See real-time balance updates after transactions

### Key Features
- **Atomic Transactions**: All fund transfers use database transactions - both debit and credit succeed together or both fail
- **Immutable Audit Log**: Every successful transfer is logged in a separate AuditLog table that's never modified
- **JWT Authentication**: Secure token-based authentication for all protected routes
- **Real-time Updates**: Socket.IO integration for instant balance updates (works on traditional servers)
- **Responsive UI**: Clean, modern interface with dark/light mode support

### Tech Stack
| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React, TypeScript, Tailwind CSS (Built with v0.dev) |
| Backend | Node.js, Express.js, TypeScript |
| Database | MongoDB with Prisma ORM |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Real-time | Socket.IO |

---

## Setup & Run Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or bun package manager
- MongoDB database (local or MongoDB Atlas)

### 1. Clone the Repository
```bash
git clone https://github.com/Atharvachavan2005/p2p-money-transfer.git
cd p2p-money-transfer
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend folder:
```env
DATABASE_URL="mongodb+srv://your_username:your_password@cluster.mongodb.net/p2p_transfer"
JWT_SECRET="your_secret_key_here"
PORT=5000
```

Generate Prisma client and start the server:
```bash
npx prisma generate
npm run dev
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:3000`

### 4. Default User Setup
When a new user registers, they automatically get ₹1000 as starting balance. You can register two users and test transfers between them.

---

## API Documentation

Base URL: `http://localhost:5000/api`

### Authentication Endpoints

#### POST /auth/register
Register a new user with default balance of ₹1000.

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "securePassword123"
}
```

**Response (201):**
```json
{
  "message": "User created successfully",
  "userId": "507f1f77bcf86cd799439011"
}
```

#### POST /auth/login
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "balance": 1000
  }
}
```

### Transaction Endpoints (Protected - Require JWT)

All transaction endpoints require `Authorization: Bearer <token>` header.

#### POST /transactions/transfer
Transfer funds to another user. Uses atomic database transaction.

**Request Body:**
```json
{
  "receiverUsername": "jane_doe",
  "amount": 100
}
```

**Response (200):**
```json
{
  "success": true,
  "transaction": {
    "id": "507f1f77bcf86cd799439012",
    "senderId": "507f1f77bcf86cd799439011",
    "receiverId": "507f1f77bcf86cd799439013",
    "amount": 100,
    "status": "SUCCESS",
    "createdAt": "2024-12-23T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `400`: Insufficient funds / Invalid amount
- `404`: Receiver username not found
- `401`: Unauthorized (missing/invalid token)

#### GET /transactions/balance
Get current user's balance.

**Response (200):**
```json
{
  "balance": 900
}
```

#### GET /transactions/history
Get transaction history (audit log) for current user.

**Response (200):**
```json
[
  {
    "id": "507f1f77bcf86cd799439014",
    "transactionId": "507f1f77bcf86cd799439012",
    "senderId": "507f1f77bcf86cd799439011",
    "receiverId": "507f1f77bcf86cd799439013",
    "amount": 100,
    "status": "SUCCESS",
    "timestamp": "2024-12-23T10:30:00.000Z"
  }
]
```

### Postman Collection

📁 **Download**: [P2P-Transfer-System.postman_collection.json](./P2P-Transfer-System.postman_collection.json)

Import this file directly into Postman to test all API endpoints.

**Collection Variables:**
| Variable | Default Value | Description |
|----------|---------------|-------------|
| baseUrl | http://localhost:5000 | API base URL |
| username | testuser | Test username |
| password | testpassword123 | Test password |
| authToken | (auto-filled) | JWT token after login |
| amount | 100 | Transfer amount |

---

## Database Schema

The application uses MongoDB with Prisma ORM. Here's the schema structure:

### User Model
| Field | Type | Description |
|-------|------|-------------|
| id | ObjectId | Primary key (auto-generated) |
| username | String | Unique username |
| passwordHash | String | Bcrypt hashed password |
| balance | Float | Current balance (default: 1000) |

### Transaction Model
| Field | Type | Description |
|-------|------|-------------|
| id | ObjectId | Primary key |
| amount | Float | Transfer amount |
| senderId | ObjectId | Reference to sender User |
| receiverId | ObjectId | Reference to receiver User |
| status | String | Transaction status (SUCCESS/FAILED) |
| createdAt | DateTime | Timestamp |

### AuditLog Model (Immutable)
| Field | Type | Description |
|-------|------|-------------|
| id | ObjectId | Primary key |
| transactionId | ObjectId | Reference to Transaction |
| senderId | ObjectId | Sender's user ID |
| receiverId | ObjectId | Receiver's user ID |
| amount | Float | Transfer amount |
| status | String | Status at time of logging |
| timestamp | DateTime | When the log was created |

### Schema Diagram
```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│      User       │       │   Transaction   │       │    AuditLog     │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │◄──────│ senderId (FK)   │       │ id (PK)         │
│ username        │◄──────│ receiverId (FK) │       │ transactionId   │
│ passwordHash    │       │ amount          │       │ senderId        │
│ balance         │       │ status          │       │ receiverId      │
│                 │       │ createdAt       │       │ amount          │
│                 │       │                 │       │ status          │
│                 │       │                 │       │ timestamp       │
└─────────────────┘       └─────────────────┘       └─────────────────┘
```

---

## AI Tool Usage Log

### Tools Used
- **GitHub Copilot** (VS Code Extension)
- **Google Gemini 3 Flash**
- **ChatGPT 5.2**
- **v0.dev** (Vercel's AI UI Generator)

### AI-Assisted Tasks

| Task | Tool Used | What Was Generated | Manual Modifications |
|------|-----------|-------------------|---------------------|
| Complete Frontend UI | v0.dev | Full Next.js frontend with all components, pages, forms | Integrated with backend APIs, added real-time socket handling |
| Prisma schema design | Gemini 3 Flash | Initial schema with User, Transaction models | Added AuditLog model, adjusted field types for MongoDB |
| Database transaction boilerplate | ChatGPT 5.2 | `executeTransfer` function with Prisma `$transaction` | Added balance validation, error handling, timeout config |
| JWT authentication middleware | GitHub Copilot | Basic middleware structure | Added type definitions, error messages, token extraction logic |
| Input validation logic | GitHub Copilot | Autocompleted validation checks | Added custom error messages, edge case handling |
| Socket.IO setup | ChatGPT 5.2 | Server-side socket configuration | Added room-based messaging, serverless environment checks |
| Error handling patterns | GitHub Copilot | Try-catch blocks, error responses | Customized error messages for different scenarios |

### Detailed Usage Examples

**1. Complete Frontend (v0.dev)**

Used v0.dev to generate the entire frontend UI including login/register forms, dashboard, transfer form, and transaction history components. The generated code was then integrated with the backend APIs and Socket.IO for real-time updates.

**2. Database Transaction Boilerplate (ChatGPT 5.2)**

Prompt: "Write a Prisma transaction for transferring money between two users with balance check"

Generated code provided the basic structure, but I had to:
- Add the `$transaction` timeout and maxWait options
- Implement double balance check (before and after decrement)
- Add proper TypeScript types
- Handle the "receiver not found" edge case

**3. Prisma Schema (Gemini 3 Flash)**

Prompt: "Create MongoDB Prisma schema for P2P transfer with users, transactions, and audit logs"

Modifications made:
- Adjusted ObjectId mappings for MongoDB
- Added proper relations between models
- Set default balance value

**4. JWT Middleware (GitHub Copilot)**

Copilot suggested the middleware structure as I typed. Modifications made:
- Added proper TypeScript interface for `AuthRequest`
- Improved token extraction from Bearer header
- Added meaningful error responses

### Effectiveness Score: **4/5**

**Justification:**
- **Time Saved**: Approximately 3-4 hours on boilerplate code, especially for Prisma transactions and authentication setup
- **What Worked Well**: Initial scaffolding, repetitive patterns, and suggesting code structure
- **Challenges**: AI-generated database transaction code needed careful review for edge cases (race conditions, insufficient funds scenario). The transaction history component required significant styling work.
- **Learning**: Using AI tools accelerated development but required understanding of the generated code to debug and optimize properly

---

## Project Structure

```
p2p-transfer-system/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma      # Database schema
│   ├── src/
│   │   ├── middleware/
│   │   │   └── auth.ts        # JWT authentication
│   │   ├── routes/
│   │   │   ├── auth.ts        # Login/Register endpoints
│   │   │   └── transaction.ts # Transfer/Balance/History endpoints
│   │   ├── services/
│   │   │   └── transferService.ts  # Atomic transfer logic
│   │   ├── utils/
│   │   │   └── prisma.ts      # Prisma client instance
│   │   ├── app.ts             # Express app setup
│   │   └── server.ts          # Server entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── app/
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Main page
│   ├── components/
│   │   ├── auth-page.tsx      # Auth container
│   │   ├── login-form.tsx     # Login form
│   │   ├── register-form.tsx  # Register form
│   │   ├── dashboard.tsx      # Main dashboard
│   │   ├── transfer-form.tsx  # Transfer money form
│   │   ├── transaction-history.tsx  # History list
│   │   └── ui/                # Reusable UI components
│   ├── hooks/
│   │   └── use-toast.ts       # Toast notifications
│   └── package.json
├── demo/
│   └── README.md              # Demo video link
├── P2P-Transfer-System.postman_collection.json  # Postman API collection
└── README.md                  # This file
```

---

## Error Handling

The application handles various error scenarios:

| Scenario | Error Message | HTTP Status |
|----------|---------------|-------------|
| Insufficient balance | "Transaction failed: Insufficient funds" | 400 |
| User not found | "Receiver not found. Please verify the username." | 404 |
| Self-transfer | "Cannot transfer money to yourself" | 400 |
| Invalid amount | "Amount must be a positive number" | 400 |
| Missing token | "Access denied" | 401 |
| Invalid token | "Invalid token" | 403 |

---

## Author

**Atharva Chavan**
- GitHub: [@Atharvachavan2005](https://github.com/Atharvachavan2005)

---

## License

This project was created for educational/assignment purposes.

