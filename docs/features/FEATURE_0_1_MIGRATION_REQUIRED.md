# Feature 0.1: Database Migration Required

## Issue
The Prisma client needs to be regenerated after adding new fields to the schema. The new fields (`onboardingCompleted`, `onboardingStep`, `transactionCap`, `trustBand`) and new models (`BusinessVerification`, `MembershipLinkage`) are not yet in the generated Prisma client.

## Solution

### Step 1: Create and Run Migration
```bash
cd backend
npx prisma migrate dev --name add_onboarding_feature
```

This will:
- Create a migration file with the new fields and models
- Apply the migration to your database
- Regenerate the Prisma client

### Step 2: Verify Migration
```bash
npx prisma generate
```

### Step 3: Run Tests Again
```bash
npm test
```

## What Will Be Added

### User Model Fields
- `onboardingCompleted` (Boolean)
- `onboardingStep` (String?)
- `transactionCap` (Float?)
- `trustBand` (String?)

### New Models
- `BusinessVerification`
- `MembershipLinkage`

### New Relations
- `User.businessVerification` (1:1)
- `User.membershipLinkages` (1:many)

---

**Note**: After running the migration, all TypeScript errors should be resolved and tests should pass.

