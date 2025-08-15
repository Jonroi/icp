# ICP Builder - Architecture Documentation

## 🏗️ System Overview

ICP Builder is a Next.js (App Router) application that generates comprehensive Ideal Customer Profiles (ICPs) from company data using a local LLM (Ollama). The system features an intelligent template selection system with 140+ ICP variations and generates detailed, actionable business insights.

## 📁 Project Structure

```text
app/
├── api/
│   ├── company/        # Company CRUD operations and active selection
│   ├── company-data/   # Company form data storage (key-value)
│   └── icp/            # ICP generation and management endpoints
src/
├── components/          # React components
│   ├── agents/         # ICP rules and schema definitions
│   ├── ui/             # Reusable UI components
│   ├── layout/         # Layout components
│   ├── dialogs/        # Dialog components
│   ├── icp/            # ICP-related components
│   ├── campaign/       # Campaign components
│   └── index.ts        # Component exports
├── services/           # Business logic and DB services
│   ├── ai/             # AI services (Ollama client, ICP generator)
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
│   ├── ICPGenerator (company form + generate ICPs)
│   ├── ICPProfiles (view/manage ICPs for selected company)
│   ├── CampaignDesigner
│   └── CampaignLibrary
```

## 🧠 AI Service Architecture

### AI Services

- `ollama-client.ts`: HTTP client to local Ollama (`/api/generate`)
- `icp-generator.ts`: Comprehensive ICP generation with 140+ template library
- `ai-service.ts`: Orchestrator for ICP generation workflow

### ICP Generation Process

1. **Business Model Detection**: Analyzes company data to determine B2B/B2C/B2B2C
2. **Template Selection**: LLM selects 3 best-fitting ICP types from 140+ variations
3. **Profile Generation**: Creates detailed ICP profiles with comprehensive business insights
4. **Data Persistence**: Stores generated ICPs in PostgreSQL with company association

### ICP Template Library

**140+ ICP Templates Organized by Category:**

- **B2B (70 templates)**: Startup Companies, SMB, Mid-Market, Enterprise, Industry-Specific
- **B2C (70 templates)**: Demographics, Lifestyle, Behavioral, Specialized Segments
- **B2B2C (25 templates)**: Platform Partners, Hybrid Businesses

## 📊 State Management

### App State Highlights

- `ownCompany` (UI state; persisted via `/api/company-data`)
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
│   ├── CampaignDesigner
│   └── CampaignLibrary
├── Dialogs
│   ├── SaveProjectDialog
│   ├── LoadProjectDialog
│   └── ICPPopup
```

### Communication Patterns

- **Props Down, Events Up**: Components receive data via props, emit events for actions
- **Centralized State**: All state managed in `useAppState`
- **Component Composition**: Reusable UI components in `ui/`

## 🔧 Service Layer

### Service Responsibilities

- **AI Services**: Handle ICP generation using local Ollama
- **Business Services**: Handle data persistence and company management
- **ICP Profiles Service**: Handle ICP storage and retrieval
- **Company Services**: Handle company CRUD operations

### Service Communication

```text
Components → useAppState → Services → External APIs
```

## 🗄️ Data Persistence

PostgreSQL schema (`database/schema.sql`) includes:

- `users` (seeded with `TEST_USER_ID`)
- `company_data` (key-value fields for form data)
- `companies` and `user_active_company` (active company selection)
- `icp_profiles` (JSONB profile storage with company association)

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
- Ensure Ollama is running and model is pulled (`llama3.2:3b-instruct-q4_K_M`)
- Use `/api/company` to create/select active company before ICP generation
- Test ICP generation with comprehensive company data for best results

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
5. **AI-First Design**: Comprehensive ICP generation with intelligent template selection

### Development Guidelines

- **TypeScript**: Strict typing throughout
- **Component Composition**: Reusable components
- **Error Handling**: Graceful error management
- **Documentation**: Clear code comments and interfaces
- **English Content**: All generated content and data in English

## 📋 Key Features

### ICP Generation

- **140+ Template Library**: Comprehensive ICP variations
- **Intelligent Selection**: AI-driven template selection based on 6 criteria
- **Business Intelligence**: Detailed insights for marketing, sales, and product teams
- **Fit Scoring**: 0-100 scoring with ABM tiering

### Company Management

- **Persistent Storage**: Company data stored in PostgreSQL
- **Active Company Selection**: Switch between companies to view different ICPs
- **Form Data Management**: Automatic saving and loading of company information

### User Experience

- **Real-time Generation**: Immediate ICP generation with local LLM
- **Comprehensive Profiles**: Detailed ICPs with actionable insights
- **Management Interface**: View, manage, and delete generated ICPs

---

This architecture documentation provides a comprehensive overview of the ICP Builder system's design and implementation patterns, reflecting the current enhanced capabilities and intelligent ICP generation system.
