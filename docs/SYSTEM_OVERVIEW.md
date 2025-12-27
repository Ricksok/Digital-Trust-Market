# System Overview - Web3-Powered Digital Trust Marketplace

## Executive Summary

The **Web3-Powered Digital Trust Marketplace** (also known as **OptiChain** and aligned with **BarterTrade Africa**) is a comprehensive multi-market exchange platform that connects investors, fundraisers, traders, and businesses through a sophisticated trust-based ecosystem. The platform integrates blockchain technology, smart contracts, tokenomics, and advanced analytics to create a secure, transparent, and compliant marketplace for capital raising, trading, and business transactions.

---

## Core Purpose

The platform serves as a **multi-market exchange** that enables:

1. **Capital Markets**: Connecting investors with fundraisers (SMEs, startups, social enterprises, real estate projects)
2. **Trade Exchange**: Facilitating B2B and C2B transactions with trust-weighted matching
3. **Guarantee Marketplace**: Providing performance guarantees and risk mitigation
4. **Governance & Compliance**: Ensuring regulatory compliance and transparent governance

---

## User Types & Roles

### 1. Investors (14 accounts)
- **Individual Investors**: Personal investment accounts
- **Institutional Investors**: Corporate investment entities
- **Impact Funds**: Social impact-focused investment funds

**Capabilities:**
- Browse and invest in projects
- Participate in reverse auctions
- View portfolio analytics
- Participate in governance voting
- Receive impact reports

### 2. Fundraisers (14 accounts)
- **SMEs & Startups**: Technology and innovation companies
- **Social Enterprises**: Impact-focused organizations
- **Real Estate Projects**: Property development ventures

**Capabilities:**
- Create and manage fundraising projects
- Request guarantees
- Create reverse auctions for capital/guarantees
- Access learning resources
- Track project performance

### 3. End Users (40 accounts)

#### C2B (Consumer-to-Business) - 10 accounts
- **Individual Consumers**: Personal buyers
- **Corporate Consumers**: Business procurement teams

#### B2B (Business-to-Business) - 10 accounts
- **Individual Traders**: Independent business operators
- **Corporate Businesses**: Large-scale enterprises

#### Trade Exchange Engine (TEE) - 20 accounts
- **Buyers**: 10 accounts (5 individual, 5 corporate)
- **Sellers**: 10 accounts (5 individual, 5 corporate)

### 4. Administrators
- **System Admins**: Full platform management
- **Regulators**: Read-only access to compliance data

---

## Core Engines & Services

### ✅ Implemented Engines

#### 1. Digital Trust Engine (DTE)
**Location:** `backend/src/services/trust.service.ts`

**Purpose:** Calculates and maintains trust scores for all entities on the platform.

**Trust Dimensions:**
- **Identity Trust (30%)**: KYC/KYB verification level
- **Transaction Trust (20%)**: Transaction success rate
- **Financial Trust (20%)**: Payment reliability and financial health
- **Performance Trust (20%)**: Delivery/performance consistency
- **Learning Trust (10%)**: Course completion and certifications

**Trust Scores:**
- **Overall Trust Score (T)**: 0-100 weighted composite
- **Readiness Score (R)**: Issuer preparedness
- **Behavior Score (B)**: Pattern consistency
- **Counterparty Score (C)**: Buyer/supplier reliability
- **Guarantee Capacity Score (G)**: Guarantor quality

**Features:**
- Automatic recalculation on activity
- Trust decay for inactivity
- Trust event logging (immutable audit trail)
- Behavior metrics tracking
- Readiness metrics for fundraisers

#### 2. Reverse Auction Engine (RAE)
**Location:** `backend/src/services/auction.service.ts`

**Purpose:** Enables demand-led procurement through reverse auctions.

**Auction Types:**
- **CAPITAL**: Fundraising auctions
- **GUARANTEE**: Guarantee provider auctions
- **SUPPLY_CONTRACT**: Supply chain procurement
- **TRADE_SERVICE**: Service procurement

**Features:**
- Trust-weighted bidding (bids adjusted by trust score)
- Multiple clearing methods (FIRST_PRICE, SECOND_PRICE, MULTI_WINNER)
- Proxy bidding support
- Reserve price and target amount controls
- Automatic auction closing and winner determination

#### 3. Guarantee Engine (GE)
**Location:** `backend/src/services/guarantee.service.ts`

**Purpose:** Provides performance assurance and risk mitigation through guarantees.

**Features:**
- Guarantee marketplace
- Multi-layer guarantee structures
- Guarantee allocation and tracking
- Guarantee capacity management
- Default tracking and recovery

#### 4. Data Analytics Engine (DAE)
**Location:** `backend/src/services/analytics.service.ts`

**Purpose:** Provides real-time analytics, insights, and reporting.

**Features:**
- Time-series data collection
- Dashboard analytics
- Risk scoring
- Trend analysis
- Anomaly detection
- Performance metrics

#### 5. Tax & Accounting Engine (TAE)
**Location:** `backend/src/services/payment.service.ts` (partial)

**Purpose:** Handles payment processing, tax calculation, and accounting.

**Features:**
- Payment gateway integration
- Tax calculation (VAT, WHT, CGT, excise)
- Transaction reconciliation
- Financial reporting

#### 6. Central Depository & Settlement Engine (CDSE)
**Location:** `backend/src/services/escrow.service.ts` (partial)

**Purpose:** Manages escrow services and settlement through smart contracts.

**Features:**
- Smart contract escrow
- Multi-party escrow
- Automated release/refund
- Dispute resolution
- Blockchain transaction recording

### ⚠️ Partially Implemented

#### 7. Securities Exchange Engine (SEE)
**Location:** `backend/src/services/investment.service.ts`

**Current Status:**
- ✅ Primary market (private placements)
- ❌ Secondary trading (to be implemented)

**Features:**
- Project creation and approval
- Investment management
- Payment processing
- Escrow integration

### ❌ To Be Implemented

#### 8. Trade Exchange Engine (TEE)
**Required Features:**
- Commodities & services trading
- Trade matching algorithms
- Order book management
- Trade settlement

#### 9. Learning Engine (LEE)
**Required Features:**
- Course management
- Certification system
- Learning progress tracking
- Quiz and assessment system

#### 10. Regulatory Reporting Engine (RRE)
**Purpose:** Transform platform activity into standardized regulatory submissions.

**Report Types:**
- Capital Markets Authority (CMA) reports
- SASRA (SACCO) reports
- KRA (Tax) reports
- AML/CFT reports

#### 11. Investor Reporting Engine (IRE)
**Purpose:** Generate portfolio-grade financial and impact intelligence.

**Report Types:**
- Portfolio reports (NAV, cashflow, yield)
- Impact reports (SDG/ESG aligned)
- Quarterly/annual reports
- Deal-level reports

---

## Tokenomics & DeFi Ecosystem

### Token Types

#### 1. BTA-GOV (Governance Token)
- **Supply:** 1 billion (fixed)
- **Purpose:** Governance voting and DAO participation
- **Use Cases:**
  - Creating governance proposals
  - Voting on proposals (trust-weighted)
  - DAO participation

#### 2. BTA-REWARD (Rewards Token)
- **Supply:** Unlimited (minted as needed)
- **Inflation:** 5% annual
- **Purpose:** Incentivizing platform participation
- **Use Cases:**
  - Transaction rewards
  - Learning/course completion rewards
  - Governance participation rewards
  - Referral rewards

#### 3. BTA-UTIL (Utility & Staking Token)
- **Supply:** 500 million initial, 2 billion max
- **Purpose:** Platform access and staking
- **Use Cases:**
  - Staking in pools
  - Platform access fees
  - Utility functions

#### 4. BTA-GUAR (Guarantee Token)
- **Supply:** Unlimited (minted per guarantee)
- **Purpose:** Guarantee marketplace collateral
- **Use Cases:**
  - Collateralized guarantees
  - Guarantee allocation tokens
  - Risk coverage tokens

### Token Features

- **Token Balances**: Available and locked balances
- **Token Transactions**: All transfers, mints, burns recorded
- **Staking Pools**: Multiple pools with different APY and lock periods
- **Reward Distribution**: Automated reward distribution
- **Governance**: Trust-weighted voting system

---

## Key Features & Capabilities

### 1. Authentication & Security
- **JWT-based authentication**
- **Web3 wallet integration** (MetaMask, WalletConnect)
- **Role-based access control (RBAC)**
- **KYC/AML verification**
- **Audit logging** (immutable trail)

### 2. Project Management
- **Project creation** with rich media support
- **Project approval workflow** (admin approval)
- **Due diligence** (automated and manual)
- **Project analytics** and performance tracking
- **Document management**

### 3. Investment Management
- **Investment creation** and tracking
- **Payment processing** (multiple gateways)
- **Smart contract escrow** for fund security
- **Investment portfolio** management
- **Returns tracking**

### 4. Reverse Auctions
- **Multiple auction types** (capital, guarantee, supply, trade)
- **Trust-weighted bidding**
- **Proxy bidding**
- **Automatic clearing**
- **Auction analytics**

### 5. Guarantee Marketplace
- **Guarantee requests** and offers
- **Guarantee allocation**
- **Capacity management**
- **Performance tracking**
- **Default management**

### 6. Governance
- **Proposal creation** (requires BTA-GOV tokens)
- **Trust-weighted voting**
- **Proposal execution**
- **Voting history**
- **DAO participation**

### 7. Staking & Rewards
- **Multiple staking pools**
- **Flexible lock periods**
- **Reward calculation and distribution**
- **Staking analytics**
- **Reward claiming**

### 8. Analytics & Reporting
- **Real-time dashboards**
- **Time-series analytics**
- **Risk scoring**
- **Performance metrics**
- **Custom reports**

### 9. Compliance & Regulatory
- **KYC/AML verification**
- **CMA compliance** (Capital Markets Authority)
- **Audit trails**
- **Regulatory reporting** (to be implemented)
- **Tax calculation and reporting**

### 10. Learning & Readiness
- **Course management** (to be implemented)
- **Certification system** (to be implemented)
- **Readiness scoring**
- **Documentation tracking**

---

## Technology Stack

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Language:** TypeScript
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Authentication:** JWT + Web3 wallet signatures
- **Blockchain:** Ethereum-compatible (Hardhat)

### Frontend
- **Framework:** Next.js 14 (App Router)
- **UI Library:** React 18
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Web3:** ethers.js
- **State Management:** React Context + Hooks

### Smart Contracts
- **Language:** Solidity
- **Framework:** Hardhat
- **Libraries:** OpenZeppelin Contracts
- **Contracts:** Escrow, Token contracts (to be deployed)

### Infrastructure
- **Containerization:** Docker, Docker Compose
- **Database:** PostgreSQL (containerized)
- **IaC Ready:** Terraform structure prepared
- **Deployment:** Multi-environment support

---

## Data Flow & Processes

### Investment Flow
1. **User Registration/Login** → KYC Verification
2. **Project Creation** → Due Diligence → Admin Approval
3. **Investment Creation** → Payment Processing → Escrow Creation
4. **Fund Release** → Conditions Met → Escrow Release → Funds Transferred

### Auction Flow
1. **Auction Creation** → Trust Requirements Set
2. **Auction Start** → Bidding Period Opens
3. **Bid Placement** → Trust Validation → Effective Bid Calculation
4. **Auction Closing** → Winner Determination → Settlement

### Guarantee Flow
1. **Guarantee Request** → Guarantee Marketplace
2. **Guarantee Offers** → Trust-Weighted Selection
3. **Guarantee Allocation** → BTA-GUAR Token Minting
4. **Performance Tracking** → Default Management

### Trust Score Calculation
1. **Activity Occurs** → Trigger Trust Recalculation
2. **Dimension Calculation** → Identity, Transaction, Financial, Performance, Learning
3. **Weighted Aggregation** → Overall Trust Score
4. **Event Logging** → Immutable Trust Event Record

---

## Database Schema Highlights

### Core Models
- **User**: All user accounts with entity types
- **Project**: Fundraising projects
- **Investment**: Investment records
- **Payment**: Payment transactions
- **EscrowContract**: Escrow contract records
- **Auction**: Reverse auction records
- **Bid**: Auction bid records
- **Guarantee**: Guarantee records
- **TrustScore**: Trust score records
- **TrustEvent**: Immutable trust event log
- **Token**: Token definitions
- **TokenBalance**: Entity token balances
- **TokenTransaction**: Token transfers
- **GovernanceProposal**: DAO proposals
- **GovernanceVote**: Proposal votes
- **StakingPool**: Staking pool configurations
- **Stake**: Individual staking positions
- **RewardDistribution**: Reward records
- **KYCRecord**: KYC verification records
- **DueDiligence**: Due diligence reports
- **ComplianceRecord**: Compliance records
- **AuditLog**: Audit trail

---

## API Structure

### Authentication (`/api/auth`)
- Register, Login, Web3 Connect, Get Current User

### Users (`/api/users`)
- User management, Profile updates

### Projects (`/api/projects`)
- Create, List, Get, Update, Approve projects

### Investments (`/api/investments`)
- Create, List, Get investments

### Payments (`/api/payments`)
- Initiate payments, Payment status

### Escrow (`/api/escrow`)
- Create escrow, Release funds, Refund

### Auctions (`/api/auctions`)
- Create, List, Get auctions, Place bids, Close auctions

### Guarantees (`/api/guarantees`)
- Create, List, Get guarantees, Allocate guarantees

### Trust (`/api/trust`)
- Get trust scores, Trust history, Recalculate

### Tokens (`/api/tokens`)
- Token info, Balances, Transfer, Transactions

### Governance (`/api/governance`)
- Create proposals, Vote, List proposals, Execute

### Staking (`/api/staking`)
- Create pools, Stake, Unstake, Get stakes

### Rewards (`/api/rewards`)
- Get rewards, Claim rewards, Reward totals

### Analytics (`/api/analytics`)
- Dashboard data, Time-series data, Metrics

### KYC (`/api/kyc`)
- Submit KYC, Get status, Update KYC

### Compliance (`/api/compliance`)
- Submit compliance, Get status

---

## Security Features

1. **Authentication:**
   - JWT tokens with expiration
   - Web3 wallet signature verification
   - Password hashing (bcrypt)

2. **Authorization:**
   - Role-based access control
   - Entity-based permissions
   - Context-based roles

3. **Data Protection:**
   - Input validation
   - SQL injection prevention (Prisma)
   - XSS protection (Helmet)
   - CORS configuration

4. **Audit & Compliance:**
   - Immutable audit logs
   - Trust event logging
   - Transaction history
   - Compliance tracking

5. **Blockchain Security:**
   - Smart contract escrow
   - Transaction verification
   - Wallet address validation

---

## Deployment & Infrastructure

### Local Development
- Docker Compose for local orchestration
- Hot reload for development
- PostgreSQL container
- Environment variable management

### Production Ready
- Multi-stage Docker builds
- Health checks
- Database migrations
- Logging and monitoring

### Cloud Deployment (Prepared)
- Terraform structure for IaC
- Multi-environment support (dev, staging, production)
- Scalable architecture
- Load balancer ready

---

## Current Status

### ✅ Completed
- Core authentication and user management
- Project and investment management
- Reverse Auction Engine
- Guarantee Engine
- Digital Trust Engine
- Tokenomics system (tokens, governance, staking, rewards)
- Analytics Engine
- Payment processing
- Escrow services (partial)
- KYC/AML system
- Compliance framework

### ⚠️ Partial Implementation
- Securities Exchange Engine (primary market only)
- Tax & Accounting Engine (basic payment processing)
- Central Depository & Settlement (escrow only)

### ❌ To Be Implemented
- Trade Exchange Engine (TEE)
- Learning Engine (LEE)
- Regulatory Reporting Engine (RRE)
- Investor Reporting Engine (IRE)
- Secondary trading (Securities Exchange)
- Full settlement system

---

## Demo Data

The system includes comprehensive seed data:
- **69 total users** (1 admin, 14 investors, 14 fundraisers, 40 end users)
- **Multiple projects** across different categories
- **Investments** with various statuses
- **Auctions** and bids
- **Guarantees** and allocations
- **Trust scores** calculated for all users
- **Token balances** and transactions
- **Governance proposals** and votes

**Quick Login Credentials:**
- Admin: `admin@marketplace.com` / `admin123`
- Investor: `investor1@example.com` / `investor123`
- Fundraiser: `fundraiser1@example.com` / `fundraiser123`

---

## Future Enhancements

1. **Real-time Features:**
   - WebSocket notifications
   - Live auction updates
   - Real-time trust score updates

2. **Advanced Analytics:**
   - Machine learning predictions
   - Risk modeling
   - Fraud detection

3. **Multi-chain Support:**
   - Support for multiple blockchains
   - Cross-chain bridges

4. **Mobile Applications:**
   - iOS and Android apps
   - Mobile wallet integration

5. **Enhanced Dispute Resolution:**
   - Automated dispute handling
   - Mediation services

6. **Advanced Reporting:**
   - Automated compliance reporting
   - Impact measurement frameworks
   - ESG reporting

---

## Strategic Value

The platform provides:

1. **For Investors:**
   - Access to vetted investment opportunities
   - Trust-based risk assessment
   - Impact measurement and reporting
   - Portfolio diversification

2. **For Fundraisers:**
   - Access to capital markets
   - Guarantee support
   - Learning resources
   - Performance tracking

3. **For Traders:**
   - Trust-weighted matching
   - Guarantee-backed transactions
   - Reverse auction procurement
   - Trade analytics

4. **For Regulators:**
   - Transparent compliance reporting
   - Audit trails
   - Market surveillance
   - Risk monitoring

5. **For the Ecosystem:**
   - Reduced transaction costs
   - Increased trust and transparency
   - Financial inclusion
   - Economic development

---

## Documentation

- **Architecture:** `docs/ARCHITECTURE.md`
- **API Documentation:** `docs/API.md`
- **BarterTrade Alignment:** `docs/BARTERTRADE_ARCHITECTURE.md`
- **Tokenomics:** `docs/TOKENOMICS_IMPLEMENTATION.md`
- **Login Credentials:** `docs/LOGIN_CREDENTIALS.md`
- **Setup Guide:** `docs/SETUP.md`
- **Project Structure:** `PROJECT_STRUCTURE.md`

---

## Conclusion

The Web3-Powered Digital Trust Marketplace is a comprehensive, enterprise-grade platform that combines traditional financial services with blockchain technology, advanced trust scoring, and tokenomics to create a secure, transparent, and efficient multi-market exchange. The system is designed to facilitate capital raising, trading, and business transactions while ensuring regulatory compliance and providing rich analytics and reporting capabilities.


