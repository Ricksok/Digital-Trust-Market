# Web3-Powered Digital Trust Marketplace

A comprehensive platform connecting investors and fundraisers with integrated KYC/AML, due diligence, payment processing, and smart contract escrow services.

## Architecture Overview

### User Types

**Investors:**
- Individual Investors
- Institutional Investors
- Impact Funds

**Fundraisers:**
- SMEs & Startups
- Social Enterprises
- Real Estate Projects

### Platform Core Services

1. **User Authentication** - Secure authentication with Web3 wallet support
2. **KYC/AML Verification** - Know Your Customer and Anti-Money Laundering compliance
3. **Due Diligence Engine** - Automated and manual due diligence processes
4. **Payment Gateway Integration** - Secure payment processing
5. **Smart Contracts for Escrow** - Blockchain-based escrow services
6. **Licensing Compliance (CMA CPO)** - Capital Markets Authority compliance
7. **Data Analytics Dashboard** - Real-time insights and reporting

### External Services Integration

- Independent Auditors
- Capital Markets Authority (Kenya)
- Partner Banks
- External Investors & Partners

## Project Structure

```
├── backend/          # Node.js/Express API server
├── frontend/         # Next.js React application
├── contracts/        # Solidity smart contracts
├── shared/           # Shared types and utilities
└── docs/             # Documentation
```

## Getting Started

### Prerequisites

**Option 1: Docker (Recommended for Enterprise Setup)**
- Docker Desktop (Windows/Mac) or Docker Engine + Docker Compose (Linux)
- Docker version 20.10 or higher

**Option 2: Local Development**
- Node.js 18+ and npm
- PostgreSQL database
- Ethereum-compatible blockchain (for smart contracts)
- Hardhat or Foundry (for contract development)

### Quick Start with Docker

```bash
# 1. Copy environment file
cp .env.example .env

# 2. Edit .env and update:
#    - POSTGRES_PASSWORD (change from default)
#    - JWT_SECRET (generate strong secret, min 32 chars)

# 3. Start all services
docker-compose up -d

# 4. Seed database
docker-compose exec backend npm run db:seed

# 5. Access services:
#    - Frontend: http://localhost:3000
#    - Backend API: http://localhost:3001
#    - Health Check: http://localhost:3001/health
```

See [DOCKER_SETUP.md](./DOCKER_SETUP.md) for detailed Docker setup instructions.

### Local Installation

```bash
# Install all dependencies (root, backend, frontend, and contracts)
npm run install:all

# Set up environment variables
# Copy .env.example files in each directory and configure them

# Set up database
cd backend
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run migrations
npm run db:seed      # Seed with dummy data (11 users, 6 projects, investments, etc.)
```

**Demo Data Included:**
- 11 users (1 admin, 5 investors, 5 fundraisers)
- 6 projects across different categories
- Multiple investments with various statuses
- Payments, escrow contracts, KYC records, and more

**Quick Demo Login:**
- Admin: `admin@marketplace.com` / `admin123`
- Investor: `investor1@example.com` / `investor123`
- Fundraiser: `fundraiser1@example.com` / `fundraiser123`

See [QUICK_DEMO_GUIDE.md](./QUICK_DEMO_GUIDE.md) for more details.
```

### Running the Project

```bash
# Start both backend and frontend
npm run dev

# Or start individually:
npm run dev:backend   # Backend API: http://localhost:3001
npm run dev:frontend  # Frontend: http://localhost:3000
```

### Smart Contract Development

```bash
cd contracts

# Compile contracts
npm run compile

# Run tests
npm run test

# Start local Hardhat node
npm run node

# Deploy to local network
npm run deploy:local
```

### Environment Variables

See `.env.example` files in each directory:
- `backend/.env.example` - Backend configuration
- `frontend/.env.example` - Frontend configuration  
- `contracts/.env.example` - Smart contract configuration

## Tech Stack

- **Backend**: Node.js, Express, TypeScript, Prisma ORM, PostgreSQL
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Blockchain**: Solidity, Hardhat, ethers.js
- **Database**: PostgreSQL (Enterprise-grade, containerized)
- **Containerization**: Docker, Docker Compose
- **Authentication**: JWT, Web3 wallet integration
- **Architecture**: Microservices-ready, enterprise-grade setup

## Development

### Database Migrations

```bash
cd backend
npm run db:migrate    # Create and run migrations
npm run db:studio     # Open Prisma Studio (database GUI)
```

### Building for Production

```bash
# Build all projects
npm run build

# Build individually
npm run build:backend
npm run build:frontend
```

### Testing

```bash
# Run all tests
npm test

# Run individually
npm run test:backend
npm run test:frontend
cd contracts && npm test
```

## API Documentation

See [docs/API.md](./docs/API.md) for detailed API documentation.

## Architecture Documentation

See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for system architecture details.

## Setup Guide

See [docs/SETUP.md](./docs/SETUP.md) for detailed setup instructions.

## License

MIT
# Digital-Trust-Market
# Digital-Trust-Market
# Digital-Trust-Market
