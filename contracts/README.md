# Smart Contracts

Smart contracts for the Digital Trust Marketplace escrow functionality.

## Contracts

- **Escrow.sol**: Main escrow contract for holding funds between investors and fundraisers

## Development

### Prerequisites

- Node.js 18+
- Hardhat

### Setup

```bash
npm install
```

### Compile

```bash
npm run compile
```

### Test

```bash
npm run test
```

### Deploy

```bash
# Local network
npm run deploy:local

# Testnet
npm run deploy:testnet

# Mainnet
npm run deploy:mainnet
```

### Local Development Network

```bash
npm run node
```

This will start a local Hardhat network on `http://127.0.0.1:8545`


