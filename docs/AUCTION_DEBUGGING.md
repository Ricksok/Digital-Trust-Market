# Auction Loading Debugging Guide

## Issues Fixed

### 1. Response Format
- **Backend:** Returns `{ success: true, data: auctions, pagination: {...} }`
- **Frontend:** Expects `response.data` to be an array
- **Fix:** Controller now extracts `result.auctions` and returns as `data`

### 2. Place Bid Button
- **Issue:** Button not submitting or showing errors
- **Fix:** Added validation, better error handling, and console logging

### 3. Error Handling
- **Added:** Console logs to track API responses
- **Added:** Better error messages
- **Added:** Validation for bid price

## Debugging Steps

### Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for:
   - `Auctions API response:` - Shows what the API returned
   - `Setting auctions:` - Shows how many auctions were found
   - `Error fetching auctions:` - Shows any errors

### Check Network Tab
1. Open browser DevTools (F12)
2. Go to Network tab
3. Look for `/api/auctions` request
4. Check:
   - Status code (should be 200)
   - Response body (should have `{ success: true, data: [...] }`)

### Check Backend Logs
1. Look at backend terminal
2. Check for any errors when calling `/api/auctions`
3. Common issues:
   - Prisma client not regenerated
   - Database connection issues
   - Missing tables

## Common Issues

### Issue: "Auctions not loading"
**Possible causes:**
1. Backend not running
2. CORS error
3. Authentication token missing/invalid
4. API returning wrong format
5. Database has no auctions

**Solutions:**
1. Check backend is running on port 3001
2. Check browser console for CORS errors
3. Check localStorage has 'token'
4. Check Network tab for actual API response
5. Run seed: `npm run db:seed`

### Issue: "Place Bid button not working"
**Possible causes:**
1. Form validation failing
2. API error
3. Missing authentication
4. Auction not active

**Solutions:**
1. Check browser console for errors
2. Check Network tab for `/api/auctions/:id/bids` request
3. Ensure you're logged in as investor
4. Ensure auction status is ACTIVE

## Testing

### Test Auctions List
```bash
# In browser console or Postman
GET http://localhost:3001/api/auctions
Headers: Authorization: Bearer <token>
```

Expected response:
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "title": "...",
      "status": "ACTIVE",
      ...
    }
  ],
  "pagination": { ... }
}
```

### Test Place Bid
```bash
POST http://localhost:3001/api/auctions/:id/bids
Headers: Authorization: Bearer <token>
Body: {
  "price": 100000,
  "amount": 50000
}
```

Expected response:
```json
{
  "success": true,
  "data": {
    "id": "...",
    "price": 100000,
    "status": "PENDING",
    ...
  }
}
```





