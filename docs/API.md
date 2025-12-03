# CreatorAI API Documentation

## Base URL
```
Development: http://localhost:3001
Production: TBD
```

## Authentication

All protected endpoints require JWT authentication via `Authorization: Bearer <token>` header.

### Get JWT Token
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "id": "user-id"
}

Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

## Creator Management

### Create Creator Profile
```http
POST /creator/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "string",
  "bio": "string"
}

Response:
{
  "id": "uuid",
  "userId": "uuid",
  "bio": "string",
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

### Create AI Persona
```http
POST /creator/persona
Authorization: Bearer <token>

{
  "creatorId": "uuid",
  "name": "string",
  "description": "string",
  "avatarUrl": "string",
  "personality": {
    "friendliness": 80,
    "humor": 50
  }
}
```

### Add Training Data
```http
POST /creator/training-data
Authorization: Bearer <token>

{
  "personaId": "uuid",
  "content": "string",
  "type": "TEXT" | "FILE"
}
```

---

## Chat

### Create Conversation
```http
POST /chat/conversation
Authorization: Bearer <token>

{
  "userId": "uuid",
  "personaId": "uuid"
}

Response:
{
  "id": "uuid",
  "userId": "uuid",
  "personaId": "uuid",
  "persona": { ... }
}
```

### Get Messages
```http
GET /chat/conversation/:conversationId/messages
Authorization: Bearer <token>

Response: Array<{
  "id": "uuid",
  "conversationId": "uuid",
  "sender": "USER" | "CREATOR",
  "content": "string",
  "createdAt": "ISO8601"
}>
```

### Send Message (WebSocket)
```javascript
socket.emit('sendMessage', {
  conversationId: 'uuid',
  content: 'Hello!',
  sender: 'USER',
  personaId: 'uuid',
  userId: 'uuid',
  creatorUserId: 'uuid'
})

// Server emits back:
socket.on('newMessage', (message) => {
  // Message object with timestamp
})

// AI response follows automatically
```

---

## Payments

### Get Coin Packs
```http
GET /payment/coin-packs

Response: Array<{
  "id": "uuid",
  "name": "string",
  "coins": number,
  "bonusCoins": number,
  "priceUSD": number,
  "priceINR": number,
  "isActive": boolean
}>
```

### Create Stripe Payment
```http
POST /payment/stripe/create-intent

{
  "userId": "uuid",
  "coinPackId": "uuid"
}

Response:
{
  "clientSecret": "string",
  "paymentIntentId": "string"
}
```

### Create Razorpay Order
```http
POST /payment/razorpay/create-order

{
  "userId": "uuid",
  "coinPackId": "uuid"
}

Response:
{
  "orderId": "string",
  "amount": number,
  "currency": "INR"
}
```

### Webhook Handlers
```http
POST /payment/stripe/webhook
Headers: stripe-signature

POST /payment/razorpay/webhook
Headers: x-razorpay-signature
```

---

## Coin Management

### Get Balance
```http
GET /coin/balance/:userId

Response:
{
  "balance": number
}
```

### Get Transaction History
```http
GET /coin/transactions/:userId

Response: Array<{
  "id": "uuid",
  "type": "PURCHASE" | "SPEND" | "EARN" | "REFUND",
  "amount": number,
  "description": "string",
  "createdAt": "ISO8601"
}>
```

---

## Analytics

### Get Creator Overview
```http
GET /analytics/creator/:userId/overview

Response:
{
  "totalEarnings": number,
  "totalMessages": number,
  "activePersonas": number,
  "coinBalance": number
}
```

### Get Earnings Time-Series  
```http
GET /analytics/creator/:userId/earnings?days=30

Response: Array<{
  "date": "YYYY-MM-DD",
  "earnings": number
}>
```

### Get Message Stats
```http
GET /analytics/creator/:userId/messages

Response: Array<{
  "date": "YYYY-MM-DD",
  "messages": number
}>
```

### Get Persona Performance
```http
GET /analytics/creator/:userId/personas

Response: Array<{
  "id": "uuid",
  "name": "string",
  "messages": number,
  "uniqueUsers": number
}>
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

Common status codes:
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

Not yet implemented. Plan: 100 requests/minute per IP.

---

## Webhooks

### Stripe Webhook Events
- `payment_intent.succeeded` - Payment completed

### Razorpay Webhook Events
- `payment.captured` - Payment captured

Both webhooks automatically:
1. Verify signature
2. Update payment status
3. Grant coins to user wallet
