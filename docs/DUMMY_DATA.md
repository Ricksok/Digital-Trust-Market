# Dummy Data Guide

This document describes the dummy data available in the system for demo purposes.

## Seeding the Database

To populate the database with dummy data, run:

```bash
cd backend
npm run db:seed
```

Or to reset and reseed:

```bash
npm run db:reset
```

## Demo Data Included

### Users

#### Admin
- **Email**: `admin@marketplace.com`
- **Password**: `admin123`
- **Role**: ADMIN
- **Status**: Verified

#### Investors (5 users)
- **Emails**: `investor1@example.com` through `investor5@example.com`
- **Password**: `investor123` (for all)
- **Roles**: Mix of Individual Investors, Institutional Investors, and Impact Funds
- **First 3 are verified** with KYC records

#### Fundraisers (5 users)
- **Emails**: `fundraiser1@example.com` through `fundraiser5@example.com`
- **Password**: `fundraiser123` (for all)
- **Roles**: Mix of SMEs & Startups, Social Enterprises, and Real Estate Projects
- **First 3 are verified** with KYC records

### Projects (6 projects)

1. **Solar Power Plant - Nakuru**
   - Category: Renewable Energy
   - Target: KES 50,000,000
   - Status: ACTIVE
   - Due Diligence Score: 85.5

2. **Affordable Housing Complex - Nairobi**
   - Category: Real Estate
   - Target: KES 80,000,000
   - Status: ACTIVE
   - Due Diligence Score: 92.0

3. **AgriTech Mobile Platform**
   - Category: Technology
   - Target: KES 15,000,000
   - Status: APPROVED
   - Due Diligence Score: 78.5

4. **Clean Water Initiative - Kajiado**
   - Category: Social Enterprise
   - Target: KES 25,000,000
   - Status: ACTIVE
   - Due Diligence Score: 88.0

5. **E-Learning Platform for Rural Schools**
   - Category: Education
   - Target: KES 12,000,000
   - Status: PENDING_APPROVAL

6. **Waste-to-Energy Facility - Mombasa**
   - Category: Renewable Energy
   - Target: KES 60,000,000
   - Status: ACTIVE
   - Due Diligence Score: 90.5

### Investments

- Multiple investments across active/approved projects
- Various statuses: PENDING, APPROVED, ESCROWED, RELEASED
- Different investment amounts
- Associated payments and escrow contracts

### Additional Data

- **KYC Records**: For verified users
- **Due Diligence Records**: For approved/active projects
- **Payments**: For completed investments
- **Escrow Contracts**: For escrowed investments
- **Compliance Records**: For some projects
- **Audit Logs**: 20 sample audit entries

## Generating Additional Demo Data

### Via API (Development Only)

In development mode, you can generate additional demo data via API:

```bash
# Generate 5 more projects (requires admin auth)
POST /api/demo/generate-projects
Body: { "count": 5 }

# Generate 10 more investments (requires admin auth)
POST /api/demo/generate-investments
Body: { "count": 10 }

# Reset demo data (keeps users, removes projects/investments)
POST /api/demo/reset-data
```

### Authentication Required

All demo endpoints require:
- Valid JWT token
- Admin role

Example:
```bash
curl -X POST http://localhost:3001/api/demo/generate-projects \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"count": 5}'
```

## Data Statistics

After seeding, you should have:

- **11 Users**: 1 admin + 5 investors + 5 fundraisers
- **6 Projects**: Various categories and statuses
- **~15 Investments**: Across different projects
- **~10 Payments**: For completed investments
- **~5 Escrow Contracts**: For escrowed investments
- **6 KYC Records**: For verified users
- **4 Due Diligence Records**: For approved/active projects
- **3 Compliance Records**: For some projects
- **20 Audit Logs**: Sample audit trail entries

## Resetting Data

To completely reset and reseed:

```bash
cd backend
npm run db:reset
```

This will:
1. Delete all existing data
2. Reseed with fresh dummy data

## Notes

- All dummy data uses placeholder URLs for images and documents
- Wallet addresses are dummy Ethereum addresses
- Transaction hashes are randomly generated
- All amounts are in Kenyan Shillings (KES)
- Dates are set relative to current time

## Demo Credentials Summary

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@marketplace.com | admin123 |
| Investor | investor1@example.com | investor123 |
| Fundraiser | fundraiser1@example.com | fundraiser123 |


