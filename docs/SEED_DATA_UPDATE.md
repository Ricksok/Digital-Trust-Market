# Seed Data Update - Trust Engine Alignment

## Summary
The seed file has been updated to include Trust Engine data that aligns with the created investments, payments, and projects.

## What Was Updated

### 1. Data Clearing
Added clearing of trust-related tables before seeding:
- `TrustEvent`
- `GuarantorScore`
- `ReadinessMetrics`
- `BehaviorMetrics`
- `TrustScore`

### 2. Behavior Metrics Creation
Behavior metrics are now calculated based on actual user activities:

**For Investors:**
- Transaction metrics calculated from their investments
- Payment metrics from payment records
- Escrow metrics from escrow contracts
- Delivery timeliness (simulated based on investment activity)
- Bid metrics (based on investments)
- Dispute rates (simulated)

**For Fundraisers:**
- Transaction metrics from their projects
- Payment metrics from payments received
- Delivery metrics (simulated based on project activity)
- Dispute rates (simulated)

**For Admin:**
- Minimal activity metrics (all zeros or perfect scores)

### 3. Readiness Metrics Creation
**For Fundraisers:**
- First 3 fundraisers have completed courses (2-6 courses)
- Some have certifications
- Varying levels of documentation readiness
- Financial, governance, and compliance readiness scores

**For Investors:**
- First 3 investors have completed some courses (1-3 courses)
- Basic finance courses
- No certifications (investors focus on learning, not readiness)

### 4. Trust Score Calculation
All users now have trust scores calculated using the Trust Engine service:
- Scores are based on actual KYC status
- Behavior metrics influence transaction, financial, and performance trust
- Readiness metrics influence learning trust
- Overall trust score is a weighted average

## Trust Score Distribution

Based on the seed data:

**High Trust (80-100):**
- Admin: High identity trust (verified, KYC approved)
- Verified investors with successful investments
- Fundraisers with approved projects and good metrics

**Medium Trust (50-79):**
- Investors with some activity but not verified
- Fundraisers with mixed project success
- Users with partial KYC completion

**Low Trust (0-49):**
- New users with no activity
- Users with failed transactions
- Unverified users

## Data Relationships

The seed data now maintains consistency:
- Investments → Behavior Metrics (transaction success, payments)
- Payments → Behavior Metrics (payment punctuality)
- Projects → Behavior Metrics (for fundraisers)
- KYC Status → Identity Trust
- Courses → Learning Trust
- All metrics → Overall Trust Score

## Example Trust Scores

After seeding, you can expect:

**Investor 1 (Verified, Active):**
- Identity Trust: ~90 (KYC approved, verified)
- Transaction Trust: ~70-85 (based on investment success)
- Financial Trust: ~80-90 (good payment history)
- Overall Trust: ~75-85

**Fundraiser 1 (With Courses, Active Projects):**
- Identity Trust: ~90 (KYC approved)
- Transaction Trust: ~70-80 (project success rate)
- Learning Trust: ~40-60 (courses completed)
- Overall Trust: ~70-80

## Testing

To verify the trust scores:

```bash
# Get trust score for a user
GET /api/trust/:userId

# Get detailed explanation
GET /api/trust/:userId/explain

# View trust history
GET /api/trust/:userId/history
```

## Next Steps

1. **Frontend Integration**: Display trust scores on user profiles
2. **Trust-Based Features**: Use trust scores to gate features
3. **Real-time Updates**: Hook into transaction events to update metrics
4. **Trust Dashboard**: Create UI to view and understand trust scores

