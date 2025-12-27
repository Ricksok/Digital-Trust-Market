# Trust Decay & Recovery Implementation ✅

## Overview

Enhanced trust scoring system with automatic decay for inactive users and recovery mechanisms for re-engaged users. This ensures trust scores remain accurate and reflect current user behavior.

---

## ✅ Implementation Summary

### 1. Database Schema Updates

**Added to User Model:**
- `lastActivityAt DateTime?` - Tracks last user activity timestamp

**Schema Status:**
- ✅ Schema updated
- ✅ Prisma Client generated
- ✅ Database in sync

### 2. Enhanced Trust Service

#### New Functions

**`applyTrustDecay(entityId, daysInactive?)`**
- Time-based decay calculation:
  - 30-60 days inactive: 0.5 points/month
  - 60-90 days inactive: 1 point/month
  - 90-180 days inactive: 2 points/month
  - 180+ days inactive: 3 points/month
- Returns `{ updated, decayApplied }` for tracking

**`applyTrustRecovery(entityId, activityType, activityValue)`**
- Recovery is 2x the decay rate to encourage re-engagement
- Capped at 5 points per recovery event
- Only applies if user was previously inactive (30+ days)
- Automatically updates `lastActivityAt`

**`trackUserActivity(entityId, activityType, activityValue)`**
- Updates `lastActivityAt` timestamp
- Applies recovery if user was previously inactive
- Call this for any meaningful user activity

**`processTrustDecayBatch(options?)`**
- Batch processes all inactive users
- Configurable batch size (default: 100)
- Returns `{ processed, decayed, errors }`
- Designed for scheduled execution (cron job)

**`getTrustDecayRecoveryHistory(entityId, limit?)`**
- Returns history of decay and recovery events
- Useful for audit and user transparency

### 3. API Endpoints

**New Endpoints:**
- `POST /api/trust/activity` - Track user activity (authenticated)
- `GET /api/trust/:entityId/decay-recovery` - Get decay/recovery history
- `POST /api/trust/admin/process-decay` - Batch process decay (admin only)

**Updated Endpoints:**
- All existing trust endpoints remain unchanged

### 4. Activity Tracking Integration

**Integrated Into:**
- ✅ Login flow (`auth.service.ts`)
  - Automatically tracks activity on successful login
  - Applies recovery if user was inactive

**To Be Integrated:**
- ⏳ Transaction completion
- ⏳ Order placement
- ⏳ Course enrollment/completion
- ⏳ Bid submission
- ⏳ Payment completion

---

## 🔄 Decay & Recovery Logic

### Decay Rates

| Inactivity Period | Decay Rate |
|-------------------|------------|
| < 30 days | 0 (no decay) |
| 30-60 days | 0.5 points/month |
| 60-90 days | 1.0 points/month |
| 90-180 days | 2.0 points/month |
| 180+ days | 3.0 points/month |

### Recovery Rates

- Recovery = Decay Rate × 2 (encourages re-engagement)
- Maximum recovery per event: 5 points
- Only applies if user was inactive (30+ days)

### Example Scenarios

**Scenario 1: User inactive for 90 days**
- Decay applied: 2.0 points/month × 3 months = 6 points
- User logs in → Recovery: 2.0 × 2 = 4 points (capped at 5)

**Scenario 2: User inactive for 200 days**
- Decay applied: 3.0 points/month × ~6.7 months = ~20 points
- User logs in → Recovery: 3.0 × 2 = 6 points (capped at 5)

---

## 📊 Trust Events

All decay and recovery events are logged in `TrustEvent` table:

**Event Types:**
- `TRUST_DECAY_APPLIED` - Decay was applied
- `TRUST_RECOVERY_EVENT` - Recovery was applied

**Event Details:**
- `previousScore` - Score before change
- `newScore` - Score after change
- `changeAmount` - Delta (negative for decay, positive for recovery)
- `reason` - Human-readable explanation
- `calculationDetails` - JSON with calculation breakdown

---

## 🚀 Usage Examples

### Track Activity on Login
```typescript
// Already integrated in auth.service.ts
await trackUserActivity(userId, 'LOGIN', 1);
```

### Track Activity on Transaction
```typescript
// After successful transaction
await trackUserActivity(userId, 'TRANSACTION', 1.5); // Higher value for transactions
```

### Track Activity on Course Completion
```typescript
// After course completion
await trackUserActivity(userId, 'LEARNING', 2.0); // Higher value for learning
```

### Batch Process Decay (Admin)
```typescript
// Run daily via cron job
const result = await processTrustDecayBatch({
  batchSize: 100,
  maxDays: 365
});
// Returns: { processed: 50, decayed: 12, errors: 0 }
```

### Get Decay/Recovery History
```typescript
const history = await getTrustDecayRecoveryHistory(userId, 20);
// Returns array of decay/recovery events
```

---

## 🔧 Configuration

### Decay Thresholds
Currently hardcoded in `calculateDecayAmount()`:
- 30 days: Start of decay
- 60 days: Moderate decay
- 90 days: Significant decay
- 180 days: Heavy decay

### Recovery Multiplier
Currently set to 2x decay rate in `applyTrustRecovery()`.

### Batch Processing
Default batch size: 100 users per run.

---

## 📝 Next Steps

### P1 - Integration
1. **Transaction Activity Tracking**
   - Integrate into order completion
   - Integrate into payment completion
   - Integrate into delivery confirmation

2. **Learning Activity Tracking**
   - Integrate into course enrollment
   - Integrate into course completion
   - Integrate into quiz completion

3. **Auction Activity Tracking**
   - Integrate into bid submission
   - Integrate into contract award

### P2 - Enhancement
4. **Scheduled Jobs**
   - Set up daily cron job for batch decay processing
   - Monitor and alert on batch processing errors

5. **User Notifications**
   - Notify users when decay is applied
   - Notify users when recovery is applied
   - Show decay/recovery history in user dashboard

6. **Admin Dashboard**
   - Display decay/recovery statistics
   - Manual trigger for batch processing
   - Decay/recovery trend charts

---

## ✅ Testing Checklist

- [ ] Test decay calculation for different inactivity periods
- [ ] Test recovery application on login after inactivity
- [ ] Test batch processing with various batch sizes
- [ ] Test activity tracking integration
- [ ] Test decay/recovery history retrieval
- [ ] Test edge cases (score at 0, score at 100)
- [ ] Test concurrent activity tracking

---

## 🎯 Benefits

1. **Accurate Trust Scores**: Trust scores reflect current user behavior
2. **Encourages Engagement**: Recovery mechanism incentivizes re-engagement
3. **Fair Decay**: Graduated decay rates prevent sudden score drops
4. **Audit Trail**: All decay/recovery events are logged
5. **Scalable**: Batch processing handles large user bases efficiently

---

**Status**: ✅ Core Implementation Complete
**Date**: Current
**Next Action**: Integrate activity tracking into transaction and learning flows

