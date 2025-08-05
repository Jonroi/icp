# ICP Builder - Ideal Customer Profile Generator

A comprehensive tool for generating Ideal Customer Profiles (ICPs) using AI-powered analysis of competitor data, customer reviews, and market research.

## 🚀 Features

- **ICP Generator**: Create detailed customer profiles based on competitor analysis
- **Google Reviews Collector**: Gather and analyze customer reviews from Google Places
- **Competitor Analysis**: Analyze competitor websites and social media presence
- **Demographics Analyzer**: Visualize customer demographics and sentiment analysis
- **Campaign Designer**: Generate marketing campaigns based on ICPs
- **Campaign Library**: Store and manage marketing campaigns

## 🏃‍♂️ Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd icp

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🤖 Local LLM Setup (Optional)

To use local LLM instead of cloud APIs, install Ollama:

### 1. Install Ollama

**Windows:**

```bash
# Download from https://ollama.ai
# Or use winget
winget install Ollama.Ollama
```

**macOS:**

```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

**Linux:**

```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

### 2. Download a Model

```bash
# Download Llama 2 (recommended for ICP generation)
ollama pull llama2:7b

# Or try other models
ollama pull mistral:7b
ollama pull codellama:7b
```

### 3. Start Ollama

```bash
# Start Ollama service
ollama serve
```

### 4. Test the Setup

```bash
# Test if Ollama is working
ollama run llama2:7b "Hello, how are you?"
```

## 🔧 Configuration

The application automatically detects if Ollama is available and uses local LLM. If not available, it falls back to mock data.

### Environment Variables

Create a `.env` file in the root directory:

```env
# Optional: OpenAI API key for cloud-based AI
OPENAI_API_KEY=your_openai_api_key_here

# Optional: Google Places API key for real Google Reviews
GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
```

## 📊 Usage

### 1. ICP Generator

- Add competitor information (name, website, social media)
- Input customer reviews manually
- Generate ICPs using AI analysis

### 2. Google Reviews Collector

- Search for businesses using Google Places API
- Collect and analyze customer reviews
- Export review data for further analysis

### 3. Competitor Analysis

- Add competitor websites and social media profiles
- Generate SWOT analysis and market positioning
- Export competitor analysis reports

### 4. Demographics Analyzer

- Visualize customer age, gender, and location distribution
- Analyze sentiment patterns in reviews
- Identify top keywords and themes

### 5. Campaign Designer

- Select an ICP and copy style
- Generate complete marketing campaigns
- Create ad copy, hooks, and landing page content

## 🛠️ Development

### Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── GoogleReviewsCollector.tsx
│   ├── DemographicsAnalyzer.tsx
│   └── CompetitorAnalyzer.tsx
├── services/           # Business logic
│   ├── ai.ts          # AI service (local LLM + OpenAI)
│   └── google-reviews.ts
├── hooks/             # Custom React hooks
└── lib/               # Utilities
```

### Available Scripts

```bash
# Development
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Type check
npm run type-check
```

## 🔍 Local LLM vs Cloud APIs

### Local LLM (Ollama)

✅ **Pros:**

- No API costs
- Privacy - data stays local
- No rate limits
- Works offline

❌ **Cons:**

- Requires more computational resources
- Limited model selection
- Slower response times
- Requires local setup

### Cloud APIs (OpenAI)

✅ **Pros:**

- Better model quality
- Faster response times
- No local setup required
- More reliable

❌ **Cons:**

- API costs
- Rate limits
- Data privacy concerns
- Requires internet connection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details.

## 🆘 Troubleshooting

### Ollama Issues

**"Ollama not found" error:**

```bash
# Make sure Ollama is installed and running
ollama serve
```

**"Model not found" error:**

```bash
# Download the required model
ollama pull llama2:7b
```

**Slow responses:**

- Try a smaller model: `ollama pull llama2:3b`
- Increase system RAM allocation
- Use GPU acceleration if available

### Build Issues

**TypeScript errors:**

```bash
npm run type-check
```

**Lint errors:**

```bash
npm run lint
```

## 📈 Roadmap

- [ ] Support for more LLM models (Mistral, CodeLlama)
- [ ] Real-time collaboration features
- [ ] Advanced analytics dashboard
- [ ] Integration with CRM systems
- [ ] Multi-language support
- [ ] Mobile app version
