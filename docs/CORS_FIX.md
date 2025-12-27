# CORS Configuration Fixed

## Issue
Frontend running on `http://localhost:3002` was blocked by CORS because backend only allowed `http://localhost:3000`.

## Solution
Updated CORS configuration in `backend/src/index.ts` to:
- Allow multiple localhost ports (3000, 3001, 3002)
- Allow any localhost origin in development mode
- Still respect `FRONTEND_URL` environment variable for production

## Next Step
**Restart the backend server** for the changes to take effect:

```bash
# Stop the backend server (Ctrl+C)
# Then restart:
cd backend
npm run dev
```

## What Changed

**Before:**
```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

**After:**
```typescript
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin
    if (!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // In development, allow any localhost origin
      if (process.env.NODE_ENV !== 'production' && origin?.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true
}));
```

This ensures the frontend on any localhost port can connect to the backend in development mode.





