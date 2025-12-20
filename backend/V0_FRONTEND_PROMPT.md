# V0 Frontend Generation Prompt

Copy and paste this entire prompt into V0 to generate the frontend:

---

Create a beautiful, modern, and minimal P2P money transfer web application using React/Next.js with TypeScript. The design should be top-notch with clean code - no unnecessary complexity, but the UI should be exceptional.

## Backend API Integration

**Base URL:** `http://localhost:5000`

### Authentication Endpoints:

1. **Register User**
   - `POST /api/auth/register`
   - Body: `{ "username": "string", "password": "string" }`
   - Response (201): `{ "message": "User created successfully", "userId": "string" }`
   - Response (400): `{ "message": "Username already exists or invalid data" }`

2. **Login**
   - `POST /api/auth/login`
   - Body: `{ "username": "string", "password": "string" }`
   - Response (200): `{ "token": "jwt_token_string", "user": { "id": "string", "username": "string", "balance": 1000.00 } }`
   - Response (401): `{ "message": "Invalid credentials" }`
   - **IMPORTANT:** Store the JWT token in localStorage/sessionStorage after login

### Transaction Endpoints (Require Authentication):

3. **Transfer Money**
   - `POST /api/transactions/transfer`
   - Headers: `Authorization: Bearer <JWT_TOKEN>`
   - Body: `{ "receiverId": "string", "amount": number }`
   - Response (200): `{ "success": true, "transaction": { "id": "string", "amount": number, "senderId": "string", "receiverId": "string", "status": "SUCCESS", "createdAt": "ISO_date_string" } }`
   - Response (400): `{ "success": false, "message": "Insufficient funds" }` or other error messages
   - Response (401): `{ "message": "Authentication required" }`

4. **Get Transaction History**
   - `GET /api/transactions/history`
   - Headers: `Authorization: Bearer <JWT_TOKEN>`
   - Response (200): Array of audit logs: `[{ "id": "string", "transactionId": "string", "senderId": "string", "receiverId": "string", "amount": number, "status": "string", "timestamp": "ISO_date_string" }]`
   - Response (401): `{ "message": "Authentication required" }`

### Real-Time Updates (Socket.io):

- **Connection:** Connect to `http://localhost:5000` using Socket.io client
- **After Login:** Emit `socket.emit('join', userId)` to join user's private room
- **Listen for:** `socket.on('balance_update', (data) => { ... })` where `data = { message: "string" }`
- **Events:**
  - When money is sent: `{ message: "Money sent successfully" }`
  - When money is received: `{ message: "You received money!" }`

## Application Flow & Features

### 1. Registration Page
- Clean registration form with username and password fields
- Submit button that calls `/api/auth/register`
- Show success message and redirect to login on success
- Show error message if username exists or validation fails
- Beautiful, minimal design with proper spacing and typography

### 2. Login Page
- Login form with username and password fields
- Submit button that calls `/api/auth/login`
- On success: Store JWT token and user data, then redirect to dashboard
- Show error message for invalid credentials
- Match the design aesthetic of registration page

### 3. Dashboard (After Login)
- **Header Section:**
  - Display current username
  - Display current balance prominently (e.g., "₹1,000.00" or "Balance: ₹1,000.00")
  - Logout button

- **Transfer Money Section:**
  - Form with two fields:
    1. **Receiver Identifier:** Input field where user can type the receiver's **User ID** (the MongoDB ObjectId string)
       - Add helper text: "Enter the User ID of the person you want to send money to"
       - Optional: Add a search/autocomplete feature if you want to enhance UX
    2. **Amount:** Number input for transfer amount
  - Submit button labeled "Send Money"
  - **Real-time Notifications:**
    - When transfer succeeds: Show success popup/notification: "Money sent successfully! ₹X sent to [receiver]"
    - When transfer fails: Show error popup/notification with the error message (e.g., "Insufficient funds")
    - Use toast notifications or a notification system that appears at the top/bottom of screen
  - **Live Balance Updates:**
    - When user receives money (via Socket.io), show a popup notification: "You received money! ₹X credited to your account"
    - Automatically refresh/update the balance display when Socket.io event is received
    - Update the balance number in real-time without page refresh

- **Transaction History Section:**
  - Table/list showing all transactions (sent and received)
  - Columns: Date/Time, Type (Sent/Received), Amount, Status, Other Party (sender or receiver username/ID)
  - **Read-only:** No edit or delete buttons - purely for viewing
  - Show timestamp in readable format (e.g., "Jan 15, 2024, 3:45 PM")
  - Auto-refresh when new transactions occur
  - Empty state message if no transactions
  - Styled beautifully with proper spacing and hover effects

### 4. Error Handling
- Show user-friendly error messages for:
  - Network errors
  - Authentication failures (redirect to login if token invalid/expired)
  - Insufficient funds
  - Invalid receiver ID
  - Any other API errors
- Display errors in a consistent, non-intrusive way (toast notifications or inline messages)

### 5. Real-Time Features Implementation
- Connect to Socket.io immediately after successful login
- Join user's room using their user ID
- Listen for `balance_update` events
- When event received:
  - Show notification popup
  - Update balance display
  - Refresh transaction history
  - Animate the balance update for visual feedback

## Design Requirements

- **Modern & Beautiful:** Use a contemporary design system (consider Tailwind CSS or similar)
- **Minimal & Clean:** No unnecessary elements, focus on clarity
- **Color Scheme:** Professional, trustworthy colors (blues, greens for success, reds for errors)
- **Typography:** Clean, readable fonts with proper hierarchy
- **Spacing:** Generous whitespace, proper padding and margins
- **Responsive:** Works well on desktop (mobile responsiveness is a bonus)
- **Animations:** Subtle, smooth animations for notifications and balance updates
- **Icons:** Use appropriate icons for transactions, balance, send/receive indicators

## Technical Requirements

- Use React/Next.js with TypeScript
- Use Axios or Fetch API for HTTP requests
- Use Socket.io-client for real-time updates
- Store JWT token securely (localStorage or sessionStorage)
- Implement proper error boundaries
- Clean, maintainable code structure
- No unnecessary dependencies or over-engineering
- Proper TypeScript types for all API responses

## Code Structure Example

```typescript
// API calls should be structured like:
const API_BASE_URL = 'http://localhost:5000';

// Authentication
const register = async (username: string, password: string) => { ... }
const login = async (username: string, password: string) => { ... }

// Transactions (with auth token)
const transferMoney = async (receiverId: string, amount: number, token: string) => { ... }
const getTransactionHistory = async (token: string) => { ... }

// Socket.io connection
const connectSocket = (userId: string) => { ... }
```

## Important Notes

1. **User Identification:** Users send money by entering the **receiver's User ID** (MongoDB ObjectId). This is the `receiverId` field in the transfer API.
2. **Default Balance:** New users start with ₹1,000.00
3. **Token Management:** Include JWT token in `Authorization: Bearer <token>` header for all protected routes
4. **Socket.io:** Must connect after login and join user's room using their user ID
5. **Real-time Updates:** Balance and notifications must update live when Socket.io events are received
6. **Transaction History:** Fetch on page load and refresh when new transactions occur

Generate a complete, production-ready frontend that connects seamlessly with this backend API.

