# ICP Builder - Architecture Documentation

## 🏗️ System Overview

ICP Builder is a Next.js application that generates Ideal Customer Profiles (ICPs) and marketing campaigns using AI. Built with TypeScript, tRPC, Prisma ORM, PostgreSQL, and Redis for optimal performance and type safety.

## 📁 Project Structure

```text
src/
├── components/          # React components
│   ├── icp/            # ICP generation and management
│   ├── campaign/       # Campaign creation and library
│   ├── ui/             # Reusable UI components
│   └── providers/      # Context providers
├── services/           # Business logic
│   ├── ai/             # AI services (ICP + Campaign generation)
│   ├── database/       # Prisma services and database operations
│   ├── cache/          # Redis caching services
│   └── project/        # Project management
├── server/             # tRPC API routes with Prisma integration
├── prisma/             # Database schema and migrations
├── hooks/              # Custom React hooks
└── lib/                # Utilities
```

## 🔄 Data Flow

```text
User Input → UI Components → tRPC → Prisma Services → PostgreSQL
                                    ↘︎ AI Services → LLM → Results
                                    ↗︎ Redis Cache ← Performance
                                    ↗︎ Type Safety ← Prisma Client
```

## 🧠 AI Architecture

### Core Components

- **AISDKService**: Base AI service with Ollama integration
- **ICP Generator**: Template selection + profile generation
- **Campaign Generator**: Context-aware campaign creation

### AI Workflow

1. **Business Model Analysis** → Determines B2B/B2C/B2B2C
2. **Template Selection** → AI selects from 140+ templates
3. **Single-Call Generation** → One LLM call per ICP/Campaign
4. **Data Persistence** → Stores results with cache optimization

### Performance

- **ICP Generation**: 30-60 seconds per profile
- **Campaign Generation**: 15-30 seconds per campaign
- **Template Library**: 140+ B2B, B2C, B2B2C variations

## 🗄️ Database Schema (Prisma)

### Core Models

```typescript
// User management
model User {
  id        String    @id @default(uuid()) @db.Uuid
  email     String    @unique
  name      String
  companies Company[]
}

// Company management
model Company {
  id          Int           @id @default(autoincrement())
  userId      String        @map("user_id") @db.Uuid
  name        String
  user        User          @relation(fields: [userId], references: [id])
  companyData CompanyData[]
  icpProfiles ICPProfile[]
}

// Key-value company data storage
model CompanyData {
  id         String   @id @default(uuid()) @db.Uuid
  companyId  Int      @map("company_id")
  fieldName  String   @map("field_name")
  fieldValue String   @map("field_value")
  version    Int      @default(1)
  company    Company  @relation(fields: [companyId], references: [id])
}

// ICP profiles with JSON data
model ICPProfile {
  id              String     @id @default(uuid()) @db.Uuid
  companyId       Int        @map("company_id")
  name            String
  profileData     Json       @map("profile_data")
  confidenceLevel String     @default("medium")
  campaigns       Campaign[]
  company         Company    @relation(fields: [companyId], references: [id])
}

// Marketing campaigns
model Campaign {
  id              String @id @default(uuid()) @db.Uuid
  name            String
  icpId           String @map("icp_id") @db.Uuid
  copyStyle       String @map("copy_style")
  mediaType       String @map("media_type")
  adCopy          String @map("ad_copy")
  icpProfile      ICPProfile @relation(fields: [icpId], references: [id])
}
```

### Benefits of Prisma Schema

- **Type Safety**: Auto-generated TypeScript types
- **Migrations**: Version-controlled schema changes
- **Relations**: Type-safe foreign key relationships
- **Validation**: Built-in data validation
- **Introspection**: Schema reflection and tooling

## 🔧 Key Services

### AI Services

- **Template Selection**: AI-driven selection from 140+ templates
- **ICP Generation**: Complete customer profiles with single LLM call
- **Campaign Generation**: Multi-platform campaigns with context awareness

### Database Services (Prisma)

- **Prisma Client**: Type-safe database operations with auto-generated types
- **Company Management**: CRUD operations with relational data loading
- **ICP Profiles**: JSON storage with type validation and includes
- **Campaign Management**: Relational campaign storage with ICP associations
- **Query Optimization**: Efficient includes, selects, and connection pooling

### Cache Services

- **Redis**: Multi-layered caching with TTL-based invalidation
- **Cache Strategy**: Company (30min), ICP (2h), Campaign (1h), App State (24h)

## 🎯 Key Features

### ICP Generation

- 140+ template library with intelligent selection
- Single-call generation for efficiency
- Complete profiles with fit scoring (0-100)
- ABM tiering (Tier 1: 80+, Tier 2: 60-79, Tier 3: <60)

### Campaign Generation

- Multi-platform support (Google Ads, LinkedIn, Email, Print, Social)
- 5 copy styles (Facts, Humour, Smart, Emotional, Professional)
- Context-aware generation using ICP + Company data
- Complete campaign output (ad copy, CTAs, landing page, image suggestions)

### Technical Excellence

- **Type-safe API** with tRPC and auto-generated Prisma types
- **Database Migrations** with version control and rollback support
- **Performance Optimization** with Redis caching and query optimization
- **Developer Experience** with Prisma Studio and comprehensive tooling
- **Error Prevention** with compile-time type checking

## 🐳 Docker Architecture

```yaml
services:
  postgres: PostgreSQL 15 database with Prisma migrations
  redis: Redis 7 cache for performance optimization
  app: Next.js application with Prisma client and tRPC
```

## 🔒 Security & Performance

### Security

- **Input Validation** with Zod schemas and Prisma type validation
- **Environment-based Configuration** with secure environment variables
- **Database Security** with Prisma's built-in SQL injection prevention
- **Type Safety** preventing runtime errors and data corruption

### Performance Optimization

- **Database Optimization** with Prisma query optimization and connection pooling
- **Redis Caching** with intelligent invalidation and TTL management
- **Type-safe Queries** with compile-time optimization
- **Efficient Data Loading** with Prisma includes and selective field loading

## 📖 Documentation

- **[README.md](README.md)** - Setup and usage guide with Prisma instructions
- **[PRISMA_MIGRATION.md](PRISMA_MIGRATION.md)** - Migration guide from raw SQL to Prisma
- **[SETUP_PRISMA.md](SETUP_PRISMA.md)** - Complete Prisma setup guide
- **[AI_Workflow.md](AI_Workflow.md)** - Detailed AI system documentation

## 🎯 Development Workflow

### Database Development

```bash
# Generate Prisma client after schema changes
npm run db:generate

# Push schema changes to development database
npm run db:push

# Create and apply migrations
npm run db:migrate

# Open Prisma Studio for data management
npm run db:studio

# Reset database with fresh schema
npm run db:reset
```

### Type Safety Workflow

1. **Schema First**: Define models in `prisma/schema.prisma`
2. **Generate Types**: Run `npm run db:generate` to create TypeScript types
3. **Use Types**: Import and use auto-generated types in services and components
4. **Validate**: TypeScript compiler ensures type safety across the stack

---

This modern architecture leverages Prisma ORM for type-safe database operations, ensuring robust and maintainable code with excellent developer experience.
