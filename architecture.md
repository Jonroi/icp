# ICP Builder - Architecture Documentation

## 🏗️ System Overview

ICP Builder is a Next.js application that generates Ideal Customer Profiles (ICPs) and marketing campaigns using local AI (Ollama). Built with TypeScript, tRPC, PostgreSQL, and Redis.

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
│   ├── database/       # Database services
│   ├── cache/          # Redis caching
│   └── project/        # Project management
├── server/             # tRPC API routes
├── hooks/              # Custom React hooks
└── lib/                # Utilities
```

## 🔄 Data Flow

```text
User Input → UI Components → tRPC → Services → PostgreSQL
                                    ↘︎ AI Services → Ollama → Results
                                    ↗︎ Redis Cache ← Performance
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

## 🗄️ Database Schema

```sql
-- Core tables
companies (id, name, created_at)
icp_profiles (id, company_id, profile_data JSONB, created_at)
campaigns (id, icp_id, name, copy_style, media_type, ad_copy, cta, hooks, landing_page_copy, created_at)
company_data (key-value form data storage)
```

## 🔧 Key Services

### AI Services

- **Template Selection**: AI-driven selection from 140+ templates
- **ICP Generation**: Complete customer profiles with single LLM call
- **Campaign Generation**: Multi-platform campaigns with context awareness

### Database Services

- **Company Management**: CRUD operations and active company selection
- **ICP Profiles**: Generation results storage and retrieval
- **Campaign Management**: Campaign storage and library management

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

- Type-safe API with tRPC
- Local AI processing (no external APIs)
- Docker-first deployment
- Comprehensive error handling

## 🐳 Docker Architecture

```yaml
services:
  postgres: PostgreSQL 15 database
  redis: Redis 7 cache
  ollama: Local LLM server (llama3.2:3b-instruct-q4_K_M)
  app: Next.js application
```

## 🔒 Security & Performance

### Security

- Local AI processing (no data transmission)
- Input validation with Zod
- Environment-based configuration
- No external API dependencies

### Performance

- Single-call AI generation
- Redis caching with intelligent invalidation
- Optimized database queries
- Docker containerization

## 📖 Documentation

- **[README.md](README.md)** - Setup and usage guide
- **[AI_Workflow.md](AI_Workflow.md)** - Detailed AI system documentation

---

This simplified architecture focuses on the essential components and workflows that make ICP Builder work efficiently.
