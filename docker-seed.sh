#!/bin/bash
# Docker Seed Script for Linux/Mac
# Usage: ./docker-seed.sh

echo "🌱 Docker Database Seed Script"
echo ""

# Check if Docker is running
echo "📋 Checking Docker status..."
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker."
    exit 1
fi
echo "✅ Docker is running"
echo ""

# Check if containers are running
echo "📋 Checking container status..."
if ! docker-compose ps | grep -q "Up"; then
    echo "⚠️  No containers are running. Starting services..."
    docker-compose up -d
    echo "⏳ Waiting for services to be healthy (30 seconds)..."
    sleep 30
else
    echo "✅ Containers are running"
fi
echo ""

# Check if backend container exists
echo "📋 Checking backend container..."
if ! docker-compose ps backend > /dev/null 2>&1; then
    echo "❌ Backend container not found. Please run: docker-compose up -d"
    exit 1
fi
echo "✅ Backend container found"
echo ""

# Check if PostgreSQL is ready
echo "📋 Checking PostgreSQL connection..."
if ! docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
    echo "❌ PostgreSQL is not ready. Please wait and try again."
    exit 1
fi
echo "✅ PostgreSQL is ready"
echo ""

# Run seed script
echo "🌱 Running database seed script..."
echo ""
docker-compose exec backend npm run db:seed

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Seed completed successfully!"
    echo ""
    echo "📊 Summary:"
    echo "   - 69 Users (1 admin, 14 investors, 14 fundraisers, 40 end users)"
    echo "   - 9 Projects"
    echo "   - 15+ Investments"
    echo "   - 7+ Auctions"
    echo "   - 5 Guarantee Requests"
    echo "   - 4 Tokens with transactions"
    echo "   - 4 Governance Proposals"
    echo "   - 3 Staking Pools"
    echo ""
    echo "🔑 Demo Credentials:"
    echo "   Admin: admin@marketplace.com / admin123"
    echo "   Investor: investor1@example.com / investor123"
    echo "   Fundraiser: fundraiser1@example.com / fundraiser123"
    echo ""
    echo "🌐 Access:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend: http://localhost:3001"
    echo "   Health: http://localhost:3001/health"
else
    echo ""
    echo "❌ Seed failed. Check the logs:"
    echo "   docker-compose logs backend"
    exit 1
fi

