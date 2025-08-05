# Testing Guide - ICP & Campaign Insights Application

## Yleiskatsaus

Tämä ohjelma voidaan testata täysin ilman ulkoisia API:ja! Kaikki toiminnallisuudet toimivat mock-datalla, mikä mahdollistaa kehityksen ja testauksen ilman kustannuksia tai API-avaimia.

## Testausstrategiat

### 1. **Mock-toteutukset (jo valmiit)**

Ohjelmassa on jo valmiit mock-toteutukset seuraavissa tiedostoissa:

- **`src/components/CompetitorAnalyzer.tsx`** (rivit 67-120): Simuloi kilpailija-analyysin
- **`src/services/ai.ts`** (rivit 180-235): Sisältää `generateMockICPs()` metodin
- **`src/services/google-reviews.ts`** (rivit 50-100): Käyttää mock-reviews dataa
- **`src/hooks/useAI.ts`**: Käyttää mock-dataa kun API-avainta ei ole

### 2. **TestMode-komponentti**

Uusi `TestMode`-komponentti (`src/components/TestMode.tsx`) tarjoaa:

- **Quick Test**: Käyttää ennalta määriteltyä mock-dataa
- **Full Test**: Generoi satunnaista testidataa
- **Real-time logs**: Näyttää testausprosessin vaiheet
- **Data export**: Vie testidataa JSON-muodossa

### 3. **Test utilities**

`src/utils/test-helpers.ts` sisältää:

```typescript
// Mock data
export const mockCompetitors: MockCompetitorData[];
export const mockCustomerReviews: MockCustomerReview[];
export const mockICPs: MockICP[];
export const mockCampaigns;

// Test utilities
export class TestUtils {
  static generateRandomCompetitor(): MockCompetitorData;
  static generateRandomReview(): MockCustomerReview;
  static simulateAPIDelay(ms: number): Promise<void>;
  static validateCompetitorData(data: MockCompetitorData): boolean;
  static validateReviewData(data: MockCustomerReview): boolean;
}
```

## Testausohjeet

### Vaihe 1: Käynnistä sovellus

```bash
npm run dev
```

### Vaihe 2: Testaa ilman ulkoisia API:ja

1. **Avaa "Test Mode" -välilehti**
2. **Klikkaa "Quick Test"** nopeaan testiin
3. **Tai klikkaa "Full Test"** kattavaan testiin
4. **Seuraa testilokeja** reaaliajassa
5. **Tarkastele tuloksia** välilehdillä

### Vaihe 3: Testaa yksittäisiä komponentteja

#### CompetitorAnalyzer

```typescript
// Lisää kilpailijoita
// Klikkaa "Analyze Competitors"
// Tarkastele tuloksia
```

#### GoogleReviewsCollector

```typescript
// Syötä paikan nimi
// Klikkaa "Collect Reviews"
// Tarkastele kerättyjä arvosteluja
```

#### DemographicsAnalyzer

```typescript
// Syötä arvostelut
// Klikkaa "Analyze Demographics"
// Tarkastele demografian analyysiä
```

## Testausskenaariot

### 1. **Tyhjä data**

```typescript
const emptyScenario = {
  competitors: [],
  reviews: [],
  expectedICPs: 0,
};
```

### 2. **Yksi kilpailija**

```typescript
const singleCompetitor = {
  competitors: [mockCompetitors[0]],
  reviews: [mockCustomerReviews[0]],
  expectedICPs: 1,
};
```

### 3. **Useita kilpailijoita**

```typescript
const multipleCompetitors = {
  competitors: mockCompetitors,
  reviews: mockCustomerReviews,
  expectedICPs: 3,
};
```

### 4. **Virheellinen data**

```typescript
const invalidData = {
  competitors: [{ name: '', website: '', social: '' }],
  reviews: [{ text: '', rating: 0, source: '' }],
  expectedICPs: 0,
};
```

## Mock-datan rakenne

### Competitor Data

```typescript
interface MockCompetitorData {
  name: string;
  website: string;
  social: string;
  websiteContent?: string;
}
```

### Customer Reviews

```typescript
interface MockCustomerReview {
  text: string;
  rating?: number;
  source: string;
  author?: string;
  date?: string;
}
```

### ICPs (Ideal Customer Personas)

```typescript
interface MockICP {
  id: string;
  name: string;
  demographics: {
    ageRange: { min: number; max: number };
    gender: { male: number; female: number };
    location: string[];
    incomeLevel: 'low' | 'medium' | 'high';
  };
  psychographics: {
    jobTitles: string[];
    companySize: string[];
    industry: string[];
    painPoints: string[];
  };
  behavior: {
    buyingPower: number;
    decisionMaking: string;
    preferredChannels: string[];
  };
  description: string;
  confidence: number;
}
```

## Testausominaisuudet

### ✅ Toimii ilman ulkoisia API:ja

- OpenAI API calls disabled
- Google Places API disabled
- Web scraping disabled
- Kaikki toiminnallisuudet mock-datalla

### ✅ Kattava testaus

- Competitor data generation and validation
- Customer review analysis
- ICP generation with demographics
- Campaign creation and export

### ✅ Real-time feedback

- Test logs näyttävät prosessin vaiheet
- Loading states simuloidaan
- Error handling testattu

### ✅ Data export

- JSON-muodossa export
- Testidataa voi tallentaa
- Tulokset voi jakaa

## Kehitysympäristön testaus

### 1. **Lokalisointi**

```typescript
// Suomalaiset arvostelut
const finnishReviews = [
  'Erinomainen palvelu! 35-vuotias yrittäjänä Helsingissä...',
  'Hyvä kokemus, mutta hinnat olisivat voineet olla hieman edullisemmat...',
];
```

### 2. **Demografian analyysi**

```typescript
// Regex-patternit suomalaisille demografioille
const patterns = {
  age: /(\d{1,2})v|(\d{1,2})-(\d{1,2})v|(\d{1,2})vuotias/gi,
  gender: /(naisena|miehenä|tyttö|poika|nainen|mies)/gi,
  location: /(Helsingissä|Tampereella|Turussa|Oulussa|pääkaupunkiseutu)/gi,
};
```

### 3. **Kilpailija-analyysi**

```typescript
// Simuloidut SWOT-analyysit
const mockAnalysis = {
  strengths: ['Strong brand recognition', 'Comprehensive feature set'],
  weaknesses: ['High pricing', 'Complex onboarding'],
  opportunities: ['Growing demand', 'New markets'],
  threats: ['New competitors', 'Economic downturn'],
};
```

## Suorituskyvyn testaus

### API delay simulation

```typescript
// Simuloi todellisia API-kutsuja
await TestUtils.simulateAPIDelay(1000); // 1 sekunti
```

### Data validation

```typescript
// Tarkista data ennen käsittelyä
const isValid = TestUtils.validateCompetitorData(competitor);
const isValidReview = TestUtils.validateReviewData(review);
```

### Error handling

```typescript
// Testaa virhetilanteet
try {
  await generateICPs();
} catch (error) {
  console.error('Test failed:', error);
}
```

## Yhteenveto

Tämä ohjelma on suunniteltu testattavaksi ilman ulkoisia API:ja:

1. **Kaikki toiminnallisuudet toimivat mock-datalla**
2. **TestMode-komponentti tarjoaa kattavan testausympäristön**
3. **Real-time feedback testausprosessista**
4. **Data export ja jakaminen**
5. **Suomalainen lokalisointi ja demografia**

Testaa sovellusta avaamalla "Test Mode" -välilehti ja klikkaamalla "Quick Test" tai "Full Test"!
