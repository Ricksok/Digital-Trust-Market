# BarterTrade Africa — User Workflows by Role

## 0) Shared Workflow: Onboarding & Identity (All Roles)

**Goal**: Get verified, assigned roles, and safe access limits.

### Steps

1. Sign up / Sign in
2. Identity verification (individual) + BRS verification (business)
3. Assign baseline role(s): `retail_trader` / `supplier` / `buyer`
4. If joining via Co-op/SACCO: membership verification and linkage
5. Initial trust band assigned (DTE) + transaction caps set
6. Permissions fetched (`GET /me/permissions`)
7. User sees personalized dashboard + allowed modules only

### Permissions

- `auth.login`, `auth.refresh`
- `profile.view.own`, `profile.update.own`
- `permissions.view.own`

### Visibility

- Own profile, own trust band summary, allowed features, own caps

### Gates

- Trust-by-design (DTE)
- Predictive risk sets initial limits (DAE)
- Audit: onboarding decisions logged (TAE/RRE if applicable)

---

## 1) Retail Trader Workflow (TEE: Buy/Sell Goods)

**Goal**: Trade commodities/services safely with escrow.

### Happy Path

1. Browse marketplace listings or search
2. Place order / accept offer
3. Escrow reserved (GE)
4. Delivery confirmed (proof + acceptance)
5. Settlement executed (CDSE)
6. Trust score updated (DTE)
7. Tax/accounting entries created (TAE)

### Permissions

- `tee.listings.view`
- `tee.trade.create`
- `ge.escrow.view.own`
- `tee.trade.view.own`

### Visibility

- Listings (public), own orders, escrow status, dispute button, own receipts

### Gates

- New traders limited by caps (DAE + DTE)
- Higher value trades require stronger guarantees (GE)

---

## 2) Supplier Workflow (RAE: Bid and Execute Contract)

**Goal**: Compete in reverse auctions and win jobs.

### Happy Path

1. Supplier views open RAE demand notices
2. Check eligibility requirements: credentials (LEE), trust band (DTE), guarantee band (GE)
3. Submit bid (price + delivery plan + guarantee option)
4. Buyer awards contract
5. GE locks guarantee commitment + escrow schedule
6. Supplier delivers milestones
7. CDSE triggers settlement releases per milestone
8. Performance analytics updated (DAE)

### Permissions

- `rae.notice.view`
- `rae.bid.create`
- `rae.bid.view.own`
- `tee.contract.view.own`

### Visibility

- Bid status, scoring band, award notifications, milestone schedule, payments schedule

### Gates

- If DAE predicts high delivery risk → higher escrow/guarantee required
- Credential gating for high-risk services (LEE)

---

## 3) Buyer Workflow (RAE: Procure Goods/Services)

**Goal**: Procure efficiently with transparent scoring.

### Happy Path

1. Buyer publishes demand notice (specs, budget, milestones)
2. Platform enforces structured templates
3. Bids arrive and are scored:
   - Price
   - Trust band (DTE)
   - Credential band (LEE)
   - Guarantee coverage (GE)
4. Buyer awards contract (maker-checker if institutional)
5. Escrow schedule activates
6. Delivery verified; payments released

### Permissions

- `rae.notice.create`
- `rae.bid.review`
- `rae.award.execute`
- `ge.escrow.manage` (institution-only)

### Visibility

- Bid comparison table (no competitor private details)
- Supplier trust bands, guarantee bands, delivery history summary

### Gates

- High-value procurement requires compliance approval (Platform Risk/Compliance)
- Predictive risk warnings surfaced (DAE)

---

## 4) Co-operative Admin Workflow (Aggregation + Sponsorship)

**Goal**: Aggregate member trade and support members with guarantees.

### Happy Path

1. Admin links co-op member roster (upload/API)
2. Create aggregated lots (commodity batches) or pooled procurement requests
3. Assign internal member caps and permissions
4. Sponsor member guarantees (GE sponsor workflow)
5. Monitor co-op exposure and performance
6. Initiate dispute mediation and resolution
7. Export monthly performance + tax summaries (TAE)

### Permissions

- `coop.members.manage`
- `tee.aggregate.create`
- `ge.sponsor.create`
- `reports.coop.view`

### Visibility

- Aggregated member dashboards (not raw individual sensitive data unless authorized)
- Exposure reports, dispute queue

### Gates

- Sponsorship capped by co-op limits (DAE exposure forecasting)
- Requires maker-checker approval for guarantee sponsorship above threshold

---

## 5) SACCO Admin Workflow (Settlement + Continuous Secondary Trading)

**Goal**: Enable safe liquidity + distribute private instruments to members.

### A) SACCO Settlement & Member Suitability

1. Link SACCO membership database
2. Assign trading tiers
3. Approve member eligibility for securities access (SEE)
4. Monitor exposures and predictive liquidity signals (DAE)

#### Permissions

- `sacco.members.manage`
- `sacco.suitability.approve`
- `settlement.instructions.view`

#### Visibility

- Member eligibility summary, exposure dashboards, compliance alerts

### B) Continuous Secondary Trading (SACCO Channel Only)

1. SACCO activates continuous trading module (licence-gated flag)
2. Members see "SACCO Market" tab
3. Continuous order book enabled for SACCO instruments
4. DAE monitors liquidity stress + triggers circuit breakers
5. Surveillance alerts flagged (DAE + RRE)
6. CDSE handles DvP settlement

#### Permissions

- `see.secondary.trade.continuous.sacco`
- `see.market.halt` (SACCO + Platform Risk only)
- `see.surveillance.view` (compliance roles)

#### Gates

- Continuous trading OFF by default; requires regulatory readiness flag
- Predictive liquidity controls: auto-suggest halts / widening collars (human approval)

---

## 6) Issuer Workflow (Private Placement in SEE)

**Goal**: Raise capital through private placement.

### Happy Path

1. Issuer applies for admission (KYC, disclosures)
2. Upload offering memo + terms
3. DTE checks issuer governance band
4. Offering published to eligible investors (institution-mediated retail)
5. Subscriptions collected
6. CDSE issues ownership entries
7. TAE posts accounting + tax flags
8. Investor reporting pack generated (IRE)

### Permissions

- `see.issuance.create`
- `see.issuance.publish`
- `see.issuance.view.own`

### Visibility

- Subscription dashboard, compliance checklist, disclosure timeline

### Gates

- Issuer governance compliance required (DTE + LEE officer credential gating)
- Higher-risk issuers restricted to institutional investors only

---

## 7) Investor Workflow (Subscribe + Trade + Impact Reporting)

**Goal**: Invest safely and monitor performance and impact.

### Happy Path

1. Investor eligibility verified (institution/SACCO/qualified)
2. Browse offerings (SEE)
3. Subscribe to private placement
4. Receive digital statements
5. Trade secondary (only if eligible)
6. View portfolio + risk forecasts (DAE)
7. View impact matrices (IRE)

### Permissions

- `see.offerings.view`
- `see.invest.subscribe`
- `see.portfolio.view.own`
- `reports.investor.view`

### Visibility

- Portfolio, cashflow forecasts, guarantee coverage, impact dashboard

---

## 8) Fund Manager Workflow (API Trading + Reporting)

**Goal**: Institutional execution + portfolio reporting.

### Happy Path

1. Onboard institution (KYC, API keys)
2. Pull offerings and market data via API
3. Execute orders (subject to RBAC)
4. Fetch NAV and risk forecasts
5. Export impact reports for LPs

### Permissions

- `api.order.submit`
- `api.positions.read`
- `ire.portfolio.read`
- `ire.impact.read`

### Visibility

- Full institutional dashboards, model explainability notes, audit packs

---

## 9) Deposit Manager / Custodian Workflow (Settlement Only)

**Goal**: Execute settlement instructions and reconcile.

### Happy Path

1. Receive settlement queue (CDSE)
2. Confirm movement of funds
3. Reconcile against ledger
4. Confirm settlement completion

### Permissions

- `cdse.settlement.queue.view`
- `cdse.settlement.confirm`

### Visibility

- Settlement instructions only, no trade details beyond required identifiers

---

## 10) Regulator Workflow (RRE Read-only)

**Goal**: Supervisory visibility with drill-down lineage.

### Happy Path

1. Access regulator dashboard (read-only)
2. View market summaries (TEE/SEE volumes, risk, alerts)
3. Drill down with lineage if flagged
4. Download statutory packs

### Permissions

- `rre.dashboard.view`
- `rre.reports.download`

### Visibility

- Aggregated + drill-down where permitted, anonymized where required

---

## Workflow Enhancements (Recommended)

### A) "Action Center" for Every Role

Centralized dashboard showing:

- Pending approvals
- Compliance alerts
- Training requirements
- Settlement exceptions

### B) Trust + Predictive Nudges in UI (Non-punitive)

Proactive guidance messages:

- "Increase your limits by completing course X"
- "This contract requires higher guarantee due to forecasted delivery risk"
- "Liquidity stress predicted in SACCO market — consider call auction window"

### C) Maker–Checker Workflows (High-Risk Actions)

Applies to:

- Publishing offerings
- Enabling continuous trading
- Sponsoring guarantees above threshold
- Halting a market

**Implementation**: Requires dual approval from authorized roles before execution.

---

## Engine Abbreviations Reference

- **DTE**: Dynamic Trust Engine
- **DAE**: Dynamic Analytics Engine
- **GE**: Guarantee Engine
- **CDSE**: Centralized Digital Settlement Engine
- **TAE**: Tax & Accounting Engine
- **RRE**: Regulatory Reporting Engine
- **TEE**: Trade Execution Engine
- **RAE**: Reverse Auction Engine
- **LEE**: Legal & Eligibility Engine
- **SEE**: Securities Exchange Engine
- **IRE**: Impact Reporting Engine

---

## Integration with RBAC

All workflows integrate with the RBAC system described in `RBAC_INTEGRATION_GUIDE.md`. Permissions listed in each workflow should be:

1. Defined in the Permission model
2. Mapped to appropriate roles in RolePermission
3. Assigned to users via UserRole
4. Enforced via `requirePermission()` middleware

See `RBAC_INTEGRATION_GUIDE.md` for implementation details.


