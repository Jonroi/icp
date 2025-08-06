# Project Architecture

This document describes the improved architecture of the ICP & Campaign Insights application.

## Directory Structure

```bash
src/
├── components/
│   ├── layout/           # Layout components
│   │   └── Header.tsx
│   ├── dialogs/          # Modal and dialog components
│   │   ├── SaveProjectDialog.tsx
│   │   ├── LoadProjectDialog.tsx
│   │   └── ICPPopup.tsx
│   ├── icp/             # ICP-related components
│   │   ├── ICPGenerator.tsx
│   │   ├── ICPProfiles.tsx
│   │   └── CompetitorForm.tsx
│   ├── campaign/         # Campaign-related components
│   │   ├── CampaignDesigner.tsx
│   │   └── CampaignLibrary.tsx
│   ├── ui/              # Reusable UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── ...
│   └── index.ts         # Component exports
├── services/            # Business logic and API calls
│   ├── project-service.ts
│   ├── company-search-service.ts
│   ├── reviews-service.ts
│   ├── ai.ts
│   ├── google-reviews.ts
│   └── index.ts
├── hooks/              # Custom React hooks
│   ├── useAppState.ts
│   └── useAI.ts
└── App.tsx            # Main application component
```

## Component Architecture

### Layout Components

- **Header**: Main application header with save/load project buttons

### Dialog Components

- **SaveProjectDialog**: Modal for saving projects
- **LoadProjectDialog**: Modal for loading saved projects
- **ICPPopup**: Information popup about ICPs

### ICP Components

- **ICPGenerator**: Main ICP generation interface
- **ICPProfiles**: Display generated ICP profiles
- **CompetitorForm**: Individual competitor form with search functionality

### Campaign Components

- **CampaignDesigner**: Campaign generation interface
- **CampaignLibrary**: Pre-built campaign examples

## Service Layer

### ProjectService

Handles project and competitor data persistence using localStorage:

- Save/load projects
- Save/load competitors
- List saved projects and competitors

### CompanySearchService

Handles company information search using LLM:

- Search for company websites and LinkedIn profiles
- Fallback URL generation
- Confidence scoring

### ReviewsService

Handles customer review generation:

- Generate realistic customer reviews using LLM
- Review formatting and processing

## State Management

### useAppState Hook

Centralized state management hook that:

- Manages all application state
- Handles all business logic
- Provides actions to components
- Integrates with AI services

## Key Improvements

1. **Separation of Concerns**: Each component has a single responsibility
2. **Reusability**: Components are modular and can be reused
3. **Maintainability**: Clear structure makes code easier to maintain
4. **Testability**: Isolated components are easier to test
5. **Scalability**: New features can be added without affecting existing code

## Usage

### Importing Components

```typescript
import { Header, ICPGenerator, CampaignDesigner } from '@/components';
```

### Importing Services

```typescript
import { ProjectService, CompanySearchService } from '@/services';
```

### Using the App State Hook

```typescript
import { useAppState } from '@/hooks/useAppState';

function MyComponent() {
  const { competitors, addCompetitor, generateICPs } = useAppState();
  // ...
}
```

## Benefits of the New Architecture

1. **Clean App.tsx**: The main App component is now only 100 lines instead of 1400+
2. **Modular Components**: Each component handles its own specific functionality
3. **Service Layer**: Business logic is separated from UI components
4. **Type Safety**: Better TypeScript support with proper interfaces
5. **Easier Testing**: Components can be tested in isolation
6. **Better Developer Experience**: Clear file structure and naming conventions
