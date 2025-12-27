# Seed Data Enhancement Summary

## Overview
Enhanced the seed data script to include comprehensive test data for:
1. **Marketplace Products** - Diverse products with images, categories, and trust indicators
2. **Learning Exchange Engine (LEE)** - Courses, enrollments, credentials, quizzes, and learning outcomes

## Marketplace Enhancements

### Product Categories
- Agriculture & Food
- Technology
- Renewable Energy
- Real Estate
- Education
- Healthcare
- Manufacturing
- Services
- Retail
- Transportation

### Marketplace Products Created
- 8 new marketplace products with:
  - Realistic product descriptions
  - Multiple product images (Unsplash placeholders)
  - Varied funding targets (KES 300K - 1.5M)
  - Different funding progress (20-70%)
  - Trust band indicators
  - Delivery information in metadata

### Product Examples
1. **Organic Maize - Grade A (10 Tonnes)** - Agriculture & Food
2. **Fresh Coffee Beans - Arabica (5 Tonnes)** - Agriculture & Food
3. **Solar Panel Installation Service** - Services
4. **Handmade Leather Products Collection** - Retail
5. **Mobile App Development Service** - Technology
6. **Fresh Vegetables - Mixed Box (Weekly Subscription)** - Agriculture & Food
7. **E-commerce Website Development** - Technology
8. **Custom Furniture - Office Set** - Manufacturing

### Updated Existing Projects
- Enhanced all existing projects with:
  - Better category assignments
  - Multiple product images
  - Realistic funding progress (30-70% for active projects)

## Learning Exchange Engine (LEE) Data

### Courses Created (8 courses)
1. **Vendor Onboarding Essentials** (BEGINNER, 45 min)
   - Required course
   - Unlocks: `tee.listings.view`, `tee.trade.create`
   - Certificate (expires in 365 days)

2. **Auction Bidding Best Practices** (INTERMEDIATE, 60 min)
   - Unlocks: `auction.bid.create`, `rae.bid.create`
   - Badge (no expiry)

3. **Quality Control & Logistics Management** (INTERMEDIATE, 90 min)
   - Partner-published
   - Unlocks: `tee.trade.view.own`, `quality.manage`
   - Certificate (expires in 730 days)

4. **Tax & Invoicing Compliance** (ADVANCED, 75 min)
   - Regulator-published
   - Unlocks: `tax.compliance`, `invoicing.create`
   - Certification (expires in 365 days)

5. **Dispute Prevention & Resolution** (INTERMEDIATE, 50 min)
   - Unlocks: `dispute.manage`, `dispute.resolve`
   - Badge (no expiry)

6. **Platform Compliance & Regulations** (ADVANCED, 80 min)
   - Regulator-published
   - Unlocks: `compliance.view`, `compliance.manage`
   - Certification (expires in 180 days)

7. **Advanced Auction Strategies** (ADVANCED, 120 min)
   - Partner-published
   - Unlocks: `auction.bid.advanced`, `guarantee.manage`
   - Certification (expires in 365 days)

8. **Supply Chain Management** (ADVANCED, 100 min)
   - Partner-published
   - Unlocks: `supply.chain.manage`, `logistics.optimize`
   - Certificate (expires in 730 days)

### Course Features
- All courses include:
  - Content URLs
  - Video URLs
  - Learning materials (PDFs)
  - Prerequisites (where applicable)
  - Feature unlocks
  - Published status
  - Quizzes with 3 questions each

### Enrollments Created
- **13+ users enrolled** across various courses:
  - Fundraisers (5 users)
  - Suppliers/Vendors (5 users)
  - Investors (3 users)

### Enrollment Status Distribution
- **Completed**: ~33% (with credentials and learning outcomes)
- **In Progress**: ~33% (75% progress)
- **Enrolled**: ~33% (30% progress)

### Credentials Issued
- Certificates, Badges, and Certifications issued for completed courses
- Unique credential numbers for verification
- Expiry dates based on course settings

### Learning Outcomes
- Feature unlocks created for completed courses
- Active learning outcomes linked to users
- Enables learning-gated features (e.g., auction bidding)

### Quiz Attempts
- Quiz attempts created for completed enrollments
- Scores: 85-95% (above 70% passing threshold)
- Answers recorded in JSON format

## Trust Band Updates

### Trust Band Assignment Logic
- **T0**: Unverified users
- **T1**: Verified users (no courses)
- **T2**: Verified + 1 completed course
- **T3**: Verified + 2 completed courses
- **T4**: Verified + 3+ completed courses

### Activity Tracking
- `lastActivityAt` set for all users (within last 7 days)
- Transaction caps set based on verification and learning:
  - Unverified: KES 10,000
  - Verified: KES 100,000 + (completed courses × 50,000)

## Data Summary

### Marketplace
- **Total Projects**: 17 (6 initial + 3 additional + 8 marketplace)
- **Marketplace Products**: 8 new products
- **Categories**: 10 diverse categories
- **Images**: Multiple images per product

### Learning Exchange Engine
- **Courses**: 8 courses (all published)
- **Quizzes**: 8 quizzes (one per course)
- **Enrollments**: 13+ enrollments
- **Credentials**: ~4-5 credentials issued
- **Learning Outcomes**: ~8-10 feature unlocks
- **Quiz Attempts**: ~4-5 attempts

## Testing Scenarios Enabled

### Marketplace Testing
1. Browse products by category
2. Search products
3. View product details with images
4. See trust band indicators
5. View funding progress
6. Filter by trust band
7. Sort by price/funding

### Learning Workflow Testing
1. Browse course catalog
2. Enroll in courses
3. Track learning progress
4. Complete quizzes
5. Earn credentials
6. Unlock features through learning
7. Test learning gates (e.g., auction bidding)
8. View learning history
9. Admin course management

## Demo Credentials

### Users with Learning Progress
- **Fundraisers**: `fundraiser1@example.com` - `fundraiser123`
  - Multiple completed courses
  - Trust Band: T3-T4
  - Credentials earned

- **Suppliers**: `faith.maina@trade.com` - `seller123`
  - Vendor onboarding completed
  - Trust Band: T2-T3
  - Can list products

- **Investors**: `investor1@example.com` - `investor123`
  - Some learning progress
  - Trust Band: T1-T2

## Next Steps

1. **Run Seed Script**:
   ```bash
   docker-compose exec backend npm run db:seed
   ```

2. **Test Marketplace**:
   - Navigate to `/marketplace`
   - Browse products
   - Test search and filters
   - View product details

3. **Test Learning Exchange**:
   - Navigate to `/learning`
   - Browse courses
   - Enroll in a course
   - Complete quiz
   - Verify credential issuance
   - Test learning gates (try bidding without required course)

4. **Test Trust Bands**:
   - Check user trust bands on dashboard
   - Verify trust band affects transaction caps
   - Test trust decay/recovery

## Notes

- All images use Unsplash placeholders (replace with actual images in production)
- Course content URLs are placeholders (replace with actual content)
- Credential verification URLs are placeholders
- Trust bands are automatically assigned based on learning progress
- Learning outcomes unlock features that can be gated by middleware

