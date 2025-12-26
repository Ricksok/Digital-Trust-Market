# Quick Demo Guide

## 🚀 Quick Start with Dummy Data

### 1. Seed the Database

```bash
cd backend
npm run db:seed
```

This creates:
- ✅ 11 users (1 admin, 5 investors, 5 fundraisers)
- ✅ 6 projects with various statuses
- ✅ ~15 investments
- ✅ Payments, escrow contracts, KYC records, and more

### 2. Login Credentials

**Admin:**
- Email: `admin@marketplace.com`
- Password: `admin123`

**Investor:**
- Email: `investor1@example.com`
- Password: `investor123`

**Fundraiser:**
- Email: `fundraiser1@example.com`
- Password: `fundraiser123`

### 3. View the Data

**Via API:**
```bash
# Get all projects
GET http://localhost:3001/api/projects

# Get all investments
GET http://localhost:3001/api/investments

# Get analytics dashboard
GET http://localhost:3001/api/analytics/dashboard
```

**Via Prisma Studio:**
```bash
cd backend
npm run db:studio
```
Opens a GUI at http://localhost:5555

### 4. Generate More Data (Admin Only)

```bash
# Login as admin first to get token
POST http://localhost:3001/api/auth/login
Body: { "email": "admin@marketplace.com", "password": "admin123" }

# Generate 5 more projects
POST http://localhost:3001/api/demo/generate-projects
Headers: { "Authorization": "Bearer YOUR_TOKEN" }
Body: { "count": 5 }

# Generate 10 more investments
POST http://localhost:3001/api/demo/generate-investments
Headers: { "Authorization": "Bearer YOUR_TOKEN" }
Body: { "count": 10 }
```

### 5. Reset Data

```bash
cd backend
npm run db:reset
```

This deletes all data and reseeds with fresh dummy data.

## 📊 What You'll See

### Projects
- 6 diverse projects across different categories
- Mix of statuses: DRAFT, PENDING_APPROVAL, APPROVED, ACTIVE
- Realistic funding targets and investment limits
- Due diligence scores for approved projects

### Investments
- Multiple investments per project
- Various statuses: PENDING, APPROVED, ESCROWED, RELEASED
- Associated payments and escrow contracts
- Realistic investment amounts

### Users
- Mix of investor types (Individual, Institutional, Impact Funds)
- Mix of fundraiser types (SMEs, Social Enterprises, Real Estate)
- Some users verified with KYC, others pending

## 🎯 Demo Scenarios

### Scenario 1: Investor Browsing Projects
1. Login as `investor1@example.com`
2. Browse projects at `/projects`
3. View project details
4. Make an investment

### Scenario 2: Fundraiser Managing Projects
1. Login as `fundraiser1@example.com`
2. View your projects
3. Check investment status
4. View analytics

### Scenario 3: Admin Oversight
1. Login as `admin@marketplace.com`
2. View all users, projects, investments
3. Approve/reject projects
4. View compliance reports
5. Generate more demo data

## 📝 Notes

- All data is for demo purposes only
- Images and documents use placeholder URLs
- Wallet addresses are dummy addresses
- Transaction hashes are randomly generated
- Amounts are in Kenyan Shillings (KES)

## 🔄 Regenerating Data

If you need fresh data:
```bash
cd backend
npm run db:reset
```

This will give you a clean slate with new dummy data.


