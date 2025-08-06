# ICP Builder - Ideal Customer Profile Generator

A comprehensive tool for generating Ideal Customer Profiles (ICPs) using AI-powered analysis of real customer reviews from multiple free sources.

## 🚀 Features

- **ICP Generator**: Create detailed customer profiles based on competitor analysis and real customer data
- **ICP Profiles**: View and analyze AI-generated customer profiles with comprehensive demographics
- **Multi-Source Reviews Collector**: Gather real customer reviews from Reddit, Twitter/X, Yelp, and Facebook Groups
- **Demographics Analyzer**: Extract and visualize real customer demographics from review content using LLM and pattern analysis
- **Competitor Analysis**: Analyze competitor websites and social media presence
- **Campaign Designer**: Generate marketing campaigns based on ICPs
- **Campaign Library**: Store and manage marketing campaigns
- **Project Management**: Save and load projects with competitor data and generated ICPs
- **Test ICP Generation**: Built-in testing component for verifying AI generation functionality

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

## 🧠 How ICP Generation Works

### Data Flow & Input Sources

The ICP generation process uses **real customer data** from multiple sources to create accurate customer profiles:

#### **1. Competitor Data Input**

```typescript
// Data collected from user input:
{
  name: "Competitor Name",
  website: "https://competitor.com",
  social: "LinkedIn, Twitter handles"
}
```

#### **2. Customer Reviews Data**

```typescript
// Real reviews collected from multiple sources:
{
  text: "Actual customer review text...",
  source: "Reddit/Twitter/Yelp/Facebook"
}
```

#### **3. Additional Context**

```typescript
// User-provided business context:
'Industry: SaaS, Target market: B2B, Location: Finland';
```

### LLM Processing & Analysis

The **Ollama LLM (llama2:7b)** receives a comprehensive prompt containing:

#### **Input Data Structure**

```json
{
  "competitors": [
    "Competitor A (https://competitor-a.com)",
    "Competitor B (https://competitor-b.com)"
  ],
  "customer_reviews": [
    "Real review text from Reddit...",
    "Customer feedback from Twitter...",
    "Yelp review content...",
    "Facebook group discussion..."
  ],
  "additional_context": "Business context and industry info"
}
```

#### **LLM Analysis Process**

1. **Competitor Analysis**: LLM analyzes competitor websites and social media presence
2. **Review Sentiment Analysis**: Processes real customer feedback and sentiment
3. **Demographic Pattern Recognition**: Identifies customer patterns from review content
4. **Market Position Analysis**: Determines target audience characteristics
5. **Channel Preference Analysis**: Identifies where customers are most active

### ICP Generation Output

The LLM generates **3 comprehensive ICP profiles** with the following structure:

```json
{
  "name": "Profile name",
  "description": "Detailed profile description",
  "demographics": {
    "age": "Age range (e.g., 25-35, 35-45, 45-55, 55+)",
    "gender": "Male, Female, or Mixed (based on review data patterns)",
    "location": "Geographic location",
    "income": "Income level",
    "education": "Education level"
  },
  "psychographics": {
    "interests": ["Technology", "Business", "Innovation"],
    "values": ["Quality", "Efficiency", "Growth"],
    "lifestyle": "Lifestyle description",
    "painPoints": ["Time constraints", "Complex solutions"]
  },
  "behavior": {
    "onlineHabits": ["Social media", "Professional networks"],
    "purchasingBehavior": "Research-driven decisions",
    "brandPreferences": ["Established brands", "Innovative companies"]
  },
  "goals": ["Business growth", "Efficiency improvement"],
  "challenges": ["Finding the right solution", "Implementation time"],
  "preferredChannels": [
    "LinkedIn",
    "Industry conferences",
    "Email marketing",
    "Google Ads",
    "Trade shows",
    "Professional websites"
  ]
}
```

### Data Quality & Validation

#### **Robust Error Handling**

- **JSON Parsing**: Extracts JSON from LLM response even with extra text
- **Field Validation**: Ensures all required fields are present
- **Fallback Logic**: Provides default values for missing fields
- **Channel Diversity**: Automatically generates diverse marketing channels

#### **Dynamic Channel Generation**

```typescript
// Based on ICP demographics and interests:
- Age 25-35 + High income → LinkedIn, Twitter, Industry conferences
- Age 35-55 + Middle income → Pinterest, Local workshops, Email marketing
- Finance interests → Investment forums, Financial blogs
- Healthcare interests → Medical conferences, Healthcare blogs
```

### Real-World Data Sources

The LLM analyzes **actual customer data** from:

#### **📱 Reddit Reviews**

- Real customer experiences from Finnish subreddits
- Authentic sentiment and pain points
- Demographic indicators in user posts

#### **🐦 Twitter/X Feedback**

- Live customer conversations
- Real-time sentiment analysis
- Geographic and demographic patterns

#### **🍽️ Yelp Reviews**

- Verified customer ratings and reviews
- Detailed feedback on products/services
- Location-based customer insights

#### **📘 Facebook Groups**

- Community discussions and recommendations
- Local market insights
- Peer-to-peer recommendations

### Benefits of Real Data Analysis

1. **Accuracy**: Based on actual customer feedback, not assumptions
2. **Relevance**: Reflects real market conditions and customer needs
3. **Timeliness**: Uses current customer sentiment and trends
4. **Diversity**: Incorporates multiple perspectives and demographics
5. **Actionability**: Provides specific, implementable insights

## 📊 Usage

### 1. ICP Generator (Main Tab)

- **Add Competitors**: Enter competitor names, websites, and social media profiles
- **Fetch Company Info**: Automatically scrape competitor websites for content analysis
- **Collect Reviews**: Gather real customer reviews from multiple sources
- **Generate ICPs**: Create 3 detailed customer profiles using AI analysis
- **Test Generation**: Use the built-in test component to verify ICP generation

### 2. ICP Profiles (Demographics Tab)

- **View Generated Profiles**: Display all AI-generated ICP profiles with complete details
- **Demographics Analysis**: Real demographic extraction from review content:
  - **Age**: LLM-based estimation with pattern fallback (student, family, senior indicators)
  - **Gender**: Enhanced detection using Finnish names and text patterns
  - **Location**: Extracted from city names mentioned in reviews
  - **Occupation**: Identified from professional terms in text
- **Test ICP Generation**: Built-in testing component for verifying AI generation

### 3. Multi-Source Reviews Collector

- Search for businesses by name
- Collect real customer reviews from:
  - **📱 Reddit**: r/Finland, r/Helsinki, r/Espoo, r/Vantaa
  - **🐦 Twitter/X**: Real tweets about businesses
  - **🍽️ Yelp**: Customer reviews and ratings
  - **📘 Facebook Groups**: Local community discussions
- Extract real demographic data from review content

### 4. Demographics Analyzer

- **Real demographic extraction** from review content:
  - **Age**: LLM-based estimation with pattern fallback
  - **Gender**: Enhanced detection using Finnish names and text patterns
  - **Location**: Extracted from city names mentioned in reviews
  - **Occupation**: Identified from professional terms in text
- Visualize customer age, gender, and location distribution
- Analyze sentiment patterns in reviews
- Identify top keywords and themes

### 5. Competitor Analysis

- Add competitor websites and social media profiles
- Generate SWOT analysis and market positioning
- Export competitor analysis reports

### 6. Campaign Designer

- Select an ICP and copy style
- Generate complete marketing campaigns
- Create ad copy, hooks, and landing page content

### 7. Campaign Library

- Store and manage marketing campaigns
- Browse campaign ideas and templates

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
// LLM-based estimation with pattern fallback:
- Youth indicators: "opiskelija", "yliopisto", "koulu" → 18-25 age range
- Young professional: "työ", "ura", "asunto" → 25-35 age range
- Family indicators: "perhe", "lapsi", "asunto" → 30-50 age range
- Senior: "eläke", "lapsenlapsi", "terveys" → 55+ age range
```

### **🏷️ Gender Detection**

```javascript
// Enhanced detection using Finnish names and text patterns:
- Female names: "Maria", "Anna", "Liisa", "Sanna", "Elina", "Tarja", "Päivi", "Tuula"
- Male names: "Jukka", "Mikael", "Petri", "Kari", "Timo", "Matti", "Pekka", "Juha"
- Text patterns: "naisena", "tyttö", "nainen" → Female
- Text patterns: "miehenä", "poika", "mies" → Male
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
│   ├── ui/             # Reusable UI components (shadcn/ui)
│   ├── layout/         # Layout components (Header)
│   ├── dialogs/        # Dialog components (Save/Load/ICP Popup)
│   ├── icp/            # ICP-related components
│   │   ├── ICPGenerator.tsx     # Main ICP generation interface
│   │   ├── ICPProfiles.tsx      # Display generated ICP profiles
│   │   └── CompetitorForm.tsx   # Competitor data input form
│   ├── campaign/       # Campaign components
│   │   ├── CampaignDesigner.tsx # Campaign generation interface
│   │   └── CampaignLibrary.tsx  # Campaign idea library
│   ├── GoogleReviewsCollector.tsx  # Multi-source reviews collector
│   ├── DemographicsAnalyzer.tsx    # Real demographics analyzer
│   ├── CompetitorAnalyzer.tsx      # Competitor analysis
│   └── TestICPGeneration.tsx       # ICP generation testing component
├── services/           # Business logic and API services
│   ├── ai.ts                    # AI service (Ollama LLM)
│   ├── multi-source-reviews.ts  # Multi-source review collection
│   ├── company-search-service.ts # Company information search
│   ├── project-service.ts        # Project data persistence
│   ├── reviews-service.ts        # Review processing service
│   └── index.ts                 # Service exports
├── hooks/              # Custom React hooks
│   └── useAppState.ts  # Centralized application state management
├── utils/              # Utility functions
│   └── test-icp-generation.ts   # ICP generation testing utilities
└── lib/                # Shared utilities
```
