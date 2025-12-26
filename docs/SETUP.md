# Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ and npm
- **PostgreSQL** 14+ (or use a cloud database)
- **Git**
- **Ethereum Wallet** (MetaMask recommended for testing)

## Quick Start

### 1. Clone and Install

```bash
# Install root dependencies
npm install

# Install all project dependencies
npm run install:all
```

### 2. Database Setup

1. Create a PostgreSQL database:
```sql
CREATE DATABASE digital_trust_marketplace;
```

2. Configure environment variables:
```bash
# Copy the example env file
cp .env.example .env

# Edit .env and set your DATABASE_URL
DATABASE_URL="postgresql://user:password@localhost:5432/digital_trust_marketplace?schema=public"
```

3. Run migrations:
```bash
cd backend
npm run db:generate
npm run db:migrate
npm run db:seed
```

### 3. Backend Setup

```bash
cd backend

# Create .env file (if not done already)
# Set required environment variables:
# - DATABASE_URL
# - JWT_SECRET
# - PORT (default: 3001)

# Start development server
npm run dev
```

The backend API will be available at `http://localhost:3001`

### 4. Frontend Setup

```bash
cd frontend

# Create .env.local file
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_CONTRACT_ADDRESS= # Set after deploying contracts

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

### 5. Smart Contracts Setup

```bash
cd contracts

# Install dependencies
npm install

# Compile contracts
npm run compile

# Start local Hardhat node (in a separate terminal)
npm run node

# Deploy to local network (in another terminal)
npm run deploy:local
```

Copy the deployed contract address to your `.env` files.

## Development Workflow

### Running Everything

From the root directory:
```bash
npm run dev
```

This will start both backend and frontend concurrently.

### Database Management

```bash
cd backend

# Create a new migration
npm run db:migrate

# View database in Prisma Studio
npm run db:studio

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

### Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# Contract tests
cd contracts
npm test
```

## Environment Variables

### Backend (.env)

Required:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret for JWT token signing
- `PORT`: Server port (default: 3001)

Optional:
- `FRONTEND_URL`: Frontend URL for CORS
- `KYC_API_KEY`: KYC service API key
- `PAYMENT_GATEWAY_API_KEY`: Payment gateway credentials
- `BLOCKCHAIN_NETWORK`: Blockchain network (localhost/testnet/mainnet)
- `PRIVATE_KEY`: Private key for contract deployments

### Frontend (.env.local)

Required:
- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NEXT_PUBLIC_CONTRACT_ADDRESS`: Deployed escrow contract address

### Contracts (.env)

Optional:
- `PRIVATE_KEY`: Private key for deployments
- `TESTNET_RPC_URL`: Testnet RPC endpoint
- `MAINNET_RPC_URL`: Mainnet RPC endpoint

## Troubleshooting

### Database Connection Issues

1. Verify PostgreSQL is running
2. Check DATABASE_URL format
3. Ensure database exists
4. Check user permissions

### Port Already in Use

Change the PORT in `.env` or kill the process using the port:
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3001 | xargs kill
```

### Contract Deployment Issues

1. Ensure Hardhat node is running
2. Check network configuration in `hardhat.config.ts`
3. Verify private key has sufficient funds (for testnet/mainnet)

### Module Not Found Errors

Run `npm install` in the respective directory:
```bash
npm run install:all
```

## Next Steps

1. **Configure External Services**: Set up KYC, payment gateway, and other integrations
2. **Deploy to Testnet**: Test smart contracts on a test network
3. **Set Up CI/CD**: Configure automated testing and deployment
4. **Add Features**: Implement additional features based on requirements

## Support

For issues or questions, refer to:
- [Architecture Documentation](./ARCHITECTURE.md)
- [API Documentation](./API.md)
- Project README


