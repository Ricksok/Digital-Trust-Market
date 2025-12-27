#!/bin/bash
# Bash script to start development mode with hot reload
# Usage: ./start-dev.sh

echo "🚀 Starting development mode with hot reload..."
echo ""

# Stop any running containers
echo "Stopping existing containers..."
docker-compose down

# Start with development configuration
echo "Starting development services..."
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build

echo ""
echo "✅ Development mode started!"
echo "📝 Changes will reflect immediately (hot reload enabled)"
echo "🛑 Press Ctrl+C to stop"


