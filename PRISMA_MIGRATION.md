# Prisma Migration Guide

## 🎯 Overview

This project has been migrated from raw SQL to **Prisma ORM** for better TypeScript support, type safety, and developer experience.

## 🚀 Benefits of Prisma

### TypeScript Integration

- **Auto-generated types** for all database operations
- **Type-safe queries** with full IntelliSense support
- **Compile-time error checking** for database operations
- **Automatic type inference** for tRPC procedures

### Developer Experience

- **Prisma Studio** - Visual database browser
- **Automatic migrations** with version control
- **Schema validation** and introspection
- **Query optimization** and performance insights

### tRPC Integration

- **Seamless integration** with tRPC type inference
- **Type-safe API endpoints** with automatic validation
- **Better error handling** with typed error responses

## 📦 Installation & Setup

### 1. Install Dependencies

```bash
npm install prisma @prisma/client
npm install -D tsx
```

### 2. Environment Configuration

Add to your `.env` file:

```env
DATABASE_URL="postgresql://icp_user:password@localhost:5432/icp_builder"
```

### 3. Generate Prisma Client

```bash
npm run db:generate
```

### 4. Push Schema to Database

```bash
npm run db:push
```

### 5. Seed Database

```bash
npm run db:seed
```

## 🛠️ Available Scripts

| Script                | Description                         |
| --------------------- | ----------------------------------- |
| `npm run db:generate` | Generate Prisma client              |
| `npm run db:push`     | Push schema changes to database     |
| `npm run db:migrate`  | Create and apply migrations         |
| `npm run db:seed`     | Seed database with sample data      |
| `npm run db:studio`   | Open Prisma Studio                  |
| `npm run db:reset`    | Reset database and apply migrations |

## 📊 Database Schema

### Models

#### User

```typescript
model User {
  id        String   @id @default(uuid()) @db.Uuid
  email     String   @unique
  name      String
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  companies Company[]
}
```

#### Company

```typescript
model Company {
  id        Int      @id @default(autoincrement())
  userId    String   @map("user_id") @db.Uuid
  name      String
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  user        User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  companyData CompanyData[]
  icpProfiles ICPProfile[]
}
```

#### CompanyData

```typescript
model CompanyData {
  id         String @id @default(uuid()) @db.Uuid
  companyId  Int    @map("company_id")
  fieldName  String @map("field_name")
  fieldValue String @map("field_value")
  version    Int    @default(1)
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")

  company Company @relation(fields: [companyId], references: [id], onDelete: Cascade)

  @@unique([companyId, fieldName])
}
```

#### ICPProfile

```typescript
model ICPProfile {
  id             String @id @default(uuid()) @db.Uuid
  companyId      Int    @map("company_id")
  name           String
  description    String?
  profileData    Json   @map("profile_data")
  confidenceLevel String @default("medium") @map("confidence_level")
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  company   Company    @relation(fields: [companyId], references: [id], onDelete: Cascade)
  campaigns Campaign[]
}
```

#### Campaign

```typescript
model Campaign {
  id              String @id @default(uuid()) @db.Uuid
  name            String
  icpId           String @map("icp_id") @db.Uuid
  copyStyle       String @map("copy_style")
  mediaType       String @map("media_type")
  adCopy          String @map("ad_copy")
  imagePrompt     String? @map("image_prompt")
  imageUrl        String? @map("image_url")
  cta             String
  hooks           String
  landingPageCopy String @map("landing_page_copy")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  icpProfile ICPProfile @relation(fields: [icpId], references: [id], onDelete: Cascade)
}
```

## 🔧 Usage Examples

### tRPC Router with Prisma

```typescript
import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { prisma } from '../../services/database/prisma-service';

export const companyRouter = createTRPCRouter({
  // Get all companies with full data
  getCompanies: publicProcedure.query(async () => {
    return await prisma.company.findMany({
      include: {
        companyData: true,
        icpProfiles: {
          include: {
            campaigns: true,
          },
        },
      },
    });
  }),

  // Create company with data
  createCompany: publicProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
        name: z.string(),
        companyData: z.array(
          z.object({
            fieldName: z.string(),
            fieldValue: z.string(),
          }),
        ),
      }),
    )
    .mutation(async ({ input }) => {
      return await prisma.company.create({
        data: {
          userId: input.userId,
          name: input.name,
          companyData: {
            create: input.companyData,
          },
        },
        include: {
          companyData: true,
        },
      });
    }),
});
```

### Type-Safe Database Operations

```typescript
import { prisma } from '../services/database/prisma-service';
import type { Company, CompanyData } from '@prisma/client';

// Fully typed query with relations
const companyWithData: Company & {
  companyData: CompanyData[];
  icpProfiles: ICPProfile[];
} = await prisma.company.findUnique({
  where: { id: 1 },
  include: {
    companyData: true,
    icpProfiles: true,
  },
});

// Type-safe mutations
const newCompany: Company = await prisma.company.create({
  data: {
    userId: 'user-uuid',
    name: 'New Company',
  },
});
```

## 🔄 Migration from Raw SQL

### Before (Raw SQL)

```typescript
// Manual SQL queries with no type safety
const result = await pool.query('SELECT * FROM companies WHERE user_id = $1', [
  userId,
]);
const companies = result.rows; // any[]
```

### After (Prisma)

```typescript
// Type-safe queries with full IntelliSense
const companies: Company[] = await prisma.company.findMany({
  where: { userId },
  include: { companyData: true },
});
```

## 🎨 Prisma Studio

Access your database visually:

```bash
npm run db:studio
```

Features:

- **Browse data** in a web interface
- **Edit records** directly
- **View relationships** between tables
- **Filter and search** data
- **Export data** in various formats

## 🚨 Important Notes

### Environment Variables

- Update your `.env` file with the correct `DATABASE_URL`
- Ensure the database user has proper permissions

### Type Generation

- Run `npm run db:generate` after schema changes
- Import types from `@prisma/client` for full type safety

### Migrations

- Use `npm run db:push` for development
- Use `npm run db:migrate` for production deployments

### Performance

- Prisma includes query optimization
- Use `include` and `select` to optimize data fetching
- Monitor query performance with Prisma Studio

## 🔗 Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma with tRPC](https://trpc.io/docs/prisma)
- [TypeScript Integration](https://www.prisma.io/docs/concepts/components/prisma-client/type-safety)
- [Prisma Studio](https://www.prisma.io/docs/concepts/tools/prisma-studio)
