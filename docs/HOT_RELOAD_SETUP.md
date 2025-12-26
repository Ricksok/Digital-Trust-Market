# Hot Reload Setup Guide

## Quick Start - Enable Hot Reload

You have two options to enable hot reload:

### Option 1: Use Development Compose File (Recommended)

Use the existing `docker-compose.dev.yml` file:

**Windows (PowerShell):**
```powershell
# Stop current containers
docker-compose down

# Start with development mode (hot reload enabled)
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Or use the helper script
.\start-dev.ps1
```

**Linux/Mac:**
```bash
# Stop current containers
docker-compose down

# Start with development mode (hot reload enabled)
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Or use the helper script
./start-dev.sh
```

This will:
- ✅ Enable hot reload for frontend (Next.js dev server)
- ✅ Enable hot reload for backend (tsx watch)
- ✅ Mount your local code as volumes
- ✅ Changes reflect immediately without rebuilding

### Option 2: Modify docker-compose.yml for Development

Uncomment the volume mounts in `docker-compose.yml`:

```yaml
backend:
  environment:
    NODE_ENV: development  # Change from production
  volumes:
    - ./backend:/app
    - /app/node_modules
    - /app/dist
  command: npm run dev  # Change from npm start

frontend:
  environment:
    NODE_ENV: development  # Change from production
  volumes:
    - ./frontend:/app
    - /app/node_modules
    - /app/.next
  command: npm run dev  # Change from default
```

Then run:
```bash
docker-compose up --build
```

## Current Setup (Production Mode)

Your current `docker-compose.yml` is in **production mode**:
- ❌ No volume mounts
- ❌ Code is built into Docker image
- ❌ Must rebuild for changes

## Development Mode Features

When using development mode:
- ✅ **Hot Reload**: Changes reflect immediately
- ✅ **Volume Mounts**: Your local code is synced
- ✅ **Fast Iteration**: No rebuilds needed
- ✅ **Better Debugging**: Source maps and dev tools

## Commands

### Start Development Mode

**Windows (PowerShell):**
```powershell
# Using dev compose file
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Or use the helper script
.\start-dev.ps1

# Or if you modified docker-compose.yml
docker-compose up
```

**Linux/Mac:**
```bash
# Using dev compose file
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Or use the helper script
./start-dev.sh

# Or if you modified docker-compose.yml
docker-compose up
```

### Stop Services
```bash
docker-compose down
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f frontend
docker-compose logs -f backend
```

### Rebuild (if needed)
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml build
```

## Troubleshooting

### Changes Not Reflecting?

1. **Check volume mounts are active:**
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.dev.yml config
   ```

2. **Verify dev mode is running:**
   ```bash
   docker-compose ps
   # Should show NODE_ENV=development
   ```

3. **Check file permissions:**
   - Ensure your local files are readable
   - On Windows, check WSL2 file permissions if using WSL

### Port Already in Use?

If ports 3000 or 3001 are already in use:
```bash
# Change ports in docker-compose.yml
FRONTEND_PORT=3001
BACKEND_PORT=3002
```

### Node Modules Issues?

If you get module errors:
```bash
# Rebuild with no cache
docker-compose -f docker-compose.yml -f docker-compose.dev.yml build --no-cache

# Or remove node_modules volume and rebuild
docker-compose down -v
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

## Switching Between Dev and Production

### Development

**Windows (PowerShell):**
```powershell
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
# Or
.\start-dev.ps1
```

**Linux/Mac:**
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
# Or
./start-dev.sh
```

### Production
```bash
docker-compose up --build
```

## Windows-Specific Notes

- ✅ **No chmod needed**: Windows handles file permissions differently
- ✅ **Use PowerShell**: The `start-dev.ps1` script works in PowerShell
- ✅ **File paths**: Docker handles Windows paths automatically
- ✅ **Line endings**: Git should handle CRLF/LF automatically

If you get permission errors, run PowerShell as Administrator.

---

**Note**: After enabling development mode, your changes will reflect immediately without rebuilding! 🚀

