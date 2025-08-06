# AI Services - Modularized Architecture

This directory contains the modularized AI services that were extracted from the original monolithic `ai.ts` file.

## Structure

```bash
ai/
├── types.ts              # All TypeScript interfaces and types
├── ollama-client.ts      # Ollama API client for LLM interactions
├── website-scraper.ts    # Website content extraction
├── icp-generator.ts      # ICP (Ideal Customer Profile) generation
├── competitor-analyzer.ts # Competitor analysis functionality
├── review-analyzer.ts    # Customer review analysis
├── ai-service.ts         # Main service orchestrator
└── index.ts             # Exports all services
```

## Benefits of Modularization

### 1. **Single Responsibility Principle**

Each service has a clear, focused responsibility:

- `OllamaClient`: Handles all LLM API interactions
- `WebsiteScraper`: Extracts website content
- `ICPGenerator`: Generates customer profiles
- `CompetitorAnalyzer`: Analyzes competitors
- `ReviewAnalyzer`: Analyzes customer reviews

### 2. **Improved Testability**

Each service can be tested independently:

```typescript
// Test ICP generation without needing full AI setup
const icpGenerator = new ICPGenerator();
const mockCompetitors = [...];
const mockReviews = [...];
const icps = await icpGenerator.generateICPs(mockCompetitors, mockReviews);
```

### 3. **Better Maintainability**

- Smaller, focused files (50-200 lines vs 675 lines)
- Clear separation of concerns
- Easier to locate and fix issues
- Simpler to add new features

### 4. **Reusability**

Services can be used independently:

```typescript
// Use just the website scraper
const scraper = new WebsiteScraper();
const content = await scraper.scrapeWebsite('https://example.com');

// Use just the review analyzer
const analyzer = new ReviewAnalyzer();
const analysis = await analyzer.analyzeReviews(reviews);
```

### 5. **Type Safety**

All types are centralized in `types.ts`:

```typescript
import { ICP, CompetitorData, CustomerReview } from './types';
```

## Usage

### Main Service (Backward Compatible)

```typescript
import { AIService } from './ai';

const aiService = new AIService();
const icps = await aiService.generateICPs(competitors, reviews);
```

### Individual Services

```typescript
import { ICPGenerator, CompetitorAnalyzer, ReviewAnalyzer } from './ai';

const icpGenerator = new ICPGenerator();
const competitorAnalyzer = new CompetitorAnalyzer();
const reviewAnalyzer = new ReviewAnalyzer();
```

## Migration from Original ai.ts

The original `ai.ts` file has been replaced with a simple re-export:

```typescript
// src/services/ai.ts
export * from './ai/index';
```

This maintains backward compatibility while providing the benefits of modularization.

## Testing Strategy

Each service can be tested independently:

```typescript
// Test ICP generation
describe('ICPGenerator', () => {
  it('should generate valid ICPs', async () => {
    const generator = new ICPGenerator();
    const icps = await generator.generateICPs(mockCompetitors, mockReviews);
    expect(icps).toHaveLength(3);
    expect(icps[0]).toHaveProperty('demographics');
  });
});

// Test competitor analysis
describe('CompetitorAnalyzer', () => {
  it('should analyze competitor data', async () => {
    const analyzer = new CompetitorAnalyzer();
    const analysis = await analyzer.generateCompetitorAnalysis(
      competitor,
      content,
    );
    expect(analysis).toHaveProperty('strengths');
  });
});
```

## Future Enhancements

1. **Configuration Management**: Add configuration service for API keys and settings
2. **Caching Layer**: Add caching for expensive operations
3. **Rate Limiting**: Add rate limiting for API calls
4. **Error Handling**: Centralized error handling and logging
5. **Validation**: Add input validation for all services
