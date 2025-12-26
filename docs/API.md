# API Documentation

## Base URL

```
http://localhost:3001/api
```

## Authentication

Most endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### POST `/auth/register`
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "INDIVIDUAL_INVESTOR",
  "userType": "INVESTOR"
}
```

#### POST `/auth/login`
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### POST `/auth/web3/connect`
Connect Web3 wallet.

**Request Body:**
```json
{
  "walletAddress": "0x...",
  "signature": "...",
  "message": "..."
}
```

#### GET `/auth/me`
Get current user (requires auth).

### Projects

#### GET `/projects`
Get all projects (paginated).

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by status
- `category`: Filter by category
- `search`: Search term

#### GET `/projects/:id`
Get project by ID.

#### POST `/projects`
Create a new project (requires auth, fundraiser role).

**Request Body:**
```json
{
  "title": "Project Title",
  "description": "Project description",
  "category": "Technology",
  "targetAmount": 100000,
  "minInvestment": 1000,
  "maxInvestment": 50000,
  "images": ["url1", "url2"],
  "documents": ["url1"]
}
```

### Investments

#### GET `/investments`
Get user's investments (requires auth).

#### POST `/investments`
Create a new investment (requires auth, investor role).

**Request Body:**
```json
{
  "projectId": "project-id",
  "amount": 5000,
  "notes": "Optional notes"
}
```

### KYC

#### POST `/kyc/submit`
Submit KYC documents (requires auth).

**Request Body:**
```json
{
  "documentType": "PASSPORT",
  "documentNumber": "ABC123",
  "documentUrl": "https://..."
}
```

#### GET `/kyc/status`
Get KYC status (requires auth).

### Payments

#### POST `/payments/initiate`
Initiate a payment (requires auth).

**Request Body:**
```json
{
  "investmentId": "investment-id",
  "amount": 5000,
  "currency": "USD",
  "paymentMethod"
  : "CARD"
}
```

### Escrow

#### POST `/escrow/create`
Create escrow contract (requires auth).

**Request Body:**
```json
{
  "investmentId": "investment-id",
  "amount": 5000,
  "releaseConditions": {}
}
```

#### POST `/escrow/:id/release`
Release escrow funds (requires auth).

#### POST `/escrow/:id/refund`
Refund escrow funds (requires auth).

### Analytics

#### GET `/analytics/dashboard`
Get dashboard data (requires auth).

### Compliance

#### POST `/compliance/submit`
Submit compliance documents (requires auth).

#### GET `/compliance/status`
Get compliance status (requires auth).

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "stack": "Stack trace (development only)"
  }
}
```

## Success Responses

All success responses follow this format:

```json
{
  "success": true,
  "data": { ... }
}
```


