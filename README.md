# ICP Builder - Ideal Customer Profile Generator

A comprehensive tool for generating Ideal Customer Profiles (ICPs) using AI-powered analysis of real customer reviews from Google Maps and other sources.

## 🚀 Features

- **ICP Generator**: Create detailed customer profiles based on your company + competitor analysis and real customer data
- **ICP Profiles**: View and analyze AI-generated customer profiles with comprehensive demographics
- **Google Maps Reviews Collector**: Gather real customer reviews from Google Maps using Apify integration
- **Location-Based Review Search**: Choose between Global, continents, or country-specific review collection (150+ countries supported)
- **Enhanced Review Analysis**: Advanced sentiment analysis, pain point extraction, and customer segmentation
- **Demographics Analyzer**: Extract and visualize real customer demographics from review content using LLM and pattern analysis
- **Competitor Analysis**: Analyze competitor websites and social media presence
- **Campaign Designer**: Generate marketing campaigns based on ICPs
- **Campaign Library**: Store and manage marketing campaigns
- **Project Management**: Save and load projects with your company, competitors, and generated ICPs
- **Test ICP Generation**: Built-in testing component for verifying AI generation functionality
- **Retry Logic**: Robust error handling with exponential backoff for reliable API calls
- **Structured Data Processing**: Enhanced LLM formatting with sentiment analysis and key insights

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

The application uses **Apify Google Maps API** for reliable customer review collection and extracts real demographic data from review content.

### Environment Variables (Required for Review Collection)

Create a `.env` file in the root directory for full functionality:

```env
# Required: Apify API Token for Google Maps reviews
VITE_APIFY_API_TOKEN=your_apify_token_here
```

**Note**: The Apify API token is required for collecting customer reviews from Google Maps. The application will work without it but with limited functionality.

## 🤖 AI Setup (Required for ICP Generation)

The application uses **Ollama** (local LLM) for generating Ideal Customer Profiles. No external API keys or costs required!

### Quick Ollama Setup

1. **Install Ollama**: Download from [https://ollama.ai](https://ollama.ai)
2. **Download Model**: Run `ollama pull llama3.2:3b`
3. **Start Ollama**: It should start automatically, or run `ollama serve`

For detailed setup instructions, see [OLLAMA_SETUP.md](OLLAMA_SETUP.md).

## 🔍 Data Collection API (Required for Production)

The application uses **Apify Google Maps Reviews** for reliable customer review collection:

### Apify Google Maps Reviews

**Apify Google Maps Reviews** for direct access to Google Maps customer reviews:

1. **Sign up for Apify**: Create account at [https://console.apify.com](https://console.apify.com)
2. **Get API Token**: Copy your API token from the Apify console
3. **Configure Environment**: Add to your `.env` file:

   ```env
   VITE_APIFY_API_TOKEN=your_apify_token_here
   ```

**Benefits of Apify Google Maps:**

- ✅ Direct access to Google Maps reviews
- ✅ No rate limiting or CAPTCHA issues
- ✅ High-quality, verified customer reviews
- ✅ Real-time data from Google Maps
- ✅ Structured review data with ratings and dates
- ✅ Optimized settings for ICP analysis (50 reviews, sentiment analysis, pain point extraction)
- ✅ Residential proxy support for better success rates
- ✅ Enhanced data processing with customer segmentation

### Optimized Apify Settings for ICP Analysis

The application uses optimized Apify Google Maps Review Scraper settings for better ICP generation:

```json
{
  "language": "en",
  "maxReviews": 50,
  "personalData": false,
  "maxRequestRetries": 3,
  "requestTimeoutSecs": 60,
  "maxConcurrency": 1,
  "headless": true,
  "proxyConfiguration": {
    "useApifyProxy": true,
    "apifyProxyGroups": ["RESIDENTIAL"]
  }
}
```

**Key Optimizations:**

- **15 reviews per company**: Reduced from 50 to save Apify credits while maintaining quality
- **2 additional reviews for LinkedIn insights**: Minimal additional cost for enhanced analysis
- **No personal data**: Focuses on review content rather than personal details
- **Residential proxies**: Better success rates and avoids IP blocking
- **Retry logic**: Handles temporary failures gracefully
- **Enhanced analysis**: Automatic sentiment analysis and pain point extraction

### ⚠️ Apify Credit Usage Warning

**Current Credit Consumption:**
- **Main reviews**: 15 reviews per company
- **LinkedIn insights**: 2 additional reviews per company
- **Total per company**: 17 reviews
- **Estimated cost**: ~17 Apify credits per company

**Credit Management Tips:**
- Start with 1-2 companies to test functionality
- Use the free tier (1000 credits) for initial testing
- Consider upgrading to paid plan for larger projects
- Monitor your Apify console for credit usage

## 🧠 How ICP Generation Works

### Enhanced Review Analysis & ICP Generation

The ICP generation process now includes advanced review analysis with sentiment analysis, pain point extraction, and customer segmentation for more accurate profile creation:

#### **Enhanced Review Analysis Features**

- **Sentiment Analysis**: Automatically categorizes reviews as positive, negative, or neutral
- **Pain Point Extraction**: Identifies common customer complaints and issues
- **Customer Segmentation**: Categorizes customers by behavior patterns (price-conscious, quality-focused, etc.)
- **Emotional Analysis**: Detects customer emotions (frustrated, satisfied, disappointed, etc.)
- **Topic Extraction**: Identifies common themes in customer feedback
- **ICP-Relevant Insights**: Extracts demographics, psychographics, goals, and preferred channels

#### **Retry Logic & Error Handling**

- **Exponential Backoff**: Automatic retry with increasing delays for failed API calls
- **Graceful Degradation**: Continues operation even if some data sources fail
- **Detailed Error Reporting**: Comprehensive error messages for debugging

### Apify Google Maps Enhanced Data Flow

The ICP generation process uses **Apify Google Maps API** to collect structured, reliable customer data for accurate profile creation:

#### **Apify Google Maps Data Collection**

```typescript
// Apify Google Maps API collects structured data from:
{
  reviews: [
    {
      text: "Actual customer review...",
      source: "https://maps.google.com/...",
      platform: "Google Maps",
      rating: 4.5,
      date: "2024-01-15"
    }
  ],
  dataSources: [
    {
      type: "google_maps_reviews",
      query: "Nokia customer reviews feedback",
      resultCount: 25,
      location: "Finland"
    }
  ]
}
```

### Data Flow & Input Sources

The ICP generation process uses **real customer data** from Google Maps and other sources:

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
// Real reviews collected from Google Maps:
{
  text: "Actual customer review text...",
  source: "Google Maps"
}
```

#### **3. Additional Context**

```typescript
// User-provided business context:
'Industry: SaaS, Target market: B2B, Location: Finland';
```

### Enhanced LLM Processing & Analysis

The **Ollama LLM (llama3.2:3b)** receives enhanced data from Apify Google Maps API:

#### **Input Data Structure**

```json
{
  "competitors": [
    "Competitor A (https://competitor-a.com)",
    "Competitor B (https://competitor-b.com)"
  ],
  "customer_reviews": [
    "Real review text from Google Maps...",
    "Customer feedback from Google Maps...",
    "Google Maps review content..."
  ],
  "additional_context": "Business context and industry info"
}
```

#### **Enhanced LLM Analysis Process (Apify Google Maps)**

1. **Structured Data Processing**: LLM analyzes clean, structured Google Maps data
2. **Multi-Source Correlation**: Combines reviews from Google Maps and other sources
3. **Platform-Specific Insights**: Leverages platform metadata (ratings, dates, sources)
4. **Market Intelligence**: Incorporates market research and competitor data
5. **Confidence Scoring**: Provides confidence levels based on data quality and quantity

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

### Enhanced Apify Google Maps Data Sources

With Apify Google Maps integration, the LLM analyzes **structured, reliable data** from:

#### **🔍 Apify Google Maps Sources**

- **Google Maps Reviews**: Direct access to verified customer reviews
- **Business Information**: Company details and contact information
- **Rating Data**: Customer ratings and sentiment analysis
- **Review Metadata**: Dates, ratings, and review content
- **Location Data**: Geographic and local market insights

**Benefits:**

- ✅ **Reliability**: No rate limiting or blocking issues
- ✅ **Structure**: Clean, parsed data with metadata
- ✅ **Coverage**: Direct access to Google Maps reviews
- ✅ **Quality**: Verified, relevant content from Google Maps
- ✅ **Speed**: Faster collection than web scraping

### Real-World Data Sources

The LLM can also analyze **actual customer data** from traditional web scraping:

#### **📱 Reddit Reviews**

- Real customer experiences from Finnish subreddits
- Authentic sentiment and pain points
- Demographic indicators in user posts

#### **🟩 Trustpilot Reviews**

- Public business reviews pages
- Text-only fetching via a CORS-safe proxy
- Real customer feedback extraction

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

### Benefits of Apify Google Maps Enhanced Analysis

1. **Superior Accuracy**: Structured data from verified sources
2. **Real-Time Relevance**: Current market conditions and customer sentiment
3. **Multi-Platform Coverage**: Comprehensive view across all major platforms
4. **Metadata Enrichment**: Ratings, dates, and source context
5. **Reliability**: No collection failures or incomplete data
6. **Scalability**: Consistent performance regardless of volume
7. **Actionability**: Precise, implementable customer insights

### Benefits of Real Data Analysis (Legacy)

1. **Accuracy**: Based on actual customer feedback, not assumptions
2. **Relevance**: Reflects real market conditions and customer needs
3. **Timeliness**: Uses current customer sentiment and trends
4. **Diversity**: Incorporates multiple perspectives and demographics
5. **Actionability**: Provides specific, implementable insights

## 📊 Usage

### 1. ICP Generator (Main Tab)

- **Your Company**: Enter your company name (required), website, and LinkedIn. Save it for reuse; load from the inline dropdown
- **Add Competitors**: Enter competitor names (required), websites, and social media profiles; load from per-field dropdown
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
  - **🟩 Trustpilot**: Public company review pages
  - Optional: **🐦 Twitter/X**, **🍽️ Yelp**, **📘 Facebook Groups** (with tokens)
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
- **Location-Based Review Search**: Choose between Global, continents, or country-specific review collection
  - **Global Search**: Worldwide review collection for international companies
  - **Continent Selection**: Target major regions (North America, Europe, Asia Pacific, Latin America, Africa, Middle East)
  - **Country-Specific**: Target specific markets (150+ countries supported)
  - **Real-time Location Selection**: Comprehensive dropdown with flags, organized by regions
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

### Project Structure

```text
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components (shadcn/ui)
│   │   ├── button.tsx          # Button component
│   │   ├── card.tsx            # Card component
│   │   ├── card-toolbar.tsx    # Card toolbar (help icon)
│   │   ├── chat-panel.tsx      # In-app AI chat panel
│   │   ├── floating-chat.tsx   # Persistent bottom-right chat toggle
│   │   ├── input.tsx           # Input component
│   │   ├── label.tsx           # Label component
│   │   ├── select.tsx          # Select component
│   │   ├── tabs.tsx            # Tabs component
│   │   └── textarea.tsx        # Textarea component
│   ├── layout/         # Layout components
│   │   └── Header.tsx          # Application header
│   ├── dialogs/        # Dialog components
│   │   ├── ICPPopup.tsx        # ICP details popup
│   │   ├── LoadProjectDialog.tsx # Project loading dialog
│   │   └── SaveProjectDialog.tsx # Project saving dialog
│   ├── icp/            # ICP-related components
│   │   ├── ICPGenerator.tsx    # Main ICP generation interface (OwnCompany + Competitors)
│   │   ├── ICPProfiles.tsx     # Display generated ICP profiles
│   │   ├── CompetitorForm.tsx  # Competitor data input form
│   │   └── OwnCompanyForm.tsx  # Your company data input form
│   ├── campaign/       # Campaign components
│   │   ├── CampaignDesigner.tsx # Campaign generation interface
│   │   └── CampaignLibrary.tsx  # Campaign idea library
│   ├── TestICPGeneration.tsx   # ICP generation testing component
│   ├── TestChatGPT.tsx         # ChatGPT testing component
│   └── index.ts                # Component exports
├── services/           # Business logic and API services
│   ├── ai/             # Modularized AI services
│   │   ├── agents/             # AI agents
│   │   ├── types.ts            # TypeScript interfaces
│   │   ├── ollama-client.ts    # Ollama API client
│   │   ├── chatgpt-client.ts   # ChatGPT API client
│   │   ├── website-scraper.ts  # Website content extraction
│   │   ├── icp-generator.ts    # ICP generation logic
│   │   ├── competitor-analyzer.ts # Competitor analysis
│   │   ├── review-analyzer.ts  # Review analysis
│   │   ├── ai-service.ts       # Main AI service orchestrator
│   │   ├── index.ts            # AI services exports
│   │   └── README.md           # AI services documentation
│   ├── ai.ts                   # AI service re-export
│   ├── company-search-service.ts # Company information search
│   ├── project-service.ts       # Project data persistence
│   ├── reviews-service.ts       # Review processing service
│   └── index.ts                # Service exports
├── hooks/              # Custom React hooks
│   └── useAppState.ts  # Centralized application state management
├── utils/              # Utility functions
│   └── test-icp-generation.ts   # ICP generation testing utilities
├── lib/                # Shared utilities
│   └── utils.ts        # Utility functions
├── App.tsx             # Main application component
└── main.tsx            # Application entry point
```
