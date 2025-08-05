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

## 🎯 Key Features

### **✅ Real Data Only**

- No mock data or generated reviews
- All reviews come from actual customer experiences
- Real demographic extraction from text content

### **🆓 Free APIs**

- Reddit API: No key required
- Twitter/X API: Free tier (500k tweets/month)
- Yelp API: Free tier (500 requests/day)
- Facebook API: Free tier

### **📊 Accurate Demographics**

- Age estimation from text content analysis
- Gender detection from Finnish names
- Location extraction from city mentions
- Occupation identification from professional terms

### **🔒 Privacy Compliant**

- No personal data collection
- Only public review content
- GDPR compliant data handling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details.

## 🆘 Troubleshooting

### API Issues

**Reddit API not working:**

- Reddit API is public and should work without issues
- Check internet connection

**Twitter/X API errors:**

- Optional: Add `TWITTER_BEARER_TOKEN` to `.env`
- Without token: Limited functionality

**Yelp API errors:**

- Optional: Add `YELP_API_KEY` to `.env`
- Without key: Limited functionality

**Facebook API errors:**

- Optional: Add `FACEBOOK_ACCESS_TOKEN` to `.env`
- Without token: Limited functionality

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

- [ ] Support for more review platforms
- [ ] Enhanced demographic extraction algorithms
- [ ] Real-time review monitoring
- [ ] Advanced analytics dashboard
- [ ] Integration with CRM systems
- [ ] Multi-language support
- [ ] Mobile app version

## 🔍 Data Quality

### **Real Reviews Only**

- All reviews come from actual customer experiences
- No AI-generated or mock review content
- Authentic customer feedback and opinions

### **Accurate Demographics**

- Demographics extracted from real review content
- Based on actual mentions and context
- No random generation or assumptions

### **Multiple Sources**

- Reddit: Community discussions and recommendations
- Twitter/X: Real-time customer feedback
- Yelp: Professional review platform
- Facebook Groups: Local community experiences
