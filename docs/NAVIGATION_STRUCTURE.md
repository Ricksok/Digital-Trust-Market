# Navigation Structure - Two-Sided Marketplace

## Securities Exchange Layout

```
Securities Exchange
│
├── Projects (Products for Sale)
│   └── All investment opportunities/projects available for purchase
│       └── Projects are the "products" in this marketplace
│
├── Equity (Consideration/Payment Method)
│   ├── Ordinary Shares
│   │   └── Purchase projects using ordinary shares as consideration
│   └── Preference Shares
│       └── Purchase projects using preference shares as consideration
│
├── Debt (Consideration/Payment Method - Secured by Guarantees)
│   ├── Bonds
│   │   └── Purchase projects using bonds as consideration (secured by guarantees)
│   └── Loans
│       └── Purchase projects using loans as consideration (secured by guarantees)
│
└── Guarantees (Security for Debt Transactions)
    └── Guarantee instruments that secure debt-based transactions
```

## Two-Sided Marketplace Concept

### Side 1: Sellers/Fundraisers (Supply Side)
- **List Projects** (products for sale)
- Set terms:
  - Accept Equity consideration (Ordinary Shares or Preference Shares)
  - Accept Debt consideration (Bonds or Loans - secured by Guarantees)
- Projects are the "products being sold"

### Side 2: Buyers/Investors (Demand Side)
- **Browse Projects** (products available)
- Choose consideration method:
  - **Equity**: Pay with Ordinary Shares or Preference Shares
  - **Debt**: Pay with Bonds or Loans (must be secured by Guarantees)
- View available Guarantees to secure debt transactions

## Transaction Flow

```
1. Fundraiser lists Project (product)
   └── Sets acceptable consideration: Equity OR Debt

2. Investor browses Projects
   └── Selects Project to purchase

3. Investor chooses consideration method:
   ├── Equity Path:
   │   ├── Ordinary Shares → Purchase Project
   │   └── Preference Shares → Purchase Project
   │
   └── Debt Path:
       ├── Bonds (secured by Guarantee) → Purchase Project
       └── Loans (secured by Guarantee) → Purchase Project
```

## Route Structure

```
/securities/projects                    - Browse all projects (products for sale)
/securities/equity/ordinary-shares     - Projects accepting ordinary shares
/securities/equity/preference-shares    - Projects accepting preference shares
/securities/debt/bonds                 - Projects accepting bonds (secured)
/securities/debt/loans                  - Projects accepting loans (secured)
/securities/guarantees                  - Guarantee marketplace (for securing debt)
```

## Navigation Order (Top to Bottom)

1. **Projects** - The products being sold (first, as it's the main product)
2. **Equity** - One payment method (with sub-options)
3. **Debt** - Another payment method (with sub-options, secured)
4. **Guarantees** - Security mechanism for debt transactions

