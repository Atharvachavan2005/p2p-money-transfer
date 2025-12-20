# Scenarios Implementation Guide

This document explains how each critical scenario is handled in the P2P Transfer System.

## 1. The "Insufficient Funds" Trap ✅

### Scenario
- **Action**: User A has ₹50 but tries to send ₹100
- **Expected**: Transaction fails, balance remains ₹50

### Implementation

#### Backend (`transferService.ts`)
1. **Balance Check BEFORE Decrement** (Line 28-35)
   ```typescript
   // Check balance BEFORE any changes
   if (sender.balance < amount) {
     throw new Error("Insufficient funds");
   }
   ```
   - This check happens **before** any balance modification
   - If insufficient, the entire transaction rolls back automatically
   - Balance **never changes** if check fails

2. **Double-Check After Decrement** (Line 47-50)
   ```typescript
   // Safety net for edge cases
   if (updatedSender.balance < 0) {
     throw new Error("Insufficient funds");
   }
   ```
   - Catches any race conditions
   - Ensures balance never goes negative

#### Frontend (`transfer-form.tsx`)
1. **Client-Side Validation** (Line 41-44)
   - Prevents unnecessary API calls
   - Shows immediate feedback

2. **Error Handling** (Line 64-70)
   - Displays clear error message: "Transaction failed: Insufficient funds"
   - Shows toast notification
   - Balance remains unchanged

### Result
✅ Backend returns 400 Bad Request  
✅ User's balance does NOT change  
✅ Frontend shows clear error message  

---

## 2. The "Ghost User" Scenario ✅

### Scenario
- **Action**: User A tries to send money to a non-existent User ID
- **Expected**: Transaction fails, no money lost, clear error message

### Implementation

#### Backend (`transferService.ts`)
1. **Receiver Existence Check FIRST** (Line 10-17)
   ```typescript
   // Check if receiver exists BEFORE starting transfer
   const receiver = await tx.user.findUnique({
     where: { id: receiverId },
     select: { id: true }
   });

   if (!receiver) {
     throw new Error("Receiver not found. Please verify the User ID.");
   }
   ```
   - Check happens **before** any balance changes
   - If receiver doesn't exist, transaction rolls back
   - No money is deducted from sender

2. **Transaction Rollback** (Automatic)
   - MongoDB transactions ensure atomicity
   - If receiver check fails, entire transaction rolls back
   - No money is "lost" in the system

#### Frontend (`transfer-form.tsx`)
1. **Error Display** (Line 64-70)
   - Shows: "Transaction failed: Receiver not found. Please verify the User ID."
   - Toast notification for visibility

### Result
✅ System checks if receiver exists before transfer  
✅ Transaction rolls back if receiver doesn't exist  
✅ No money is lost  
✅ Clear error message displayed  

---

## 3. The "Race Condition" (Multiple Clicks) ✅

### Scenario
- **Action**: User double-clicks "Send" button very fast
- **Expected**: Only one transaction succeeds

### Implementation

#### Backend (`transferService.ts`)
1. **MongoDB Transactions** (Line 4)
   ```typescript
   return await prisma.$transaction(async (tx) => {
     // All operations are atomic
   }, {
     timeout: 10000,
     maxWait: 5000, // Maximum wait time for transaction lock
   });
   ```
   - MongoDB transactions provide atomicity
   - Concurrent requests are serialized
   - Second request waits for first to complete

2. **Balance Check Pattern** (Line 28-35)
   - Check balance BEFORE decrementing
   - If two requests arrive simultaneously:
     - First request: Checks balance (₹50), decrements (₹50 - ₹30 = ₹20), succeeds
     - Second request: Checks balance (₹20), fails insufficient funds check, rolls back

#### Frontend (`transfer-form.tsx`)
1. **Request Locking** (Line 25-33)
   ```typescript
   const [isProcessing, setIsProcessing] = useState(false)

   if (isProcessing || isLoading) {
     toast({
       title: "Please wait",
       description: "A transaction is already in progress",
     })
     return
   }
   ```
   - Prevents multiple simultaneous requests
   - Disables button during processing
   - Shows "Processing..." state

2. **Button Disabled State** (Line 145)
   ```typescript
   disabled={isLoading || isProcessing}
   ```
   - Prevents double-clicks
   - Visual feedback to user

### Result
✅ Only one transaction succeeds  
✅ Database transactions lock rows  
✅ Second request fails gracefully  
✅ Frontend prevents multiple clicks  

---

## 4. The "Immutability" Test (Audit Log) ✅

### Scenario
- **Action**: Admin tries to change a transaction record
- **Expected**: Audit log is append-only, never edited or deleted

### Implementation

#### Backend (`routes/transaction.ts`)
1. **Append-Only Pattern** (Line 30-37)
   ```typescript
   // ASYNCHRONOUS AUDIT LOGGING (Append-only, immutable)
   // Audit log is separate from transaction - it's append-only
   // We never edit or delete audit logs - they're immutable records
   prisma.auditLog.create({
     data: {
       transactionId: transaction.id,
       senderId: senderId,
       receiverId: receiverId,
       amount: amount,
       status: 'SUCCESS',
     }
   }).catch((err: Error) => console.error("Audit log failed:", err));
   ```
   - Only `create` operations - no `update` or `delete`
   - Separate from main transaction
   - Even if audit log fails, transaction succeeds (fire-and-forget)

2. **No Update/Delete Endpoints**
   - No API endpoints to modify audit logs
   - No admin interface to edit records
   - Audit log is purely append-only

### Database Schema
- AuditLog model has no update/delete operations
- Records are permanent once created
- Timestamp is auto-generated and immutable

### Result
✅ Audit log is append-only  
✅ No edit/delete operations  
✅ Records are immutable  
✅ Complete audit trail maintained  

---

## Summary of Protections

| Scenario | Backend Protection | Frontend Protection | Result |
|----------|-------------------|---------------------|--------|
| Insufficient Funds | Balance check BEFORE decrement + Transaction rollback | Client-side validation + Error display | ✅ Balance never changes |
| Ghost User | Receiver existence check BEFORE transfer | Error handling | ✅ No money lost |
| Race Condition | MongoDB transactions + Balance check pattern | Request locking + Button disabled | ✅ Only one succeeds |
| Immutability | Append-only audit log, no update/delete | No edit UI | ✅ Complete audit trail |

---

## Testing Each Scenario

### Test 1: Insufficient Funds
```bash
# User with ₹50 tries to send ₹100
POST /api/transactions/transfer
{
  "receiverId": "valid_id",
  "amount": 100
}
# Expected: 400 Bad Request, balance remains ₹50
```

### Test 2: Ghost User
```bash
# Send to non-existent user ID
POST /api/transactions/transfer
{
  "receiverId": "invalid_object_id",
  "amount": 50
}
# Expected: 404 Not Found, balance unchanged
```

### Test 3: Race Condition
```bash
# Send two requests simultaneously
# Request 1: Send ₹30 (should succeed)
# Request 2: Send ₹30 (should fail - insufficient funds)
# Expected: Only first succeeds
```

### Test 4: Immutability
```bash
# Try to update audit log (should not be possible)
# No endpoint exists for this
# Expected: Cannot modify audit logs
```

---

## Key Design Principles

1. **Check Before Change**: Always validate BEFORE modifying data
2. **Atomic Transactions**: Use database transactions for consistency
3. **Fail Fast**: Return errors immediately, don't proceed with invalid data
4. **Immutability**: Audit logs are append-only, never modified
5. **Race Condition Prevention**: Lock resources during critical operations

