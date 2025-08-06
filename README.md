# ICP Builder - Ideal Customer Profile Generator

A comprehensive tool for generating Ideal Customer Profiles (ICPs) using AI-powered analysis of real customer reviews from multiple free sources.

## 🚀 Features

- **ICP Generator**: Create detailed customer profiles based on competitor analysis
- **Multi-Source Reviews Collector**: Gather real customer reviews from Reddit, Twitter/X, Yelp, and Facebook Groups
- **Competitor Analysis**: Analyze competitor websites and social media presence
- **Demographics Analyzer**: Extract and visualize real customer demographics from review content
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

## 🔧 Configuration

The application uses **free APIs only** and extracts real demographic data from review content.

### Environment Variables (Optional)

Create a `.env` file in the root directory for enhanced functionality:

```env
# Optional: Twitter/X API Bearer Token for Twitter reviews
TWITTER_BEARER_TOKEN=your_twitter_bearer_token_here

# Optional: Yelp API Key for Yelp reviews
YELP_API_KEY=your_yelp_api_key_here

# Optional: Facebook Access Token for Facebook Groups reviews
FACEBOOK_ACCESS_TOKEN=your_facebook_access_token_here
```

**Note**: All APIs are free tier and optional. The application works without API keys but with limited functionality.

## 🤖 AI Setup (Required for ICP Generation)

The application uses **Ollama** (local LLM) for generating Ideal Customer Profiles. No external API keys or costs required!

### Quick Ollama Setup

1. **Install Ollama**: Download from [https://ollama.ai](https://ollama.ai)
2. **Download Model**: Run `ollama pull llama2:7b`
3. **Start Ollama**: It should start automatically, or run `ollama serve`

For detailed setup instructions, see [OLLAMA_SETUP.md](OLLAMA_SETUP.md).

## 📊 Usage

### 1. Multi-Source Reviews Collector

- Search for businesses by name
- Collect real customer reviews from:
  - **📱 Reddit**: r/Finland, r/Helsinki, r/Espoo, r/Vantaa
  - **🐦 Twitter/X**: Real tweets about businesses
  - **🍽️ Yelp**: Customer reviews and ratings
  - **📘 Facebook Groups**: Local community discussions
- Extract real demographic data from review content

### 2. Demographics Analyzer

- **Real demographic extraction** from review content:
  - **Age**: Estimated from text content (student, family, senior indicators)
  - **Gender**: Determined from Finnish names in author names
  - **Location**: Extracted from city names mentioned in reviews
  - **Occupation**: Identified from professional terms in text
- Visualize customer age, gender, and location distribution
- Analyze sentiment patterns in reviews
- Identify top keywords and themes

### 3. ICP Generator

- Add competitor information (name, website, social media)
- Use real customer reviews from multiple sources
- Generate ICPs using AI analysis of actual customer data

### 4. Competitor Analysis

- Add competitor websites and social media profiles
- Generate SWOT analysis and market positioning
- Export competitor analysis reports

### 5. Campaign Designer

- Select an ICP and copy style
- Generate complete marketing campaigns
- Create ad copy, hooks, and landing page content

## 🆓 Free Data Sources

### **📱 Reddit API (100% Free)**

- Searches Finnish subreddits for business mentions
- Extracts real user experiences and opinions
- No API key required

### **🐦 Twitter/X API (Free Tier)**

- 500,000 tweets per month free
- Real-time customer feedback
- Requires optional Bearer Token

### **🍽️ Yelp Fusion API (Free Tier)**

- 500 requests per day free
- Customer reviews and ratings
- Requires optional API key

### **📘 Facebook Graph API (Free Tier)**

- Local community discussions
- Real customer experiences
- Requires optional Access Token

## 📊 Real Demographic Data Extraction

The application extracts **real demographic information** from review content:

### **🎂 Age Estimation**

```javascript
// From review text content:
- Youth indicators: "opiskelija", "yliopisto", "koulu" → 22-30v
- Middle age: "perhe", "lapsi", "asunto", "työ" → 30-50v
- Senior: "eläke", "lapsenlapsi", "terveys" → 55-70v
```

### **🏷️ Gender Detection**

```javascript
// From Finnish names:
- Female names: "Maria", "Anna", "Liisa", "Sanna", "Elina"
- Male names: "Jukka", "Mikael", "Petri", "Kari", "Timo"
```

### **📍 Location Extraction**

```javascript
// From review text:
- Cities: Helsinki, Tampere, Turku, Oulu, Jyväskylä, etc.
- Extracted using regex patterns from actual mentions
```

### **💼 Occupation Identification**

```javascript
// From professional terms in text:
-'johtaja',
  'manager',
  'konsultti',
  'insinööri',
  'opettaja' - 'myyjä',
  'asiantuntija',
  'kehittäjä',
  'suunnittelija';
```

## 🛠️ Development

### Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── GoogleReviewsCollector.tsx  # Multi-source reviews
│   ├── DemographicsAnalyzer.tsx    # Real demographics
│   └── CompetitorAnalyzer.tsx      # Competitor analysis
├── services/           # Business logic
│   ├── ai.ts          # AI service (local LLM + OpenAI)
│   └── google-reviews.ts           # Multi-source API calls
├── hooks/             # Custom React hooks
└── lib/               # Utilities
```
