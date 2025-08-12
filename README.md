# ICP Builder - AI-Powered Customer Profile Generator

A streamlined tool for generating Ideal Customer Profiles (ICPs) using AI analysis of your company data.

## 🚀 Features

- **AI-Powered ICP Generation**: Create detailed customer profiles based on your company information
- **Smart Company Data Collection**: Comprehensive form with dropdown selectors and AI assistant
- **Interactive AI Chatbot**: Get help filling out company information with intelligent suggestions
- **ICP Profiles Display**: View and analyze AI-generated customer profiles
- **Local AI Processing**: Uses Ollama (llama3.2:3b) - no external API costs!

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
2. **Download Model**: `ollama pull llama3.2:3b`
3. **Start Ollama**: It should start automatically

## 📊 How It Works

### 1. Company Information

- Fill out your company details (name, industry, target market, etc.)
- Use the **"Fill with AI"** button for guided assistance
- Save your company information for reuse

### 2. ICP Generation

- Click **"Generate ICPs"** to create customer profiles
- AI analyzes your company data to generate 3 detailed ICPs
- Each profile includes demographics, psychographics, and marketing channels

### 3. View Results

- Switch to **"ICP Profiles"** tab to see generated profiles
- Each profile shows detailed customer characteristics
- Use profiles for marketing campaigns and targeting

## 🏗️ Project Structure

```
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

- **OwnCompanyForm**: Company information input with AI assistant
- **ICPGenerator**: Main interface for generating customer profiles
- **ICPProfiles**: Display generated customer profiles
- **ChatPanel**: AI chatbot for guided assistance

## 🤖 AI Assistant

The **"Fill with AI"** button opens a professional chatbot that helps you:

- Understand what information to provide
- Get suggestions for industry selection
- Learn how to describe your target market
- Receive guidance on value propositions
- Get help with marketing channels

## 💡 Usage Tips

1. **Start with Company Name**: Required field for ICP generation
2. **Use AI Assistant**: Click "Fill with AI" for guided help
3. **Be Specific**: Detailed company information = better ICPs
4. **Save Your Data**: Company information is saved locally
5. **Review Profiles**: Check the ICP Profiles tab for results

## 🔧 Technical Details

- **Frontend**: React + TypeScript + Tailwind CSS
- **AI**: Local Ollama with llama3.2:3b model
- **Storage**: Browser localStorage
- **No External APIs**: Everything runs locally

## 📝 License

MIT License - feel free to use and modify!
