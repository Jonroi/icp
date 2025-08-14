# ICP Builder - AI-Powered Customer Profile Generator

Generate Ideal Customer Profiles (ICPs) from your company data using a local LLM (Ollama) and store results in PostgreSQL.

## 🚀 Features

- **AI-Powered ICP Generation**: Create structured ICPs from your company context and reviews
- **Company Management (DB-backed)**: Create/select active company and mirror fields into a working form store
- **Company Data API**: Centralized `company_data` key-value store with completion progress
- **ICP Profiles Library**: Persisted per company in PostgreSQL (`icp_profiles` table)
- **Campaign Tools**: Draft campaigns from ICPs (UI only)
- **Local AI**: Uses Ollama model locally; no external LLM calls

## 🏃‍♂️ Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Ollama installed locally

### Installation

```bash
git clone <repository-url>
cd icp
npm install
npm run dev
```

### Environment

Create `.env.local` (adjust values as needed):

```env
# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=icp_builder
DB_USER=icp_user
DB_PASSWORD=your_password
DB_SSL=false

# Logical user used by the app (seeded in schema.sql)
TEST_USER_ID=11111111-1111-1111-1111-111111111111

# Ollama (server-side)
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b-instruct-q4_K_M

# Ollama (browser usage where needed)
NEXT_PUBLIC_OLLAMA_URL=http://localhost:11434
NEXT_PUBLIC_OLLAMA_MODEL=llama3.2:3b-instruct-q4_K_M
```

### AI Setup

1. Install Ollama from `https://ollama.ai`
2. Pull the model: `ollama pull llama3.2:3b-instruct-q4_K_M`
3. Ensure Ollama is running (`ollama serve`)

### Database Setup

The app will run migrations automatically on first DB access using `database/schema.sql`.

Alternatively, you can run it manually:

```bash
psql -h localhost -U icp_user -d icp_builder -f database/schema.sql
```

## 📊 How It Works

1. Fill in your company details and save
2. Optionally select/create an active company (stored in `companies` and `user_active_company`)
3. Generate ICPs; results are stored in `icp_profiles` under the active company
4. View ICPs in the ICP Profiles tab

## 🏗️ Project Structure

```text
app/
├── api/
│   ├── company/        # Company CRUD + active selection
│   ├── company-data/   # Centralized form store (key-value)
│   ├── icp/            # ICP generation & retrieval
│   └── (readability removed)
src/
├── components/
│   ├── icp/            # ICP UI (form, results)
│   ├── campaign/       # Campaign designer & library
│   ├── layout/         # Header and layout
│   └── ui/             # Reusable UI
├── hooks/
│   └── useAppState.ts  # Centralized app state
├── services/
│   ├── ai/             # Ollama client, ICP generator, review analyzer
│   └── (db + business) # company, company-data, icp-profiles
└── App.tsx             # Main application used by app/page.tsx
```

## 🎯 Key Components

- `ICPGenerator`: Company input and generation action
- `ICPProfiles`: Displays stored ICPs for the selected company
- `CampaignDesigner`, `CampaignLibrary`: Campaign tooling (UI)

## 🤖 AI Processing

- Local-only via `OllamaClient` (model default: `llama3.2:3b-instruct-q4_K_M`)
- The `AIService` coordinates scraping, review analysis, and ICP generation

## 🔧 API Endpoints

- `/api/company`
  - `GET` → Without params: list companies and current active
  - `GET?id=...` → Select active company and mirror fields to `company_data`
  - `POST` → Create a new company (name required)
  - `PATCH` → Update a company field; or `{ action: "select", id }` to set active
- `/api/company-data`
  - `GET` → Current keyed data + completion progress
  - `POST` → `{ field, value }` upsert a field for current user
  - `DELETE` → Reset all fields for current user
- `/api/icp`
  - `POST` → Generate ICPs for active/provided `companyId` and persist
  - `GET?companyId=...` → List persisted ICPs for a company
  - `DELETE?id=...` or `DELETE?companyId=...` → Delete one or all ICPs for a company
    (readability endpoint removed)

## 💡 Tips

- Save at least basic fields before generating
- ICPs are tied to the active company; switch companies to view different results

## 🔧 Tech Stack

- **Frontend**: Next.js (App Router) + React + TypeScript + Tailwind CSS
- **AI**: Local Ollama via custom client
- **DB**: PostgreSQL with automatic migrations (see `database/schema.sql`)

## 📝 License

MIT License
