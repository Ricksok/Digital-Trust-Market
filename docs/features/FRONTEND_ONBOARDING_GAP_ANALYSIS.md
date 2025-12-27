# Frontend Onboarding Workflow - Gap Analysis

## Current State vs. Required State

### 1. Landing Page → Registration Flow

#### Current State ✅
- Landing page (`/`) exists with "Get Started" CTA
- Links to `/auth/register`
- Basic registration form exists

#### Gaps ❌
- No workflow mapping from landing page
- No role-based CTAs (e.g., "I'm a Trader", "I'm a Supplier", "I'm a Buyer")

### 2. Registration Page (`/auth/register`)

#### Current State ✅
- Form with email, password, firstName, lastName
- Role selection dropdown
- Password confirmation
- Form validation

#### Critical Gaps ❌

**A. Role Mismatch**
- **Current**: Uses legacy roles (`INDIVIDUAL_INVESTOR`, `INSTITUTIONAL_INVESTOR`, `SME_STARTUP`, etc.)
- **Required**: Should use workflow roles (`RETAIL_TRADER`, `SUPPLIER`, `BUYER`)
- **Impact**: Backend will reject registration

**B. Missing Entity Type Selection**
- **Current**: No entity type field
- **Required**: Must collect `entityType` (INDIVIDUAL, COMPANY, SACCO, FUND, INSTITUTIONAL_BUYER)
- **Impact**: Cannot initialize trust band correctly

**C. Wrong API Endpoint**
- **Current**: Calls `/api/auth/register`
- **Required**: Should call `/api/onboarding/register`
- **Impact**: Uses old auth flow, bypasses onboarding

**D. Missing Phone Field**
- **Current**: No phone field
- **Required**: Optional but recommended for KYC
- **Impact**: Lower data quality

**E. Wrong Redirect**
- **Current**: Redirects to `/dashboard` after registration
- **Required**: Should redirect to `/onboarding` if onboarding incomplete
- **Impact**: Users skip onboarding steps

### 3. Onboarding Page (`/onboarding`)

#### Current State ❌
- **Does not exist**
- **Required**: Complete onboarding workflow page

#### Required Components
1. **OnboardingProgress** - Progress indicator showing steps
2. **KYCUpload** - Document upload for identity verification
3. **BusinessVerificationForm** - For COMPANY entities
4. **MembershipLinkForm** - For COOP/SACCO members
5. **Status Display** - Show current trust band, transaction caps

### 4. Dashboard Page (`/dashboard`)

#### Current State ✅
- Basic dashboard exists
- Shows user info

#### Gaps ❌
- **No onboarding status check**
  - Should check if `onboardingCompleted === false`
  - Should redirect to `/onboarding` if incomplete
- **No trust band display**
- **No transaction cap display**
- **No permission-based module visibility**
- **No Action Center** (pending approvals, alerts)

### 5. API Integration

#### Current State ✅
- `lib/api/auth.ts` exists
- Basic auth API client

#### Gaps ❌
- **No onboarding API client** (`lib/api/onboarding.ts`)
- **Missing endpoints**:
  - `POST /api/onboarding/register`
  - `GET /api/onboarding/status`
  - `GET /api/onboarding/profile`
  - `POST /api/onboarding/business/verify`
  - `POST /api/onboarding/membership/link`
  - `POST /api/onboarding/complete`

### 6. State Management

#### Current State ✅
- Auth store exists (`lib/stores/auth.store.ts`)

#### Gaps ❌
- **No onboarding status in auth store**
- **No trust band in user state**
- **No transaction cap in user state**

### 7. React Query Hooks

#### Current State ✅
- Auth queries exist (`lib/queries/auth.queries.ts`)

#### Gaps ❌
- **No onboarding queries** (`lib/queries/onboarding.queries.ts`)
- Missing hooks:
  - `useOnboardingStatus()`
  - `useUserProfile()`
  - `useSubmitBusinessVerification()`
  - `useLinkMembership()`
  - `useCompleteOnboarding()`

### 8. Type Definitions

#### Current State ✅
- `RegisterData` interface exists

#### Gaps ❌
- **Missing onboarding types**:
  - `OnboardingStatus`
  - `UserProfile`
  - `BusinessVerificationInput`
  - `MembershipLinkageInput`
  - `TrustBandResult`
  - `TransactionCapsResult`

## Workflow Mapping

### Required User Journey

```
Landing Page (/)
  ↓
  [Click "Get Started" or role-specific CTA]
  ↓
Registration Page (/auth/register)
  ↓
  [Fill form: email, password, name, role, entityType]
  ↓
  [Submit → POST /api/onboarding/register]
  ↓
Onboarding Page (/onboarding)
  ↓
  [Step 1: KYC Upload (if INDIVIDUAL)]
  ↓
  [Step 2: Business Verification (if COMPANY)]
  ↓
  [Step 3: Membership Link (if COOP/SACCO member)]
  ↓
  [Step 4: Review Status (trust band, caps)]
  ↓
  [Complete Onboarding]
  ↓
Dashboard (/dashboard)
  ↓
  [Shows personalized modules based on permissions]
  ↓
  [Shows trust band, transaction caps]
```

### Current Broken Journey

```
Landing Page (/)
  ↓
Registration Page (/auth/register)
  ↓
  [Uses wrong roles, missing entityType]
  ↓
  [Calls wrong endpoint: /api/auth/register]
  ↓
  [Redirects to /dashboard] ❌
  ↓
Dashboard (/dashboard)
  ↓
  [No onboarding check] ❌
  [User stuck, can't complete onboarding]
```

## Implementation Priority

### P0 - Critical (Blocks Registration)
1. ✅ Fix role mapping (legacy → workflow roles)
2. ✅ Add entityType field to registration form
3. ✅ Update API endpoint to `/api/onboarding/register`
4. ✅ Create onboarding API client
5. ✅ Fix redirect logic (→ `/onboarding` if incomplete)

### P1 - High (Blocks Onboarding Completion)
6. ✅ Create `/onboarding` page
7. ✅ Create onboarding progress component
8. ✅ Create KYC upload component
9. ✅ Create business verification form
10. ✅ Create membership link form
11. ✅ Add onboarding status check to dashboard

### P2 - Medium (Enhances UX)
12. ✅ Add trust band display
13. ✅ Add transaction cap display
14. ✅ Add permission-based module visibility
15. ✅ Add Action Center
16. ✅ Add role-specific CTAs on landing page

### P3 - Low (Nice to Have)
17. ✅ Add phone field to registration
18. ✅ Add onboarding status to auth store
19. ✅ Add loading states
20. ✅ Add error handling improvements

## Files to Create/Modify

### New Files
- `frontend/lib/api/onboarding.ts` - Onboarding API client
- `frontend/lib/queries/onboarding.queries.ts` - React Query hooks
- `frontend/app/onboarding/page.tsx` - Onboarding page
- `frontend/components/onboarding/OnboardingProgress.tsx`
- `frontend/components/onboarding/KYCUpload.tsx`
- `frontend/components/onboarding/BusinessVerificationForm.tsx`
- `frontend/components/onboarding/MembershipLinkForm.tsx`

### Files to Modify
- `frontend/app/auth/register/page.tsx` - Fix roles, add entityType, fix endpoint
- `frontend/lib/api/auth.ts` - May need updates
- `frontend/lib/queries/auth.queries.ts` - Update register hook
- `frontend/app/dashboard/page.tsx` - Add onboarding check, trust band, caps
- `frontend/lib/stores/auth.store.ts` - Add onboarding fields
- `frontend/app/page.tsx` - Add role-specific CTAs (optional)

---

**Status**: Ready for implementation
**Estimated Effort**: 4-6 hours
**Risk**: Medium (requires coordination between frontend and backend)


