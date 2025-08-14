# ICP Builder - AI-Powered Customer Profile Generator

A streamlined tool for generating Ideal Customer Profiles (ICPs) using your company data.

## 🚀 Features

- **AI-Powered ICP Generation**: Create detailed customer profiles from structured inputs
- **Smart Company Data Collection**: Comprehensive form with dropdown selectors
- **ICP Profiles Display**: View and manage generated customer profiles
- **Campaign Tools**: Plan and organize marketing campaigns based on ICPs
- **Local AI Processing**: Uses Ollama (llama3.2:3b) for on-device generation

## 🏃‍♂️ Quick Start

### Prerequisites

- Node.js 18+
- Ollama installed locally

### Installation

```bash
git clone <repository-url>
cd icp
npm install
npm run dev
```

### AI Setup

1. **Install Ollama**: Download from [ollama.ai](https://ollama.ai)
2. **Download Model**: `ollama pull llama3.2:3b-instruct-q4_K_M`
3. **Start Ollama**: It should start automatically
4. **Environment**: Create `.env.local`

```text
OPENAI_BASE_URL=http://localhost:11434/v1
OPENAI_API_KEY=ollama
OLLAMA_MODEL=llama3.2:3b-instruct-q4_K_M
```

## 📊 How It Works

### 1. Company Information

- Fill out your company details (name, industry, target market, etc.)
- Save your company information for reuse

### 2. ICP Generation

- Click **"Generate ICPs"** to create customer profiles
- The app analyzes your inputs to generate detailed ICPs
- Each profile includes demographics, psychographics, and marketing channels

### 3. View Results

- Switch to **"ICP Profiles"** tab to see generated profiles
- Each profile shows detailed customer characteristics
- Use profiles for marketing campaigns and targeting

### 4. Create Campaigns

- Use **"Campaign Designer"** to outline targeted campaigns
- Browse ideas in **"Campaign Library"**

## 🏗️ Project Structure

```text
src/
├── components/
│   ├── ui/              # UI components (buttons, inputs, etc.)
│   ├── icp/             # ICP generation components
│   ├── campaign/        # Campaign tools
│   └── layout/          # Header and layout
├── services/
│   └── ai/              # AI services and Ollama client
├── hooks/
│   └── useAppState.ts   # Application state management
└── App.tsx              # Main application
```

## 🎯 Key Components

- **OwnCompanyForm**: Company information input
- **ICPGenerator**: Main interface for generating customer profiles
- **ICPProfiles**: Display generated customer profiles
- **CampaignDesigner**: Create marketing campaigns
- **CampaignLibrary**: Browse campaign ideas

## 🤖 AI Processing

- Local-only generation using Ollama
- No chat interface or assistant tools (reset to zero)

## 💡 Usage Tips

1. **Be Specific**: Detailed company information = better ICPs
2. **Save Your Data**: Company information is saved locally
3. **Review Profiles**: Check the ICP Profiles tab for results
4. **Create Campaigns**: Use the campaign tools to act on your ICPs

## 🔧 Technical Details

- **Frontend**: React + TypeScript + Tailwind CSS
- **AI**: Local Ollama via OpenAI-compatible endpoint
- **Storage**: PostgreSQL (local)
- **No External APIs**: Everything runs locally
- **Modular Design**: Easy to extend

### Database

Create `.env.local`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=icp_builder
DB_USER=icp_user
DB_PASSWORD=your_password
DB_SSL=false
```

Initialize DB (first run is automatic on server start; schema is in `database/schema.sql`).

## 📝 License

MIT License - feel free to use and modify!
