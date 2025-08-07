# ICP Builder - Architecture Documentation

## 🏗️ System Overview

The ICP Builder is a React-based application that uses AI-powered analysis to generate Ideal Customer Profiles (ICPs) from real customer reviews and competitor data. The system is built with TypeScript, Vite, and uses Ollama for local LLM processing.

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components (shadcn/ui)
│   ├── layout/         # Layout components
│   ├── dialogs/        # Dialog components
│   ├── icp/            # ICP-related components
│   ├── campaign/       # Campaign components
│   ├── TestICPGeneration.tsx  # ICP generation testing
│   ├── TestChatGPT.tsx        # ChatGPT testing component
│   └── index.ts        # Component exports
├── services/           # Business logic and API services
│   ├── ai/             # AI services
│   │   ├── agents/     # AI agents
│   │   ├── types.ts    # TypeScript interfaces
│   │   ├── ollama-client.ts
│   │   ├── chatgpt-client.ts
│   │   ├── icp-generator.ts
│   │   ├── competitor-analyzer.ts
│   │   ├── review-analyzer.ts
│   │   ├── website-scraper.ts
│   │   ├── ai-service.ts
│   │   ├── index.ts    # AI services exports
│   │   └── README.md   # AI services documentation
│   ├── ai.ts           # AI service re-export
│   ├── company-search-service.ts
│   ├── project-service.ts
│   ├── reviews-service.ts
│   └── index.ts        # Service exports
├── hooks/              # Custom React hooks
│   └── useAppState.ts  # Centralized application state
├── utils/              # Utility functions
├── lib/                # Shared utilities
├── App.tsx             # Main application component
└── main.tsx            # Application entry point
```

## 🔄 Data Flow

### User Input Flow

```
User Input → Components → useAppState → AI Services → Ollama LLM → Results
```

### Component Communication

```
App.tsx
├── Header (Project management)
├── Tabs
│   ├── ICPGenerator (Main functionality)
│   ├── ICPProfiles (Results display + TestICPGeneration)
│   ├── CampaignDesigner (Campaign generation)
│   └── CampaignLibrary (Campaign storage)
└── Dialogs (Save/Load projects)
```

## 🧠 AI Service Architecture

### Core Services

#### **ollama-client.ts**

- Handles communication with Ollama LLM
- API calls to local Ollama instance
- Response parsing and validation

#### **chatgpt-client.ts**

- Handles communication with ChatGPT API
- Alternative AI service for testing
- Response parsing and validation

#### **icp-generator.ts**

- Main ICP generation logic
- Prompt engineering for ICP generation
- Response parsing and validation

#### **competitor-analyzer.ts**

- Analyzes competitor websites and data
- Website content extraction
- Market positioning analysis

#### **review-analyzer.ts**

- Processes customer reviews
- Review sentiment analysis
- Demographic data extraction

#### **ai-service.ts**

- Main orchestrator for AI operations
- Service coordination and error handling

### Service Dependencies

```
ai-service.ts (Orchestrator)
├── ollama-client.ts (LLM Communication)
├── chatgpt-client.ts (ChatGPT Communication)
├── icp-generator.ts (ICP Generation)
├── competitor-analyzer.ts (Competitor Analysis)
├── review-analyzer.ts (Review Processing)
└── website-scraper.ts (Content Extraction)
```

## 📊 State Management

### Global State Structure

```typescript
interface AppState {
  // Competitor Management
  competitors: Competitor[];
  savedCompetitors: Competitor[];
  showCompetitorDropdown: boolean;

  // Context and Input
  additionalContext: string;

  // AI Processing State
  isLoading: boolean;
  error: string | null;

  // Company Information
  isFetchingCompanyInfo: boolean;
  companyInfoStatus: string;

  // Reviews Processing
  isFetchingReviews: boolean;
  reviewsStatus: string;

  // Generated Results
  generatedICPs: ICP[];
  generatedCampaign: Campaign | null;

  // Project Management
  projectName: string;
  savedProjects: Project[];
  showSaveDialog: boolean;
  showLoadDialog: boolean;

  // UI State
  showICPPopup: boolean;
}
```

### State Management Flow

```
Component Action → useAppState → State Update → Component Re-render
```

## 🎨 Component Architecture

### Component Hierarchy

```
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
└── TestChatGPT (Standalone)
```

### Communication Patterns

- **Props Down, Events Up**: Components receive data via props, emit events for actions
- **Centralized State**: All state managed in `useAppState`
- **Component Composition**: Reusable UI components in `ui/`

## 🔧 Service Layer

### Service Responsibilities

- **AI Services**: Handle all AI-related operations (Ollama + ChatGPT)
- **Business Services**: Handle data persistence and external APIs
- **Project Service**: Handle project data persistence
- **Reviews Service**: Handle review processing
- **Company Search Service**: Handle company information retrieval

### Service Communication

```
Components → useAppState → Services → External APIs
```

## 🗄️ Data Persistence

### Local Storage Strategy

- **Project Data**: Browser localStorage
- **Competitor Data**: Browser localStorage
- **Generated ICPs**: Application state (memory)

## 🔒 Security & Performance

### Security Measures

- **Input Validation**: TypeScript interfaces and runtime validation
- **Error Handling**: Graceful degradation and user feedback
- **Data Protection**: Local storage only, no external data storage

### Performance Optimization

- **Component Optimization**: React.memo for expensive components
- **State Optimization**: Selective updates and debouncing
- **Bundle Optimization**: Code splitting and tree shaking

## 🧪 Testing Strategy

### Testing Approach

- **Component Testing**: Unit tests for individual components
- **Service Testing**: Mock services for external dependencies
- **AI Testing**: Response validation and error scenarios
- **Test Components**: TestICPGeneration and TestChatGPT for AI testing

## 🔄 Deployment

### Build Process

```
Source Code → TypeScript Compilation → Vite Build → Static Assets
```

### Deployment Strategy

- **Static Hosting**: Vercel, Netlify, or similar
- **Local AI**: User's local Ollama instance
- **Environment**: Environment variables for configuration

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
