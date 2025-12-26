# Quick Migration Guide

## ⚠️ IMPORTANT: Stop Dev Server First!

The database is currently locked because the dev server is running. You **must** stop it before applying the migration.

## Quick Steps

### 1. Stop the Dev Server
- Find the terminal running `npm run dev`
- Press `Ctrl+C` to stop it
- Or close the terminal window

### 2. Apply Migration (One Command)
```bash
cd backend
npm run db:apply-migration
```

This will:
- ✅ Apply the database migration
- ✅ Regenerate Prisma client
- ✅ Fix all TypeScript errors

### 3. Restart Dev Server
```bash
# From project root
npm run dev
```

## What This Does

The migration adds:
- 8 new database tables (EntityRole, Auction, Bid, GuaranteeRequest, etc.)
- Extends User and Project models
- Enables all new OptiChain features

## Verification

After migration, verify it worked:
```bash
cd backend
npx tsc --noEmit
```

Should show no errors! ✅

## Troubleshooting

**"Database is locked"**
→ Make sure dev server is stopped. Wait 2-3 seconds and try again.

**"Migration already applied"**
→ Just run: `npx prisma generate`

**Need to reset everything**
→ `npm run db:reset` (⚠️ deletes all data)

---

**That's it!** After these 3 steps, everything will be ready. 🚀




