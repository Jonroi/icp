# ICP Builder - Architecture Documentation

## 🏗️ System Overview

ICP Builder is a Next.js (App Router) application that generates Ideal Customer Profiles (ICPs) from company data and optional reviews using a local LLM (Ollama). Data is persisted in PostgreSQL.

## 📁 Project Structure

```text
app/
├── api/
│   ├── company/        # Company CRUD + active selection + mirroring to company_data
│   ├── company-data/   # Key-value store for the working form data
│   ├── icp/            # ICP generation & retrieval endpoints
│   └── (readability removed)
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── layout/         # Layout components
│   ├── dialogs/        # Dialog components
│   ├── icp/            # ICP-related components
│   ├── campaign/       # Campaign components
│   └── index.ts        # Component exports
├── services/           # Business logic and DB services
│   ├── ai/             # AI services (Ollama client, ICP generation, review analysis)
│   ├── companies-service.ts
│   ├── company-data-service.ts
│   ├── icp-profiles-service.ts
│   └── index.ts        # Service exports
├── hooks/              # Custom React hooks
│   └── useAppState.ts  # Centralized application state
├── lib/                # Shared utilities
└── App.tsx             # Main application component used by app/page.tsx
```

## 🔄 Data Flow

```text
User Input → UI Components → useAppState → REST APIs → Services → PostgreSQL
                                    ↘︎ AIService → Ollama → ICPs → DB
```

### Component Communication

```typescript
App.tsx
├── Header
├── Tabs
│   ├── ICPGenerator (company form + save + generate)
│   ├── ICPProfiles (lists ICPs for active company)
│   ├── CampaignDesigner
│   └── CampaignLibrary
```

## 🧠 AI Service Architecture

### AI Services

- `ollama-client.ts`: HTTP client to local Ollama (`/api/generate`), optional system prompts
- `review-analyzer.ts`: Lightweight NLP for reviews (keywords/heuristics)
- `icp-generator.ts`: Instruction Framework flow to select attributes and synthesize profiles
- `ai-service.ts`: Thin orchestrator exposing scrape/analyze/generate methods

## 📊 State Management

### App State Highlights

- `ownCompany` (UI state; persisted via `/api/company-data` and mirrored to `companies` when active)
- `activeCompanyId` (resolved via `/api/company`)
- `generatedICPs` (client cache; authoritative store in DB)
- `isLoading`, `error`

### State Management Flow

```text
Component Action → useAppState → State Update → Component Re-render
```

## 🎨 Component Architecture

### Component Hierarchy

```text
App.tsx
├── Header
├── Tabs
│   ├── ICPGenerator
│   ├── ICPProfiles
│   │   └── TestICPGeneration
│   ├── CampaignDesigner
│   └── CampaignLibrary
├── Dialogs
│   ├── SaveProjectDialog
│   ├── LoadProjectDialog
│   └── ICPPopup
└── (chat assistant removed)
```

### Communication Patterns

- **Props Down, Events Up**: Components receive data via props, emit events for actions
- **Centralized State**: All state managed in `useAppState`
- **Component Composition**: Reusable UI components in `ui/`

## 🔧 Service Layer

### Service Responsibilities

- **AI Services**: Handle AI-related operations (Ollama only)
- **Business Services**: Handle data persistence and external APIs
- **Project Service**: Handle project data persistence
- **Reviews Service**: Handle review processing
- **Company Search Service**: Handle company information retrieval

### Service Communication

```text
Components → useAppState → Services → External APIs
```

## 🗄️ Data Persistence

PostgreSQL schema (`database/schema.sql`) includes:

- `users` (seeded with `TEST_USER_ID`)
- `company_data` (key-value fields, progress helpers)
- `companies` and `user_active_company` (active selection)
- `icp_profiles` (JSONB profile storage)
- `campaigns` (future)

## 🔒 Security & Performance

### Security Measures

- **Server-side DB access** only; client uses API routes
- **Advisory-lock migrations** to avoid races
- **Env-configured connections**; SSL in production

### Performance Optimization

- **Component Optimization**: React.memo for expensive components
- **State Optimization**: Selective updates and debouncing
- **Bundle Optimization**: Code splitting and tree shaking

## 🧪 Testing & Dev Tips

- Verify DB connectivity and seeded user (`TEST_USER_ID`)
- Ensure Ollama is running and model is pulled
- Use `/api/company` to create/select active company before ICP generation

## 🔄 Deployment

### Build Process

```text
Source Code → TypeScript/Next → next build → .next output
```

### Deployment Strategy

- **Next.js** deploy with provisioned PostgreSQL
- **Local AI**: Requires Ollama on the host with model pulled

## 🎯 Architecture Principles

### Core Principles

1. **Separation of Concerns**: Components handle UI, services handle logic
2. **Single Responsibility**: Each component/service has one clear purpose
3. **Centralized State**: Single source of truth in `useAppState`
4. **Modular Design**: Easy to extend and maintain

### Development Guidelines

- **TypeScript**: Strict typing throughout
- **Component Composition**: Reusable components
- **Error Handling**: Graceful error management
- **Documentation**: Clear code comments and interfaces

---

This architecture documentation provides a focused overview of the ICP Builder system's design and implementation patterns, suitable for the project's current scope and complexity.
