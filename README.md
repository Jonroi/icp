# ICP Builder - AI-Powered Customer Profile Generator

A streamlined tool for generating Ideal Customer Profiles (ICPs) using AI analysis of your company data.

## 🚀 Features

- **AI-Powered ICP Generation**: Create detailed customer profiles based on your company information
- **Smart Company Data Collection**: Comprehensive form with dropdown selectors and AI assistant
- **Modular AI Assistant System**: Specialized AI helpers for different tasks with relevant prephrases
- **ICP Profiles Display**: View and analyze AI-generated customer profiles
- **Campaign Tools**: Create and research marketing campaigns based on ICPs
- **Local AI Processing**: Uses Ollama (llama3.2:3b) with LangChain + Vercel AI SDK streaming

## 🤖 AI Assistant System

The application uses **LangChain** for all AI operations, providing a robust and scalable AI assistant system with specialized tools and agents.

### **General Guide** (Default ChatPanel)

- **Purpose**: Explains ICPs and helps users get started
- **Role**: General information, workflow guidance, and navigation help
- **Access**: Available through the floating chat button
- **Interface**: Button-based interaction with no pretext messages

### **4 Specialized Tools**

#### **1. ICP Form Tool** (ICP Generator Tab)

- **Purpose**: Helps fill out company information for ICP generation
- **Focus**: Only relevant fields (no phone numbers, addresses, etc.)
- **Access**: "Fill with AI" button in the company form
- **Interface**: Direct button selection for form fields and options

#### **2. ICP Analysis Tool** (ICP Profiles Tab)

- **Purpose**: Analyzes generated customer profiles and demographics
- **Focus**: Interpreting ICP data and suggesting marketing strategies
- **Access**: AI assistant button in ICP Profiles tab
- **Interface**: Button-based analysis options

#### **3. Campaign Creation Tool** (Campaign Designer Tab)

- **Purpose**: Creates targeted marketing campaigns based on ICPs
- **Focus**: Writing ad copy, messaging, and campaign strategies
- **Access**: AI assistant button in Campaign Designer tab
- **Interface**: Direct campaign creation options

#### **4. Campaign Research Tool** (Campaign Library Tab)

- **Purpose**: Researches successful campaigns and marketing trends
- **Focus**: Competitive analysis, best practices, and inspiration
- **Access**: AI assistant button in Campaign Library tab
- **Interface**: Research and trend analysis buttons

### **LangChain Integration**

- **Agents**: Uses LangChain agents for complex AI operations
- **Tools**: Implements LangChain tools for form management and data processing
- **Memory**: Leverages LangChain's conversation memory
- **Structured Output**: Uses LangChain's function calling for consistent responses

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

### 4. Create Campaigns

- Use **"Campaign Designer"** to create targeted campaigns
- Research trends and ideas in **"Campaign Library"**
- Each tab has its own specialized AI assistant

## 🏗️ Project Structure

```text
src/
├── components/
│   ├── ui/              # UI components (buttons, inputs, etc.)
│   │   ├── chat-panel.tsx              # General guide (default)
│   │   ├── specialized-chat.tsx        # Reusable AI chat component
│   │   ├── ai-assistant-button.tsx     # AI assistant button component
│   │   └── ai-assistants-config.ts     # Assistant configurations
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

- **OwnCompanyForm**: Company information input with ICP Form Tool
- **ICPGenerator**: Main interface for generating customer profiles
- **ICPProfiles**: Display generated customer profiles with ICP Analysis Tool
- **CampaignDesigner**: Create marketing campaigns with Campaign Creation Tool
- **CampaignLibrary**: Research campaign ideas with Campaign Research Tool
- **ChatPanel**: General guide for ICP concepts and getting started
- **SpecializedChat**: Reusable AI chat component for tools
- **AIAssistantButton**: Easy-to-use AI assistant buttons

## 🤖 AI Assistant Features

### **General Guide (Default)**

- **Purpose**: Explains ICPs and application workflow
- **Access**: Floating chat button (always available)
- **Role**: Onboarding, navigation, and general help
- **Prephrases**: "What are Ideal Customer Profiles?", "How do I get started?", etc.

### **Specialized Tools**

Each tool has focused expertise and relevant prephrases:

- **ICP Form Tool**: Company information collection (no irrelevant questions)
- **ICP Analysis Tool**: Profile interpretation and strategy suggestions
- **Campaign Creation Tool**: Creative campaign development
- **Campaign Research Tool**: Market research and competitive insights

### **Smart Integration**

- **Context-Aware**: Each tool focuses on its specific domain
- **Easy Access**: AIAssistantButton component for simple integration
- **Consistent UI**: Professional interface across all assistants
- **Configurable**: Easy to add new tools or modify existing ones

## 💡 Usage Tips

1. **Start with the Guide**: Use the floating chat for general help and ICP concepts
2. **Use Specialized Tools**: Each tab has focused AI assistance for specific tasks
3. **Try Prephrases**: Click suggestion buttons for quick help with each tool
4. **Be Specific**: Detailed company information = better ICPs
5. **Save Your Data**: Company information is saved locally
6. **Review Profiles**: Check the ICP Profiles tab for results
7. **Create Campaigns**: Use the campaign tools to act on your ICPs

## 🔧 Technical Details

- **Frontend**: React + TypeScript + Tailwind CSS
- **AI**: Local Ollama via OpenAI-compatible endpoint, LangChain agents/tools, Vercel AI SDK v3 streaming (`LangChainStream` + `useChat`)
- **Storage**: Browser localStorage
- **No External APIs**: Everything runs locally
- **Modular Design**: Easy to extend with new AI assistants

## 📝 License

MIT License - feel free to use and modify!
