# ICP Builder - AI-Powered Customer Profile Generator

Generate comprehensive Ideal Customer Profiles (ICPs) from your company data using a local LLM (Ollama) and store results in PostgreSQL.

## 🚀 Features

- **Advanced ICP Generation**: Generate detailed Ideal Customer Profiles with comprehensive business insights
- **140+ ICP Template Library**: AI selects 3 best-fitting ICP types from dozens of variations
- **Multi-Segment ICPs**: Automatically creates B2B, B2C, and B2B2C profiles based on company data analysis
- **Intelligent Template Selection**: LLM analyzes company data and selects most relevant ICP templates
- **Comprehensive Business Intelligence**: Includes buying triggers, objections, pain points, go-to-market strategies, and fit scoring
- **Company Management**: Create/select companies with persistent storage in PostgreSQL
- **ICP Profiles Library**: View and manage ICPs per company with delete functionality
- **Local AI Processing**: Uses Ollama model locally; no external LLM calls

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

1. **Fill Company Details**: Enter your company information in the ICP Generator tab
2. **Save Company Data**: Company data is automatically saved to the database
3. **Generate ICPs**: Click "Generate ICP" to trigger AI analysis
4. **AI Analysis Process**:
   - Determines business model (B2B/B2C/B2B2C)
   - Analyzes company data against 140+ ICP templates
   - Selects 3 best-fitting ICP types using 6 criteria:
     - Industry Alignment
     - Company Size Fit
     - Target Market Match
     - Value Proposition Alignment
     - Business Model Compatibility
     - Market Segment Relevance
5. **Comprehensive ICP Profiles**: Each ICP includes:
   - Fit definition (industries, company sizes, buyer personas)
   - Needs/pain/goals analysis
   - Buying triggers and common objections
   - Value proposition alignment
   - Go-to-market strategy
   - Fit scoring (0-100) with ABM tiering
6. **View Results**: Switch to ICP Profiles tab to view generated profiles

## 🏗️ Project Structure

```text
app/
├── api/
│   ├── company/        # Company CRUD operations
│   ├── company-data/   # Company form data storage
│   └── icp/            # ICP generation & management
src/
├── components/
│   ├── agents/         # ICP rules and schema definitions
│   ├── icp/            # ICP Generator and Profiles UI
│   ├── campaign/       # Campaign designer & library
│   ├── dialogs/        # Modal dialogs
│   ├── layout/         # Header and layout
│   └── ui/             # Reusable UI components
├── hooks/
│   └── useAppState.ts  # Centralized application state
├── services/
│   ├── ai/             # AI services (ICP generator, Ollama client)
│   ├── companies-service.ts
│   ├── company-data-service.ts
│   ├── icp-profiles-service.ts
│   └── project-service.ts
└── App.tsx             # Main application component
```

## 🎯 Key Components

- **ICPGenerator**: Company input form and ICP generation trigger
- **ICPProfiles**: Displays and manages ICPs for selected company
- **CompanySelector**: Dropdown for company selection and creation
- **CampaignDesigner/CampaignLibrary**: Campaign tooling (UI)

## 🤖 AI Processing

- **Local LLM**: Uses Ollama with `llama3.2:3b-instruct-q4_K_M` model
- **ICP Generation**: Comprehensive analysis using 140+ ICP templates
- **Template Selection**: AI-driven selection of 3 best-fitting ICP types
- **Business Intelligence**: Generates actionable insights for marketing, sales, and product teams

## 🔧 API Endpoints

- `/api/company`
  - `GET` → List companies and current active company
  - `GET?id=...` → Select active company and load data
  - `POST` → Create a new company
  - `PATCH` → Update company or set as active
- `/api/company-data`
  - `GET` → Current company form data
  - `POST` → Save form field data
  - `DELETE` → Reset form data
- `/api/icp`
  - `POST` → Generate ICPs for active company
  - `GET?companyId=...` → List ICPs for a company
  - `DELETE?id=...` → Delete specific ICP
  - `DELETE?companyId=...` → Delete all ICPs for a company

## 📋 ICP Template Categories

### B2B Templates (70 variations)

- **Startup Companies** (20): Tech Startup, SaaS Startup, AI Startup, etc.
- **Small-Medium Businesses** (20): SMB Optimizer, E-commerce SMB, etc.
- **Mid-Market Companies** (15): Mid-Market Scale, Mid-Market Digital, etc.
- **Enterprise Companies** (20): Enterprise Transformer, Enterprise Security, etc.
- **Industry-Specific** (25): Healthcare, Financial Services, Manufacturing, etc.

### B2C Templates (70 variations)

- **Demographic Segments** (15): Young Professional, Millennial, Gen Z, etc.
- **Lifestyle Segments** (20): Tech Enthusiast, Fitness Enthusiast, etc.
- **Behavioral Segments** (20): Online Shopper, Early Adopter, etc.
- **Specialized Segments** (15): Environmental Conscious, Luxury Consumer, etc.

### B2B2C Templates (25 variations)

- **Platform Partners** (10): Marketplace Seller, Platform Partner, etc.
- **Hybrid Businesses** (15): Small Retailer, Consultant, Freelancer, etc.

## 💡 Usage Tips

- Fill in comprehensive company details for better ICP generation
- ICPs are tied to specific companies - switch companies to view different results
- Use the ICP Profiles tab to manage and delete generated profiles
- Generated ICPs provide actionable insights for marketing and sales teams

## 🔧 Tech Stack

- **Frontend**: Next.js (App Router) + React + TypeScript + Tailwind CSS
- **AI**: Local Ollama via custom client
- **Database**: PostgreSQL with automatic migrations
- **State Management**: Centralized React hooks

## 📝 License

MIT License
