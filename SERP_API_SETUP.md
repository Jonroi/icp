# SERP API Setup Guide

This guide explains how to configure SERP API integration for the ICP Builder application.

## Overview

The ICP Builder now uses SERP APIs instead of web scraping to collect customer reviews and market data. This provides:

- **Reliable Data Collection**: No rate limiting or CAPTCHA issues
- **Structured Results**: Clean, structured data from search engines
- **Better Quality**: Verified, relevant customer insights
- **Multiple Sources**: Support for various SERP API providers

## Supported SERP API Providers

### 1. SearchAPI.io (Recommended) ⭐

- **Website**: <https://www.searchapi.io/>
- **Free Tier**: Very generous free tier
- **Paid Plans**: Starting at $19/month
- **Features**: Best free tier, instant activation, excellent reliability

### 2. SerpAPI

- **Website**: <https://serpapi.com/>
- **Free Tier**: 100 searches/month
- **Paid Plans**: Starting at $50/month
- **Features**: Well-established, good documentation

### 3. ScrapingBee

- **Website**: <https://www.scrapingbee.com/>
- **Free Tier**: 1,000 requests/month
- **Paid Plans**: Starting at $29/month
- **Features**: Good performance, includes proxies

### 4. ValueSERP

- **Website**: <https://www.valueserp.com/>
- **Free Tier**: 50 searches/month
- **Paid Plans**: Starting at $20/month
- **Features**: Budget-friendly option

## Setup Instructions

### Step 1: Choose and Sign Up for SERP API Provider

1. **SearchAPI.io (Recommended)**:

   - Visit <https://www.searchapi.io/>
   - Sign up for a free account
   - Get your API key from the dashboard
   - Instant activation, very generous free tier

2. **SerpAPI**:

   - Visit <https://serpapi.com/>
   - Sign up for a free account
   - Get your API key from the dashboard

3. **ScrapingBee**:

   - Visit <https://www.scrapingbee.com/>
   - Sign up and get your API key

4. **ValueSERP**:
   - Visit <https://www.valueserp.com/>
   - Sign up and get your API key

### Step 2: Configure Environment Variables

Create a `.env` file in your project root with:

```env
# SERP API Configuration
SERP_API_KEY=your_api_key_here
SERP_PROVIDER=searchapi

# Optional: Customize search settings
DEFAULT_SEARCH_LOCATION=Finland
DEFAULT_SEARCH_LANGUAGE=en
MAX_REVIEWS_PER_SEARCH=25
```

### Step 3: Test Configuration

Run the application and use the built-in test function:

```typescript
import { SerpReviewsService } from './src/services';

// Test SERP API connectivity
const testResult = await SerpReviewsService.testConnection();
console.log(testResult);
```

## Usage Examples

### Basic Review Collection

```typescript
import { SerpReviewsService } from './src/services';

// Collect customer reviews using SERP API
const reviews = await SerpReviewsService.fetchCustomerReviews('Nokia', {
  location: 'Finland',
  maxResults: 20,
});

console.log(reviews);
```

### Advanced Structured Data Collection

```typescript
import { SerpReviewsService } from './src/services';

// Get structured data with metadata
const structuredData = await SerpReviewsService.fetchStructuredReviews(
  'Nokia',
  {
    location: 'Finland',
    maxResults: 20,
    includeMarketData: true,
    includeCompetitorData: true,
  },
);

console.log('Reviews:', structuredData.reviews);
console.log('Data Sources:', structuredData.dataSources);
console.log('Metadata:', structuredData.metadata);
```

### ICP Generation with SERP Data

```typescript
import { SerpReviewsService, aiService } from './src/services';

// Collect SERP data and generate ICPs
const serpData = await SerpReviewsService.fetchStructuredReviews('MyCompany');
const competitors = [
  { name: 'Competitor', website: 'example.com', social: '' },
];

const icps = await aiService.generateICPs(
  competitors,
  serpData.reviews,
  'Additional context about the business',
);

console.log('Generated ICPs:', icps);
```

## Configuration Options

### Environment Variables

| Variable                  | Default   | Description                                    |
| ------------------------- | --------- | ---------------------------------------------- |
| `SERP_API_KEY`            | -         | Your SERP API key (required)                   |
| `SERP_PROVIDER`           | `serpapi` | API provider (serpapi, scrapingbee, valueserp) |
| `DEFAULT_SEARCH_LOCATION` | `Finland` | Default location for searches                  |
| `DEFAULT_SEARCH_LANGUAGE` | `en`      | Default language for searches                  |
| `MAX_REVIEWS_PER_SEARCH`  | `25`      | Maximum reviews per search                     |

### Search Options

```typescript
interface SearchOptions {
  location?: string; // Search location
  maxResults?: number; // Max results to return
  includeMarketData?: boolean; // Include market research
  includeCompetitorData?: boolean; // Include competitor analysis
}
```

## Troubleshooting

### Common Issues

1. **"SERP API key not configured"**

   - Solution: Set `SERP_API_KEY` in your `.env` file

2. **"SERP API HTTP 401"**

   - Solution: Check your API key is correct and active

3. **"SERP API HTTP 429"**

   - Solution: You've exceeded your rate limit, upgrade plan or wait

4. **"No reviews found"**
   - Solution: Try different company names or search terms

### Debug Mode

Enable debug logging to see detailed SERP API requests:

```env
DEBUG_MODE=true
```

## Benefits Over Web Scraping

| Web Scraping         | SERP API         |
| -------------------- | ---------------- |
| Rate limited         | Reliable quota   |
| CAPTCHA blocks       | No blocking      |
| Parsing complexity   | Structured data  |
| Legal concerns       | API compliance   |
| Maintenance overhead | Provider managed |

## Cost Optimization

1. **Cache Results**: Store SERP results to avoid repeat calls
2. **Batch Searches**: Group related searches together
3. **Smart Filtering**: Use specific search terms to reduce noise
4. **Monitor Usage**: Track API usage against quotas

## Migration from Web Scraping

The new SERP API system is backward compatible:

```typescript
// Old way (still works)
const reviews = await ReviewsService.fetchCustomerReviews('Company');

// New way (recommended)
const reviews = await SerpReviewsService.fetchCustomerReviews('Company');
```

## Support

- Check provider documentation for API-specific issues
- Review application logs for detailed error messages
- Test with simple queries first (e.g., 'McDonald's')
- Contact provider support for API key issues

## Next Steps

1. Set up your SERP API account
2. Configure environment variables
3. Test the connection
4. Start generating ICPs with reliable data!

The SERP API integration makes ICP generation more reliable and provides higher quality customer insights for better business decisions.
