# Feature 0.1: Onboarding & Identity System

## Overview
- **Goal**: Enable secure user onboarding with identity verification, role assignment, and personalized access
- **Scope**: User registration, authentication, KYC, role assignment, trust initialization, dashboard personalization
- **User Personas**: All new users (retail traders, suppliers, buyers, co-op members, SACCO members, etc.)
- **Success Criteria**: 
  - Users can register and verify identity within 24 hours
  - Roles assigned correctly based on user type
  - Trust bands initialized for all users
  - Personalized dashboard shows only allowed features

---

## User Stories

### Epic 1: User Registration & Authentication

#### Story 1.1: User Registration
**As a** new user  
**I want to** register with email/password or Web3 wallet  
**So that** I can access the platform

**Acceptance Criteria:**
- [ ] User can register with email, password, firstName, lastName
- [ ] User can register with Web3 wallet (walletAddress, signature)
- [ ] Email validation and uniqueness check
- [ ] Password strength requirements enforced
- [ ] Registration creates User record with default role
- [ ] Email verification sent (optional for MVP)

**Edge Cases:**
- Duplicate email registration
- Invalid wallet signature
- Weak password

#### Story 1.2: User Login
**As a** registered user  
**I want to** login with credentials or Web3 wallet  
**So that** I can access my account

**Acceptance Criteria:**
- [ ] User can login with email/password
- [ ] User can login with Web3 wallet signature
- [ ] JWT token issued on successful login
- [ ] Token refresh mechanism works
- [ ] Failed login attempts logged

**Edge Cases:**
- Invalid credentials
- Inactive account
- Account locked after multiple failures

#### Story 1.3: Get Current User & Permissions
**As a** logged-in user  
**I want to** fetch my profile and permissions  
**So that** I know what I can access

**Acceptance Criteria:**
- [ ] `GET /me` returns user profile
- [ ] `GET /me/permissions` returns all user permissions
- [ ] Response includes roles, trust band, transaction caps
- [ ] Response includes allowed modules/features

---

### Epic 2: Identity Verification

#### Story 2.1: Individual Identity Verification
**As an** individual user  
**I want to** submit identity documents  
**So that** I can be verified and access more features

**Acceptance Criteria:**
- [ ] User can upload identity document (passport, ID card, etc.)
- [ ] Document type and number captured
- [ ] KYC record created with PENDING status
- [ ] Document stored securely
- [ ] Admin can review and approve/reject
- [ ] User notified of verification status

**Edge Cases:**
- Invalid document format
- Document already verified for another account
- Expired documents

#### Story 2.2: Business Registration Verification (BRS)
**As a** business entity  
**I want to** submit business registration documents  
**So that** my business can be verified

**Acceptance Criteria:**
- [ ] Business can submit registration certificate
- [ ] Registration number captured and validated
- [ ] Legal structure identified (LLC, Corporation, etc.)
- [ ] Company name and details stored
- [ ] Business verification status tracked separately from individual KYC

**Edge Cases:**
- Invalid registration number
- Registration expired
- Business name mismatch

---

### Epic 3: Role Assignment & Baseline Setup

#### Story 3.1: Baseline Role Assignment
**As a** new user  
**I want to** be assigned appropriate roles  
**So that** I have the right permissions

**Acceptance Criteria:**
- [ ] User selects primary role during registration (retail_trader, supplier, buyer)
- [ ] System assigns role via RBAC UserRole
- [ ] Role assignment logged
- [ ] User can have multiple roles (e.g., both supplier and buyer)
- [ ] Admin can modify user roles

**Edge Cases:**
- User doesn't select a role
- Invalid role selection
- Role assignment failure

#### Story 3.2: Co-op/SACCO Membership Linkage
**As a** co-op or SACCO member  
**I want to** link my membership  
**So that** I can access member benefits

**Acceptance Criteria:**
- [ ] User can enter co-op/SACCO membership number
- [ ] System validates membership with co-op/SACCO database
- [ ] Membership linkage recorded
- [ ] User gets additional permissions based on membership
- [ ] Co-op/SACCO admin can verify linkage

**Edge Cases:**
- Invalid membership number
- Membership expired
- Already linked to another account

---

### Epic 4: Trust Band & Transaction Caps

#### Story 4.1: Initial Trust Band Assignment (DTE)
**As a** new user  
**I want to** have an initial trust band assigned  
**So that** I can start trading with appropriate limits

**Acceptance Criteria:**
- [ ] TrustScore record created on registration
- [ ] Initial trust band calculated based on:
  - Identity verification status
  - Entity type (individual vs business)
  - KYC completion
- [ ] Trust band stored in TrustScore model
- [ ] Trust band visible to user in dashboard

**Edge Cases:**
- Trust calculation failure
- Missing required data

#### Story 4.2: Transaction Caps Assignment (DAE)
**As a** new user  
**I want to** have transaction caps set  
**So that** my risk is managed

**Acceptance Criteria:**
- [ ] Initial transaction caps calculated by DAE
- [ ] Caps based on:
  - Trust band
  - Entity type
  - Predictive risk assessment
- [ ] Caps stored in user profile or separate model
- [ ] Caps enforced in trading workflows
- [ ] User can see their caps in dashboard

**Edge Cases:**
- DAE service unavailable
- Invalid risk assessment

---

### Epic 5: Personalized Dashboard

#### Story 5.1: Role-Based Dashboard
**As a** logged-in user  
**I want to** see a dashboard with only my allowed features  
**So that** I'm not confused by unavailable options

**Acceptance Criteria:**
- [ ] Dashboard shows modules based on user permissions
- [ ] Retail traders see: Marketplace, My Orders, Escrow
- [ ] Suppliers see: Demand Notices, My Bids, Contracts
- [ ] Buyers see: Create Demand, Review Bids, Awards
- [ ] Dashboard shows trust band summary
- [ ] Dashboard shows transaction caps
- [ ] Dashboard shows pending actions (if any)

**Edge Cases:**
- User has no roles assigned
- Permissions not loaded

#### Story 5.2: Onboarding Progress Indicator
**As a** new user  
**I want to** see my onboarding progress  
**So that** I know what's left to complete

**Acceptance Criteria:**
- [ ] Progress indicator shows:
  - Registration: ✅
  - Identity Verification: ⏳
  - Role Assignment: ✅
  - Trust Band: ✅
- [ ] Clear next steps shown
- [ ] Links to complete pending steps

---

## Technical Requirements

### Database Schema

#### Modified Models

**User Model** (already exists, may need additions):
```prisma
model User {
  // Existing fields...
  onboardingCompleted Boolean @default(false)
  onboardingStep      String? // REGISTRATION, KYC, ROLE_ASSIGNED, COMPLETE
  transactionCap      Float?  // Initial cap from DAE
  trustBand           String?  // Initial trust band from DTE
}
```

**KYCRecord Model** (already exists):
- Already supports individual KYC
- May need business verification fields

**New Model: BusinessVerification**
```prisma
model BusinessVerification {
  id                String   @id @default(uuid())
  userId            String   @unique
  registrationNumber String
  companyName       String
  legalStructure    String   // LLC, CORPORATION, COOPERATIVE, etc.
  registrationDate  DateTime?
  expiryDate        DateTime?
  documentUrl       String?
  status            String   @default("PENDING") // PENDING, APPROVED, REJECTED
  verifiedAt        DateTime?
  verifiedBy        String?
  rejectionReason   String?
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([status])
  @@index([registrationNumber])
}
```

**New Model: MembershipLinkage**
```prisma
model MembershipLinkage {
  id              String   @id @default(uuid())
  userId          String
  organizationType String  // COOP, SACCO
  organizationId  String   // ID of the co-op/SACCO
  membershipNumber String
  status          String   @default("PENDING") // PENDING, VERIFIED, REJECTED
  verifiedAt     DateTime?
  verifiedBy     String?
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([userId, organizationType, organizationId])
  @@index([status])
  @@index([membershipNumber])
}
```

### API Endpoints

#### Authentication Endpoints (Already exist, may need enhancements)

**POST `/api/auth/register`**
- **Description**: Register new user
- **Auth**: None
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string",
    "firstName": "string",
    "lastName": "string",
    "phone": "string?",
    "role": "RETAIL_TRADER" | "SUPPLIER" | "BUYER",
    "entityType": "INDIVIDUAL" | "COMPANY",
    "walletAddress": "string?" // For Web3 registration
  }
  ```
- **Response**: User object + JWT token
- **Enhancement**: Auto-assign role via RBAC

**POST `/api/auth/login`**
- **Description**: Login with credentials
- **Auth**: None
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response**: JWT token + user object

**GET `/api/auth/me`**
- **Description**: Get current user profile
- **Auth**: Required
- **Response**: User object with roles, permissions, trust band, caps

**GET `/api/auth/me/permissions`**
- **Description**: Get user permissions
- **Auth**: Required
- **Response**: Array of permissions

#### New Endpoints

**POST `/api/kyc/submit`** (May already exist)
- **Description**: Submit KYC documents
- **Auth**: Required
- **Request Body**:
  ```json
  {
    "documentType": "PASSPORT" | "ID_CARD" | "DRIVERS_LICENSE",
    "documentNumber": "string",
    "documentUrl": "string"
  }
  ```
- **Response**: KYC record

**POST `/api/business/verify`**
- **Description**: Submit business verification
- **Auth**: Required
- **Request Body**:
  ```json
  {
    "registrationNumber": "string",
    "companyName": "string",
    "legalStructure": "string",
    "documentUrl": "string"
  }
  ```
- **Response**: BusinessVerification record

**POST `/api/membership/link`**
- **Description**: Link co-op/SACCO membership
- **Auth**: Required
- **Request Body**:
  ```json
  {
    "organizationType": "COOP" | "SACCO",
    "organizationId": "string",
    "membershipNumber": "string"
  }
  ```
- **Response**: MembershipLinkage record

**GET `/api/onboarding/status`**
- **Description**: Get onboarding progress
- **Auth**: Required
- **Response**:
  ```json
  {
    "completed": false,
    "currentStep": "KYC",
    "steps": [
      { "name": "Registration", "status": "complete" },
      { "name": "Identity Verification", "status": "pending" },
      { "name": "Role Assignment", "status": "complete" }
    ]
  }
  ```

### Service Layer

#### `onboarding.service.ts`
- `registerUser()` - Create user, assign role, initialize trust
- `completeKYC()` - Submit and process KYC
- `verifyBusiness()` - Submit business verification
- `linkMembership()` - Link co-op/SACCO membership
- `getOnboardingStatus()` - Get progress
- `initializeTrustBand()` - Call DTE to set initial trust
- `setTransactionCaps()` - Call DAE to set caps

#### Integration with DTE
- Call DTE API to initialize trust score
- Pass user data: entityType, KYC status, registration date

#### Integration with DAE
- Call DAE API to calculate initial transaction caps
- Pass user data: trust band, entity type, risk profile

### Integration Points

#### DTE (Dynamic Trust Engine)
- **Trigger**: After user registration
- **Data**: User ID, entity type, KYC status
- **Response**: Initial trust band

#### DAE (Dynamic Analytics Engine)
- **Trigger**: After trust band assigned
- **Data**: User ID, trust band, entity type
- **Response**: Transaction caps

#### RBAC System
- **Trigger**: During registration
- **Action**: Assign UserRole based on selected role
- **Permissions**: Fetch and return in `/me/permissions`

---

## Frontend Requirements

### Pages/Components

#### Page: `/register`
- **Purpose**: User registration
- **Components**:
  - RegistrationForm (email/password or Web3)
  - RoleSelector (retail_trader, supplier, buyer)
  - EntityTypeSelector (individual, business)
- **User Flow**:
  1. Enter email/password or connect wallet
  2. Select role
  3. Select entity type
  4. Submit → Redirect to onboarding

#### Page: `/login`
- **Purpose**: User authentication
- **Components**: LoginForm
- **User Flow**: Standard login → Redirect to dashboard

#### Page: `/onboarding`
- **Purpose**: Complete onboarding steps
- **Components**:
  - OnboardingProgress (progress indicator)
  - KYCUpload (document upload)
  - BusinessVerificationForm
  - MembershipLinkForm
- **User Flow**:
  1. Show progress
  2. Guide through pending steps
  3. Complete each step
  4. Redirect to dashboard when complete

#### Page: `/dashboard`
- **Purpose**: Personalized dashboard
- **Components**:
  - DashboardHeader (user info, trust band, caps)
  - ModuleCards (based on permissions)
  - ActionCenter (pending items)
  - TrustBandSummary
- **User Flow**: Show only allowed modules

---

## Testing Requirements

### Unit Tests
- [ ] `onboarding.service.registerUser()` test
- [ ] `onboarding.service.completeKYC()` test
- [ ] `onboarding.service.initializeTrustBand()` test
- [ ] `onboarding.service.setTransactionCaps()` test
- [ ] Role assignment logic test

### Integration Tests
- [ ] Registration API endpoint test
- [ ] KYC submission test
- [ ] DTE integration test
- [ ] DAE integration test
- [ ] RBAC role assignment test
- [ ] Permission fetching test

### E2E Tests
- [ ] Complete registration flow
- [ ] KYC submission and approval flow
- [ ] Dashboard personalization test
- [ ] Permission-based module visibility

### Performance Tests
- [ ] Registration response time < 500ms
- [ ] Dashboard load time < 1s
- [ ] Permission fetch < 200ms

---

## Implementation Steps

1. **Step 1: Database Schema Updates**
   - Add onboarding fields to User model
   - Create BusinessVerification model
   - Create MembershipLinkage model
   - Run migration
   - **Dependencies**: None
   - **Risk**: Low

2. **Step 2: Onboarding Service**
   - Create `onboarding.service.ts`
   - Implement user registration with role assignment
   - Implement KYC submission
   - Implement business verification
   - Implement membership linkage
   - **Dependencies**: Step 1, RBAC service
   - **Risk**: Medium

3. **Step 3: DTE Integration**
   - Create DTE client/service
   - Implement trust band initialization
   - Test integration
   - **Dependencies**: Step 1, DTE API available
   - **Risk**: Medium

4. **Step 4: DAE Integration**
   - Create DAE client/service
   - Implement transaction cap calculation
   - Test integration
   - **Dependencies**: Step 3, DAE API available
   - **Risk**: Medium

5. **Step 5: API Endpoints**
   - Enhance `/api/auth/register`
   - Create `/api/business/verify`
   - Create `/api/membership/link`
   - Create `/api/onboarding/status`
   - Enhance `/api/auth/me` to include permissions
   - **Dependencies**: Step 2, Step 3, Step 4
   - **Risk**: Low

6. **Step 6: Frontend Registration**
   - Create registration page
   - Implement role selection
   - Implement entity type selection
   - Connect to API
   - **Dependencies**: Step 5
   - **Risk**: Low

7. **Step 7: Frontend Onboarding Flow**
   - Create onboarding page
   - Implement progress indicator
   - Implement KYC upload
   - Implement business verification form
   - Implement membership link form
   - **Dependencies**: Step 5
   - **Risk**: Low

8. **Step 8: Personalized Dashboard**
   - Update dashboard to fetch permissions
   - Filter modules based on permissions
   - Display trust band and caps
   - Show onboarding progress if incomplete
   - **Dependencies**: Step 5
   - **Risk**: Low

---

## Definition of Done

- [ ] All user stories implemented
- [ ] Database schema updated and migrated
- [ ] All API endpoints implemented and tested
- [ ] DTE integration working
- [ ] DAE integration working
- [ ] RBAC role assignment working
- [ ] Frontend registration flow complete
- [ ] Frontend onboarding flow complete
- [ ] Dashboard personalization working
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] E2E tests passing
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] Deployed to staging
- [ ] QA approved

---

## Dependencies

**Blocks**: 
- Feature 1.1 (Retail Trader) - Needs onboarding
- Feature 1.2 (Supplier) - Needs onboarding
- Feature 1.3 (Buyer) - Needs onboarding
- All other features

**Blocked By**: 
- RBAC System ✅ (Already completed)

---

## Notes

- KYC approval can be manual (admin) for MVP, automated later
- Business verification requires admin approval
- Membership linkage requires co-op/SACCO admin verification
- Trust band initialization should be async (queue job)
- Transaction caps can be updated as trust improves

