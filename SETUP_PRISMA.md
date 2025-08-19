# Quick Prisma Setup Guide

## 🚀 Getting Started with Prisma

### 1. Environment Setup

Add to your `.env.local` file:

```env
DATABASE_URL="postgresql://icp_user:password@localhost:5432/icp_builder"
```

### 2. Generate Prisma Client

```bash
npm run db:generate
```

### 3. Push Schema to Database

```bash
npm run db:push
```

### 4. Seed Database

```bash
npm run db:seed
```

### 5. Open Prisma Studio (Optional)

```bash
npm run db:studio
```

## 🔧 Using Prisma in Your Code

### Import Prisma Client

```typescript
import { prisma } from '../services/database/prisma-service';
import type { Company, CompanyData } from '@prisma/client';
```

### Type-Safe Queries

```typescript
// Get all companies with their data
const companies = await prisma.company.findMany({
  include: {
    companyData: true,
    icpProfiles: {
      include: {
        campaigns: true,
      },
    },
  },
});

// Create new company
const newCompany = await prisma.company.create({
  data: {
    userId: 'user-uuid',
    name: 'New Company',
    companyData: {
      create: [
        { fieldName: 'industry', fieldValue: 'Technology' },
        { fieldName: 'location', fieldValue: 'San Francisco' },
      ],
    },
  },
  include: {
    companyData: true,
  },
});
```

## 🎯 Benefits You Get

✅ **Full TypeScript Support** - Auto-generated types for all database operations  
✅ **IntelliSense** - Complete code completion and error checking  
✅ **Type Safety** - Compile-time validation of database queries  
✅ **tRPC Integration** - Seamless integration with your existing tRPC setup  
✅ **Prisma Studio** - Visual database browser and editor  
✅ **Automatic Migrations** - Version-controlled database schema changes

## 📚 Next Steps

1. **Read the full migration guide**: [PRISMA_MIGRATION.md](PRISMA_MIGRATION.md)
2. **Check the example router**: `src/server/routes/example-prisma-router.ts`
3. **Explore Prisma Studio**: Run `npm run db:studio`
4. **Update your existing routers** to use Prisma instead of raw SQL

## 🆘 Need Help?

- Check the [Prisma Documentation](https://www.prisma.io/docs)
- Review the example router in this project
- Open Prisma Studio to explore your data visually
