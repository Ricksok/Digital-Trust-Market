# Infrastructure as Code (IaC)

This directory contains infrastructure configurations for deploying the Digital Trust Marketplace to cloud environments.

## Structure

```
infrastructure/
├── terraform/              # Terraform configurations
│   ├── environments/      # Environment-specific configs
│   ├── modules/           # Reusable Terraform modules
│   └── shared/            # Shared resources
│
└── docker/                # Docker-specific configurations
    └── docker-compose.yml # Local development orchestration
```

## Current Status

**Phase 1: Local Docker Setup** ✅
- All services running in Docker locally
- PostgreSQL, Backend, Frontend containerized
- Development and production Dockerfiles

**Phase 2: Terraform Infrastructure** (Future)
- AWS ECS/Fargate for containers
- RDS PostgreSQL for database
- Application Load Balancer
- VPC and networking
- Environment-specific deployments

## Local Development

All services run locally using Docker Compose:

```bash
# From MVP/ directory
docker-compose up -d
```

## Future Cloud Deployment

Terraform will provision:
- **Compute**: ECS/Fargate for containers
- **Database**: RDS PostgreSQL
- **Networking**: VPC, subnets, security groups
- **Load Balancing**: ALB for traffic distribution
- **Storage**: S3 for static assets
- **Monitoring**: CloudWatch logs and metrics

## Environment Strategy

- **Local**: Docker Compose (current)
- **Development**: AWS ECS Dev environment
- **Staging**: AWS ECS Staging environment
- **Production**: AWS ECS Production environment

Each environment will have:
- Separate Terraform configuration
- Environment-specific variables
- Isolated resources
- Proper security boundaries




