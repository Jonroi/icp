# ICP Builder - Architecture Documentation

## 🏗️ System Overview

ICP Builder is a Next.js (App Router) application that generates comprehensive Ideal Customer Profiles (ICPs) from company data using a local LLM (Ollama). The system features an intelligent template selection system with 140+ ICP variations and generates detailed, actionable business insights using efficient single-call generation approach.

## 📁 Project Structure

```text
app/
├── api/
│   └── trpc/
│       └── [trpc]/
│           └── route.ts    # tRPC API handler
├── globals.css
├── layout.tsx
└── page.tsx
src/
├── components/          # React components
│   ├── agents/         # ICP rules and schema definitions
│   ├── ui/             # Reusable UI components
│   ├── layout/         # Layout components
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
User Input → UI Components → useAppState → tRPC → Services → PostgreSQL
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
- `icp-generator.ts`: Efficient ICP generation with single-call approach
- `ai-service.ts`: Orchestrator for ICP generation workflow

### ICP Generation Process

1. **Business Model Detection**: Analyzes company data to determine B2B/B2C/B2B2C
2. **Template Selection**: LLM selects 3 best-fitting ICP types from 140+ variations
3. **Single-Call Profile Generation**: Creates complete ICP profiles using one comprehensive LLM call per ICP:
   - Customer segments
   - Pain points and challenges
   - Jobs to be done
   - Desired outcomes
   - Buying triggers
   - Common objections
   - Value proposition
   - Unique features
   - Competitive advantages
   - Go-to-market channels
   - Key messages
   - Content ideas
4. **Data Assembly**: Combines all components into structured ICP object
5. **Data Persistence**: Stores generated ICPs in PostgreSQL with company association

### Technical Implementation Details

#### Single-Call Generation Benefits

- **Efficiency**: One LLM call per ICP instead of 12+ separate calls
- **Speed**: 30-60 seconds per ICP instead of 2-3 minutes
- **Reliability**: Simpler parsing with fallback values
- **Cost Effective**: Reduced LLM processing overhead
- **Better UX**: Faster response times for users

#### Error Handling Strategy

- **Fallback Values**: Default values for all ICP components
- **Robust Parsing**: Simple text-based parsing with error recovery
- **User Feedback**: Clear error messages and loading states
- **Graceful Degradation**: Complete ICPs even with parsing issues

### ICP Template Library

**140+ ICP Templates Organized by Category:**

- **B2B (70 templates)**: Startup Companies, SMB, Mid-Market, Enterprise, Industry-Specific
- **B2C (70 templates)**: Demographics, Lifestyle, Behavioral, Specialized Segments
- **B2B2C (25 templates)**: Platform Partners, Hybrid Businesses

## 🐳 Docker Architecture

### Containerized Services

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: icp_builder
      POSTGRES_USER: icp_user
      POSTGRES_PASSWORD: your_secure_password_here
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data

  ollama:
    image: ollama/ollama:latest
    ports:
      - '11434:11434'
    volumes:
      - ollama_data:/root/.ollama
```

### Docker Benefits

- **Self-Contained**: All dependencies included
- **Easy Deployment**: One command setup
- **Consistent Environment**: Same setup across all machines
- **Isolated Services**: No conflicts with local installations
- **Persistent Data**: Database and model data preserved

## 📊 State Management

### App State Highlights

- `ownCompany` (UI state; persisted via tRPC)
- `activeCompanyId` (resolved via tRPC)
- `generatedICPs` (client cache; authoritative store in DB)
- `isLoading`, `error`

### State Management Flow

```text
Component Action → useAppState → tRPC → State Update → Component Re-render
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
```

### Communication Patterns

- **Props Down, Events Up**: Components receive data via props, emit events for actions
- **Centralized State**: All state managed in `useAppState`
- **Component Composition**: Reusable UI components in `ui/`

## 🔧 Service Layer

### Service Responsibilities

- **AI Services**: Handle ICP generation using local Ollama with single-call approach
- **Business Services**: Handle data persistence and company management
- **ICP Profiles Service**: Handle ICP storage and retrieval
- **Company Services**: Handle company CRUD operations

### Service Communication

```text
Components → useAppState → tRPC → Services → External APIs
```

## 🗄️ Data Persistence

PostgreSQL schema (`database/schema-v4.sql`) includes:

- `users` (seeded with `TEST_USER_ID`)
- `company_data` (key-value fields for form data)
- `companies` and `user_active_company` (active company selection)
- `icp_profiles` (JSONB profile storage with company association)

### Database Schema Highlights

```sql
-- Companies table for persistent company data
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  -- ... other company fields
);

-- ICP profiles with company association
CREATE TABLE icp_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  profile_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔒 Security & Performance

### Security Measures

- **Server-side DB access** only; client uses tRPC API routes
- **Local AI Processing**: All LLM processing happens locally with Ollama
- **No External API Calls**: No data sent to external AI services
- **Input Validation**: All user inputs are validated with Zod
- **Advisory-lock migrations** to avoid races
- **Env-configured connections**; SSL in production

### Performance Optimization

- **Single-Call Generation**: One LLM call per ICP for maximum efficiency
- **Redis Caching**: ICP-profiilit tallennetaan tietokantaan ja välimuistiin
- **Docker Optimization**: Optimized container configurations
- **Lazy Loading**: ICP:t ladataan vain tarvittaessa
- **Component Optimization**: React.memo for expensive components
- **State Optimization**: Selective updates and debouncing
- **Bundle Optimization**: Code splitting and tree shaking

## 🧪 Testing & Dev Tips

- Verify DB connectivity and seeded user (`TEST_USER_ID`)
- Ensure Ollama is running and model is pulled (`llama3.2:3b-instruct-q4_K_M`)
- Use tRPC endpoints to create/select active company before ICP generation
- Test ICP generation with comprehensive company data for best results
- Monitor LLM response times (~30-60 seconds per ICP profile)

## 🔄 Deployment

### Build Process

```text
Source Code → TypeScript/Next → next build → .next output
```

### Deployment Strategy

- **Next.js** deploy with provisioned PostgreSQL
- **Local AI**: Requires Ollama on the host with model pulled
- **Docker**: Complete containerized deployment
- **Environment Configuration**: Proper environment variables for database and AI settings

## 🎯 Architecture Principles

### Core Principles

1. **Separation of Concerns**: Components handle UI, services handle logic
2. **Single Responsibility**: Each component/service has one clear purpose
3. **Centralized State**: Single source of truth in `useAppState`
4. **Modular Design**: Easy to extend and maintain
5. **AI-First Design**: Comprehensive ICP generation with intelligent template selection
6. **Efficiency First**: Single-call generation for speed and reliability
7. **Containerization**: Docker-first approach for easy deployment

### Development Guidelines

- **TypeScript**: Strict typing throughout
- **Component Composition**: Reusable components
- **Error Handling**: Comprehensive error management with fallback values
- **Documentation**: Clear code comments and interfaces
- **English Content**: All generated content and data in English
- **Testing**: Robust error handling and edge case coverage

## 📋 Key Features

### ICP Generation

- **140+ Template Library**: Comprehensive ICP variations
- **Intelligent Selection**: AI-driven template selection based on 6 criteria
- **Single-Call Generation**: One comprehensive LLM call per ICP for efficiency
- **Business Intelligence**: Detailed insights for marketing, sales, and product teams
- **Fit Scoring**: 0-100 scoring with ABM tiering
- **Error Recovery**: Robust error handling and fallback mechanisms

### Company Management

- **Persistent Storage**: Company data stored in PostgreSQL
- **Active Company Selection**: Switch between companies to view different ICPs
- **Form Data Management**: Automatic saving and loading of company information
- **Real-time Updates**: UI updates automatically when company data changes

### User Experience

- **Fast Generation**: 30-60 seconds for 3 ICPs with single-call approach
- **Comprehensive Profiles**: Detailed ICPs with actionable insights
- **Management Interface**: View, manage, and delete generated ICPs
- **Loading States**: Clear feedback during ICP generation process
- **Error Feedback**: Informative error messages and recovery options

## 🔧 Technical Implementation Details

### LLM Integration

- **OllamaClient**: Singleton-pattern for LLM communication
- **Response Parsing**: Simple text-based parsing with fallback values
- **Error Handling**: Comprehensive error recovery and fallback mechanisms
- **Performance**: ~30-60 seconds per ICP profile generation

### Database Design

- **Normalized Schema**: Proper relationships between companies and ICPs
- **JSONB Storage**: Flexible storage for ICP profile data
- **Migrations**: Version-controlled database schema changes
- **Indexing**: Optimized queries for company and ICP retrieval

### API Design

- **tRPC Endpoints**: Type-safe API design with proper error handling
- **Error Responses**: Consistent error handling across all endpoints
- **Data Validation**: Input validation and sanitization with Zod
- **Caching**: Appropriate caching strategies for performance

### Docker Integration

- **Multi-Service Setup**: PostgreSQL, Redis, and Ollama containers
- **Persistent Volumes**: Data persistence across container restarts
- **Environment Configuration**: Proper environment variable management
- **Easy Deployment**: One-command setup and teardown

---

This architecture documentation provides a comprehensive overview of the ICP Builder system's design and implementation patterns, reflecting the current efficient single-call LLM generation and Docker-first deployment approach.
