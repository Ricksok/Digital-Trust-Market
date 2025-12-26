# Trust Engine - Quick Start Guide

## ✅ What's Been Completed

### Database Migration
- ✅ Migration `20251224201858_add_trust_engine` applied successfully
- ✅ All 5 new models created: TrustScore, TrustEvent, BehaviorMetrics, ReadinessMetrics, GuarantorScore
- ✅ Trust scores initialized for all 11 existing users

### API Endpoints Available
All endpoints require authentication (Bearer token):

1. **Get Trust Score**
   ```
   GET /api/trust/:entityId
   GET /api/trust  (gets own score)
   ```

2. **Get Trust History**
   ```
   GET /api/trust/:entityId/history?limit=50
   ```

3. **Explain Trust Score**
   ```
   GET /api/trust/:entityId/explain
   ```
   Returns detailed breakdown of how the score was calculated

4. **Recalculate Trust Score**
   ```
   POST /api/trust/:entityId/recalculate
   Body: {
     triggerType?: "AUTOMATIC" | "MANUAL" | "TRANSACTION" | "LEARNING" | "BEHAVIOR",
     triggerEntityId?: string,
     triggerEntityType?: string
   }
   ```

5. **Manual Adjustment (Admin Only)**
   ```
   POST /api/trust/:entityId/adjust
   Body: {
     adjustment: number,  // Positive or negative number
     reason: string
   }
   ```

## 🧪 Testing the Trust Engine

### Using curl or Postman:

1. **Get your trust score** (after logging in):
   ```bash
   GET http://localhost:3001/api/trust
   Authorization: Bearer YOUR_TOKEN
   ```

2. **Get detailed explanation**:
   ```bash
   GET http://localhost:3001/api/trust/YOUR_USER_ID/explain
   Authorization: Bearer YOUR_TOKEN
   ```

3. **View trust history**:
   ```bash
   GET http://localhost:3001/api/trust/YOUR_USER_ID/history?limit=10
   Authorization: Bearer YOUR_TOKEN
   ```

### Example Response:

```json
{
  "success": true,
  "data": {
    "id": "...",
    "entityId": "...",
    "trustScore": 75.5,
    "readinessScore": 0,
    "behaviorScore": 78.0,
    "identityTrust": 90.0,
    "transactionTrust": 70.0,
    "financialTrust": 80.0,
    "performanceTrust": 75.0,
    "learningTrust": 50.0,
    "lastCalculatedAt": "2025-12-24T...",
    "calculationVersion": "1.0"
  }
}
```

## 📊 Current Trust Scores

All users have been initialized with trust scores based on:
- **Identity Trust**: KYC status, verification, active status
- **Transaction Trust**: Default 50 (no transaction history yet)
- **Financial Trust**: Default 50 (no payment history yet)
- **Performance Trust**: Default 50 (no delivery history yet)
- **Learning Trust**: 0 (no courses completed yet)

As users transact, make payments, complete deliveries, and take courses, their trust scores will automatically update.

## 🔄 Next Integration Steps

To make the Trust Engine active in the system:

1. **Integrate with Investment Service**
   - Check trust score before allowing investments
   - Adjust investment limits based on trust

2. **Integrate with Project Service**
   - Require minimum trust score to create projects
   - Show trust score on project pages

3. **Update Behavior Metrics**
   - Hook into payment events
   - Track transaction outcomes
   - Update delivery metrics

4. **Frontend Integration**
   - Display trust scores on user profiles
   - Show trust breakdown
   - Trust score dashboard

## 📝 Notes

- Trust scores are recalculated automatically when:
  - Score is older than 24 hours
  - Triggered by events (transactions, payments, etc.)
  - Manually requested via API

- All trust changes are logged immutably in TrustEvent table

- Trust scores range from 0-100

- Higher trust scores unlock:
  - Better auction eligibility
  - Lower interest rates
  - Reduced guarantee requirements
  - Faster escrow releases

