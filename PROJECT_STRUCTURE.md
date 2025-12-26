# Project Structure - Enterprise Grade with IaC Readiness

## 📁 Current Structure

```
MVP/
├── backend/                    # Backend API Service
│   ├── src/                   # Source code
│   ├── prisma/               # Database schema & migrations
│   ├── Dockerfile            # Production Docker image
│   ├── Dockerfile.dev        # Development Docker image
│   └── .env                  # Backend environment variables
│
├── frontend/                  # Frontend Application
│   ├── app/                  # Next.js app directory
│   ├── components/           # React components
│   ├── Dockerfile            # Production Docker image
│   ├── Dockerfile.dev        # Development Docker image
│   └── .env.local            # Frontend environment variables
│
├── contracts/                 # Smart Contracts (Solidity)
│   ├── contracts/            # Solidity contracts
│   └── scripts/              # Deployment scripts
│
├── infrastructure/            # ✨ NEW: Infrastructure as Code
│   ├── terraform/            # Terraform configurations
│   │   ├── environments/    # Environment-specific configs
│   │   │   ├── dev/
│   │   │   ├── staging/
│   │   │   └── production/
│   │   ├── modules/          # Reusable Terraform modules
│   │   │   ├── ecs/         # ECS service module
│   │   │   ├── rds/         # RDS database module
│   │   │   ├── vpc/         # VPC networking module
│   │   │   └── alb/         # Load balancer module
│   │   └── main.tf          # Main Terraform configuration
│   └── docker/               # Docker-specific configs
│       └── docker-compose.yml
│
├── docker-compose.yml        # Local development orchestration
├── docker-compose.dev.yml    # Development overrides
├── docker-compose.prod.yml   # Production overrides
│
├── .env                      # Root environment variables (Docker Compose)
├── .env.example              # Environment template
│
└── docs/                     # Documentation
    ├── architecture/
    ├── deployment/
    └── api/
```

## 🎯 Design Principles

### 1. Separation of Concerns
- **Application Code**: `backend/`, `frontend/`, `contracts/`
- **Infrastructure**: `infrastructure/terraform/`
- **Configuration**: Environment-specific `.env` files
- **Documentation**: `docs/`

### 2. Docker-First Architecture
- Each service has its own Dockerfile
- Docker Compose for local orchestration
- Production-ready multi-stage builds
- Development mode with hot reload

### 3. Infrastructure as Code (IaC)
- Terraform for cloud provisioning
- Environment-specific configurations
- Reusable modules
- Version-controlled infrastructure

### 4. Environment Management
- Root `.env`: Docker Compose variables
- `backend/.env`: Backend-specific configs
- `frontend/.env.local`: Frontend-specific configs
- Environment-specific Terraform vars

## 🐳 Docker Architecture

### Services
1. **PostgreSQL** (`postgres`)
   - Database: `digital_trust_marketplace`
   - Port: 5432
   - Volume: `postgres_data`

2. **Backend** (`backend`)
   - API: Express/TypeScript
   - Port: 3001
   - Auto-migrations on startup
   - Health checks

3. **Frontend** (`frontend`)
   - Next.js application
   - Port: 3000
   - Standalone production build

### Network
- **Network**: `mvp-network` (bridge)
- **Isolation**: Services communicate via service names

## ☁️ Terraform Structure (Future)

```
infrastructure/terraform/
├── environments/
│   ├── dev/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── terraform.tfvars
│   ├── staging/
│   └── production/
│
├── modules/
│   ├── ecs-service/          # ECS service module
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── rds-postgres/          # RDS PostgreSQL module
│   ├── vpc/                   # VPC networking
│   └── alb/                   # Application Load Balancer
│
└── shared/                    # Shared resources
    ├── backend.tf            # S3 backend config
    └── providers.tf           # Provider configurations
```

## 📋 Environment Variables Structure

### Root `.env` (Docker Compose)
```env
# PostgreSQL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=...
POSTGRES_DB=digital_trust_marketplace

# Services
BACKEND_PORT=3001
FRONTEND_PORT=3000

# Secrets
JWT_SECRET=...
```

### Backend `.env`
```env
# DATABASE_URL auto-set by Docker Compose
NODE_ENV=production
PORT=3001
JWT_SECRET=...
```

### Frontend `.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 🔧 Key Files

### Docker Configuration
- `docker-compose.yml`: Main orchestration
- `docker-compose.dev.yml`: Development overrides
- `backend/Dockerfile`: Production backend image
- `frontend/Dockerfile`: Production frontend image

### Database
- `backend/prisma/schema.prisma`: Database schema
- `backend/prisma/migrations/`: Migration files
- `backend/prisma/seed.ts`: Seed script

### Infrastructure (Future)
- `infrastructure/terraform/`: Terraform configs
- `infrastructure/terraform/environments/`: Environment configs
- `infrastructure/terraform/modules/`: Reusable modules

## 🚀 Deployment Flow

### Local Development
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

### Production Build
```bash
docker-compose build
docker-compose up -d
```

### Cloud Deployment (Future)
```bash
cd infrastructure/terraform/environments/production
terraform init
terraform plan
terraform apply
```

## ✅ Best Practices

1. **Environment Isolation**: Separate configs per environment
2. **Secret Management**: Use environment variables, never commit secrets
3. **Version Control**: Track infrastructure changes in Git
4. **Modularity**: Reusable Terraform modules
5. **Documentation**: Keep docs updated with structure changes

## 📊 Service Dependencies

```
PostgreSQL (Database)
    ↑
    │
Backend (API)
    ↑
    │
Frontend (UI)
```

## 🔐 Security Considerations

- Secrets in environment variables (not in code)
- Non-root users in containers
- Network isolation
- Health checks for monitoring
- Volume encryption (production)

## 📈 Scalability

- Horizontal scaling ready (stateless services)
- Database connection pooling
- Load balancer ready (ALB module)
- Auto-scaling groups (ECS/Fargate)
