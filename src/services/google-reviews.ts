import axios from 'axios';

// API response interfaces
interface GoogleReviewResponse {
  time: number;
  author_name: string;
  rating: number;
  text: string;
}

interface TrustpilotReviewResponse {
  id: string;
  stars: number;
  text: string;
  createdAt: string;
  helpful?: number;
  consumer: {
    displayName: string;
  };
}

interface YelpReviewResponse {
  id: string;
  rating: number;
  text: string;
  time_created: string;
  useful?: number;
  user: {
    name: string;
  };
}

interface FacebookReviewResponse {
  id: string;
  rating: number;
  review_text?: string;
  created_time: string;
  reviewer: {
    name: string;
  };
}

export interface GoogleReview {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  helpful: number;
  language: string;
  source?: string; // Lisätty lähde (Google, Trustpilot, Yelp, jne.)
  demographics?: {
    age?: number;
    gender?: 'male' | 'female' | 'other';
    location?: string;
    occupation?: string;
  };
}

export interface GooglePlaceData {
  placeId: string;
  name: string;
  address: string;
  rating: number;
  totalReviews: number;
  reviews: GoogleReview[];
  categories: string[];
  website?: string;
  phone?: string;
}

export class GoogleReviewsService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // Hae paikan tiedot Google Places API:sta
  async getPlaceData(placeId: string): Promise<GooglePlaceData | null> {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,rating,user_ratings_total,website,formatted_phone_number,types&key=${this.apiKey}`,
      );

      if (response.data.status === 'OK') {
        const place = response.data.result;
        return {
          placeId,
          name: place.name,
          address: place.formatted_address,
          rating: place.rating || 0,
          totalReviews: place.user_ratings_total || 0,
          reviews: [],
          categories: place.types || [],
          website: place.website,
          phone: place.formatted_phone_number,
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching place data:', error);
      return null;
    }
  }

  // Hae reviews useista lähteistä (10 reviewa per yritys)
  async getReviews(
    placeId: string,
    maxResults: number = 10,
  ): Promise<GoogleReview[]> {
    try {
      const allReviews: GoogleReview[] = [];
      const errors: string[] = [];

      // 1. Google Reviews API
      if (this.apiKey) {
        try {
          const googleReviews = await this.fetchGoogleReviews(
            placeId,
            Math.ceil(maxResults * 0.4),
          );
          allReviews.push(...googleReviews);
        } catch (error) {
          const errorMsg = `Google Reviews API failed: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`;
          console.error(errorMsg);
          errors.push(errorMsg);
        }
      } else {
        errors.push('Google API key not provided');
      }

      // 2. Trustpilot API (currently disabled - requires separate setup)
      // Note: Trustpilot requires business unit ID, not Google place ID
      /*
      try {
        const trustpilotReviews = await this.fetchTrustpilotReviews(
          placeId,
          Math.ceil(maxResults * 0.3),
        );
        allReviews.push(...trustpilotReviews);
      } catch (error) {
        const errorMsg = `Trustpilot API failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
      */

      // 3. Yelp API (currently disabled - requires business ID mapping)
      /*
      try {
        const yelpReviews = await this.fetchYelpReviews(
          placeId,
          Math.ceil(maxResults * 0.2),
        );
        allReviews.push(...yelpReviews);
      } catch (error) {
        const errorMsg = `Yelp API failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
      */

      // 4. Facebook Reviews API (currently disabled - requires business page mapping)
      /*
      try {
        const facebookReviews = await this.fetchFacebookReviews(
          placeId,
          Math.ceil(maxResults * 0.1),
        );
        allReviews.push(...facebookReviews);
      } catch (error) {
        const errorMsg = `Facebook API failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
      */

      // If no reviews were fetched, generate mock data for testing
      if (allReviews.length === 0) {
        console.warn(
          'No reviews fetched from APIs, generating mock data for testing',
        );
        const mockReviews = await this.generateMockReviews(maxResults);
        allReviews.push(...mockReviews);
      }

      // Log any errors but don't fail completely
      if (errors.length > 0) {
        console.warn('Some review sources failed:', errors);
      }

      return allReviews.slice(0, maxResults);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      // Return mock data as fallback
      return this.generateMockReviews(maxResults);
    }
  }

  // Google Reviews API
  private async fetchGoogleReviews(
    placeId: string,
    maxResults: number,
  ): Promise<GoogleReview[]> {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews&key=${this.apiKey}`,
      );

      if (response.data.status === 'OK' && response.data.result.reviews) {
        const reviews = response.data.result.reviews
          .slice(0, maxResults)
          .map(async (review: GoogleReviewResponse) => ({
            id: `google-${review.time}`,
            author: review.author_name,
            rating: review.rating,
            text: review.text,
            date: new Date(review.time * 1000).toISOString().split('T')[0],
            helpful: 0, // Will be populated if available from API response
            language: 'fi',
            source: 'Google',
            demographics: await this.extractDemographics(
              review.text,
              review.author_name,
            ),
          }));
        return Promise.all(reviews);
      }
      return [];
    } catch (error) {
      console.error('Error fetching Google reviews:', error);
      return [];
    }
  }

  // Trustpilot API
  private async fetchTrustpilotReviews(
    placeId: string,
    maxResults: number,
  ): Promise<GoogleReview[]> {
    try {
      // Trustpilot API vaatii erillisen API-avaimen
      const response = await axios.get(
        `https://api.trustpilot.com/v1/business-units/${placeId}/reviews`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        },
      );

      const reviews = response.data.reviews
        .slice(0, maxResults)
        .map(async (review: TrustpilotReviewResponse) => ({
          id: `trustpilot-${review.id}`,
          author: review.consumer.displayName,
          rating: review.stars,
          text: review.text,
          date: review.createdAt.split('T')[0],
          helpful: review.helpful || 0,
          language: 'fi',
          source: 'Trustpilot',
          demographics: await this.extractDemographics(
            review.text,
            review.consumer.displayName,
          ),
        }));
      return Promise.all(reviews);
    } catch (error) {
      console.error('Error fetching Trustpilot reviews:', error);
      return [];
    }
  }

  // Yelp API
  private async fetchYelpReviews(
    placeId: string,
    maxResults: number,
  ): Promise<GoogleReview[]> {
    try {
      const response = await axios.get(
        `https://api.yelp.com/v3/businesses/${placeId}/reviews`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        },
      );

      const reviews = response.data.reviews
        .slice(0, maxResults)
        .map(async (review: YelpReviewResponse) => ({
          id: `yelp-${review.id}`,
          author: review.user.name,
          rating: review.rating,
          text: review.text,
          date: review.time_created.split('T')[0],
          helpful: review.useful || 0,
          language: 'fi',
          source: 'Yelp',
          demographics: await this.extractDemographics(
            review.text,
            review.user.name,
          ),
        }));
      return Promise.all(reviews);
    } catch (error) {
      console.error('Error fetching Yelp reviews:', error);
      return [];
    }
  }

  // Facebook Reviews API
  private async fetchFacebookReviews(
    placeId: string,
    maxResults: number,
  ): Promise<GoogleReview[]> {
    try {
      const response = await axios.get(
        `https://graph.facebook.com/v18.0/${placeId}/ratings`,
        {
          params: {
            access_token: this.apiKey,
            fields: 'rating,review_text,created_time,reviewer',
          },
        },
      );

      const reviews = response.data.data
        .slice(0, maxResults)
        .map(async (review: FacebookReviewResponse) => ({
          id: `facebook-${review.id}`,
          author: review.reviewer.name,
          rating: review.rating,
          text: review.review_text || '',
          date: review.created_time.split('T')[0],
          helpful: 0,
          language: 'fi',
          source: 'Facebook',
          demographics: await this.extractDemographics(
            review.review_text || '',
            review.reviewer.name,
          ),
        }));
      return Promise.all(reviews);
    } catch (error) {
      console.error('Error fetching Facebook reviews:', error);
      return [];
    }
  }

  // Generate mock reviews for testing when APIs fail
  private async generateMockReviews(count: number): Promise<GoogleReview[]> {
    const mockReviews = [
      {
        author: 'Maria Virtanen',
        rating: 5,
        text: 'Erinomainen palvelu! Henkilökunta oli erittäin ystävällistä ja asiantuntevaa. Suosittelen lämpimästi.',
        demographics: {
          age: 34,
          gender: 'female' as const,
          location: 'Helsinki',
          occupation: 'Marketing Manager',
        },
      },
      {
        author: 'Jukka Mäkelä',
        rating: 4,
        text: 'Hyvä kokemus kaiken kaikkiaan. Ainoa miinus oli hieman pitkä odotusaika, mutta lopputulos oli hyvä.',
        demographics: {
          age: 45,
          gender: 'male' as const,
          location: 'Tampere',
          occupation: 'Engineer',
        },
      },
      {
        author: 'Anna Korhonen',
        rating: 5,
        text: 'Erittäin tyytyväinen ostokseeni! Tuote vastasi täysin odotuksia ja toimitus oli nopea.',
        demographics: {
          age: 28,
          gender: 'female' as const,
          location: 'Turku',
          occupation: 'Teacher',
        },
      },
      {
        author: 'Mikael Lindqvist',
        rating: 3,
        text: 'Keskiverto kokemus. Hinta-laatusuhde voisi olla parempi, mutta palvelu oli ok.',
        demographics: {
          age: 52,
          gender: 'male' as const,
          location: 'Helsinki',
          occupation: 'Sales Director',
        },
      },
      {
        author: 'Liisa Hakkarainen',
        rating: 5,
        text: 'Loistava asiakaspalvelu! Henkilökunta osasi neuvoa hyvin ja ratkaisut olivat innovatiivisia.',
        demographics: {
          age: 38,
          gender: 'female' as const,
          location: 'Oulu',
          occupation: 'IT Consultant',
        },
      },
      {
        author: 'Petri Saarinen',
        rating: 4,
        text: 'Hyvä yritys, ammattitaitoinen henkilökunta. Pienet parannukset toimitusaikaan olisivat plussaa.',
        demographics: {
          age: 41,
          gender: 'male' as const,
          location: 'Jyväskylä',
          occupation: 'Project Manager',
        },
      },
      {
        author: 'Sanna Virtala',
        rating: 5,
        text: 'Ehdottomasti paras kokemus alalla! Suosittelen kaikille ystävilleni.',
        demographics: {
          age: 29,
          gender: 'female' as const,
          location: 'Espoo',
          occupation: 'UX Designer',
        },
      },
      {
        author: 'Kari Nieminen',
        rating: 2,
        text: 'Valitettavasti kokemus ei vastannut odotuksia. Palvelussa oli puutteita.',
        demographics: {
          age: 35,
          gender: 'male' as const,
          location: 'Vantaa',
          occupation: 'Operations Manager',
        },
      },
      {
        author: 'Elina Järvinen',
        rating: 4,
        text: 'Kiitettävä palvelu ja laatu. Hintaa voisi tarkistaa hieman alaspäin.',
        demographics: {
          age: 43,
          gender: 'female' as const,
          location: 'Lahti',
          occupation: 'HR Manager',
        },
      },
      {
        author: 'Timo Heikkinen',
        rating: 5,
        text: 'Erinomainen! Henkilökohtainen palvelu ja nopea toimitus. Tilaan varmasti uudelleen.',
        demographics: {
          age: 36,
          gender: 'male' as const,
          location: 'Kuopio',
          occupation: 'Business Analyst',
        },
      },
    ];

    return mockReviews.slice(0, count).map((review, index) => ({
      id: `mock-${Date.now()}-${index}`,
      author: review.author,
      rating: review.rating,
      text: review.text,
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      helpful: Math.floor(Math.random() * 10),
      language: 'fi',
      source: 'Mock Data',
      demographics: review.demographics,
    }));
  }

  // Enhanced demographic extraction with multiple methods and fallbacks
  private async extractDemographics(
    text: string,
    authorName: string,
  ): Promise<{
    age?: number;
    gender?: 'male' | 'female' | 'other';
    location?: string;
    occupation?: string;
  }> {
    try {
      // First try pattern-based extraction
      const patternDemographics = this.extractDemographicsFromPatterns(
        text,
        authorName,
      );

      // Try LLM extraction if available
      let llmDemographics: {
        age?: number;
        gender?: 'male' | 'female' | 'other';
        location?: string;
        occupation?: string;
      } = {};
      try {
        llmDemographics = await this.extractDemographicsWithLLM(
          text,
          authorName,
        );
      } catch (llmError) {
        console.warn(
          'LLM demographic extraction failed, using pattern-based fallback:',
          llmError,
        );
      }

      // Merge results, preferring LLM data when available
      return {
        age: llmDemographics.age || patternDemographics.age,
        gender: llmDemographics.gender || patternDemographics.gender,
        location: llmDemographics.location || patternDemographics.location,
        occupation:
          llmDemographics.occupation || patternDemographics.occupation,
      };
    } catch (error) {
      console.error('Error extracting demographics:', error);
      // Return basic estimation based on name patterns
      return this.extractDemographicsFromPatterns(text, authorName);
    }
  }

  // Pattern-based demographic extraction as fallback
  private extractDemographicsFromPatterns(
    text: string,
    authorName: string,
  ): {
    age?: number;
    gender?: 'male' | 'female' | 'other';
    location?: string;
    occupation?: string;
  } {
    const demographics: {
      age?: number;
      gender?: 'male' | 'female' | 'other';
      location?: string;
      occupation?: string;
    } = {};

    // Gender estimation from Finnish names
    const femaleNames = [
      'Maria',
      'Anna',
      'Liisa',
      'Sanna',
      'Elina',
      'Tarja',
      'Päivi',
      'Tuula',
      'Arja',
      'Marja',
    ];
    const maleNames = [
      'Jukka',
      'Mikael',
      'Petri',
      'Kari',
      'Timo',
      'Matti',
      'Pekka',
      'Juha',
      'Markku',
      'Antti',
    ];

    const firstName = authorName.split(' ')[0];
    if (femaleNames.some((name) => firstName.includes(name))) {
      demographics.gender = 'female';
    } else if (maleNames.some((name) => firstName.includes(name))) {
      demographics.gender = 'male';
    }

    // Location extraction from text
    const locationPatterns =
      /(Helsinki|Tampere|Turku|Oulu|Jyväskylä|Kuopio|Lahti|Espoo|Vantaa|Pori|Joensuu|Lappeenranta|Hämeenlinna|Vaasa|Seinäjoki|Rovaniemi|Kotka|Salo|Porvoo|Kouvola)/gi;
    const locationMatch = text.match(locationPatterns);
    if (locationMatch) {
      demographics.location = locationMatch[0];
    }

    // Age estimation from text content complexity and topics
    const youthIndicators =
      /opiskelija|yliopisto|koulu|bileiss|party|festari/gi;
    const middleAgeIndicators = /perhe|lapsi|asunto|auto|työ|ura|laina/gi;
    const seniorIndicators = /eläke|lapsenlapsi|terveyd|sairaus/gi;

    if (text.match(youthIndicators)) {
      demographics.age = 22 + Math.floor(Math.random() * 8); // 22-30
    } else if (text.match(middleAgeIndicators)) {
      demographics.age = 30 + Math.floor(Math.random() * 20); // 30-50
    } else if (text.match(seniorIndicators)) {
      demographics.age = 55 + Math.floor(Math.random() * 15); // 55-70
    } else {
      // Default range
      demographics.age = 25 + Math.floor(Math.random() * 30); // 25-55
    }

    return demographics;
  }

  // LLM-based demographic extraction
  private async extractDemographicsWithLLM(
    text: string,
    authorName: string,
  ): Promise<{
    age?: number;
    gender?: 'male' | 'female' | 'other';
    location?: string;
    occupation?: string;
  }> {
    const prompt = `Analysoi seuraavan review:n ja kirjoittajan nimen perusteella demografiset tiedot:

Teksti: "${text}"
Kirjoittaja: "${authorName}"

Vastaa JSON-muodossa:
{
  "age": ikä numeroina (esim. 25-45 väliltä),
  "gender": "male", "female" tai "other",
  "location": kaupunki tai alue,
  "occupation": ammatti tai työtehtävä
}

Jos et voi päätellä jotain tietoa, jätä kenttä tyhjäksi.`;

    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama2:7b',
        prompt: prompt,
        stream: false,
      }),
    });

    const data = await response.json();
    const demographics = JSON.parse(data.response);

    return {
      age: demographics.age,
      gender: demographics.gender,
      location: demographics.location,
      occupation: demographics.occupation,
    };
  }

  // Etsi paikkoja nimen perusteella
  async searchPlaces(
    query: string,
  ): Promise<Array<{ placeId: string; name: string; address: string }>> {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
          query,
        )}&key=${this.apiKey}`,
      );

      if (response.data.status === 'OK') {
        return response.data.results.map(
          (place: {
            place_id: string;
            name: string;
            formatted_address: string;
          }) => ({
            placeId: place.place_id,
            name: place.name,
            address: place.formatted_address,
          }),
        );
      }
      return [];
    } catch (error) {
      console.error('Error searching places:', error);
      return [];
    }
  }

  // Enhanced analysis for ICP generation
  analyzeReviewsForICP(reviews: GoogleReview[]): {
    demographics: {
      agePatterns: string[];
      genderPatterns: string[];
      locationPatterns: string[];
      occupationPatterns: string[];
    };
    sentimentAnalysis: { positive: number; neutral: number; negative: number };
    sourceBreakdown: { [key: string]: number };
    painPoints: string[];
    buyingTriggers: string[];
    valuePropositions: string[];
    customerJourney: {
      awareness: string[];
      consideration: string[];
      decision: string[];
      retention: string[];
    };
    businessContext: {
      businessSize: string[];
      industry: string[];
      budget: string[];
    };
  } {
    const reviewTexts = reviews.map((r) => r.text).join(' ');

    // Demografian regex-patternit
    const patterns = {
      age: /(\d{1,2})v|(\d{1,2})-(\d{1,2})v|(\d{1,2})vuotias|(\d{1,2})vuoden/gi,
      gender: /(naisena|miehenä|tyttö|poika|nainen|mies|tytön|pojan)/gi,
      location:
        /(Helsinki|Tampere|Turku|Oulu|Jyväskylä|Kuopio|Lahti|Espoo|Vantaa|Pori|Joensuu|Lappeenranta|Hämeenlinna|Vaasa|Seinäjoki|Rovaniemi|Kotka|Salo|Porvoo|Kouvola)/gi,
      occupation:
        /(johtaja|manager|konsultti|insinööri|opettaja|myyjä|asiantuntija|toimitusjohtaja|kehittäjä|suunnittelija|analyytikko|koordinaattori)/gi,
    };

    const ageMatches = reviewTexts.match(patterns.age) || [];
    const genderMatches = reviewTexts.match(patterns.gender) || [];
    const locationMatches = reviewTexts.match(patterns.location) || [];
    const occupationMatches = reviewTexts.match(patterns.occupation) || [];

    // Pain points extraction
    const painPointPatterns = [
      /ongelma|vaikeus|haaste|pettymys|huono|epäonnistui|virhe|puute|hidasta|kallis|monimutkaine/gi,
      /ei toimi|ei vastaa|liian|riittämätön|epäselvä|sekava/gi,
    ];
    const painPoints = painPointPatterns.flatMap((pattern) =>
      (reviewTexts.match(pattern) || []).slice(0, 5),
    );

    // Buying triggers extraction
    const buyingTriggerPatterns = [
      /suosittelen|ostaisin uudelleen|paras|erinomainen|nopea|tehokas|helpp|edullinen|laadukas/gi,
      /ratkaisu|hyöty|säästää|nopeuttaa|parantaa|helpottaa|kannattava|luotettava/gi,
    ];
    const buyingTriggers = buyingTriggerPatterns.flatMap((pattern) =>
      (reviewTexts.match(pattern) || []).slice(0, 5),
    );

    // Value propositions extraction
    const valuePropositionPatterns = [
      /arvosta|hyöty|etu|säästö|tehokkuus|laatu|palvelu|tuki|nopeus|helppous/gi,
      /innovatiivinen|ainutlaatuinen|erikoistuu|ammattilainen|asiantunteva/gi,
    ];
    const valuePropositions = valuePropositionPatterns.flatMap((pattern) =>
      (reviewTexts.match(pattern) || []).slice(0, 5),
    );

    // Customer journey insights
    const customerJourney = {
      awareness: this.extractJourneyPhase(reviews, [
        'löysin|huomasin|kuulin|sain tietää|tutustuin',
      ]),
      consideration: this.extractJourneyPhase(reviews, [
        'vertailin|harkitsin|tutkin|selvittelin|kyselin',
      ]),
      decision: this.extractJourneyPhase(reviews, [
        'valitsin|ostin|päätiin|tilasi|hankki',
      ]),
      retention: this.extractJourneyPhase(reviews, [
        'jatkan|palaan|suosittelen|uudelleen|uskollinen',
      ]),
    };

    // Business context extraction
    const businessContext = {
      businessSize: this.extractBusinessSize(reviews),
      industry: this.extractIndustry(reviews),
      budget: this.extractBudgetIndicators(reviews),
    };

    // Enhanced sentiment analysis
    const positiveWords = [
      'hyvä',
      'erinomainen',
      'loistava',
      'suosittelen',
      'tyytyväinen',
      'täydellinen',
      'ihana',
      'mahtava',
      'upea',
      'kiitos',
    ];
    const negativeWords = [
      'huono',
      'huonoa',
      'pettymys',
      'ongelma',
      'virhe',
      'kauhea',
      'hirveä',
      'suru',
      'ikävä',
      'valitus',
    ];

    let positive = 0,
      neutral = 0,
      negative = 0;

    reviews.forEach((review) => {
      const text = review.text.toLowerCase();
      const positiveCount = positiveWords.filter((word) =>
        text.includes(word),
      ).length;
      const negativeCount = negativeWords.filter((word) =>
        text.includes(word),
      ).length;

      if (positiveCount > negativeCount) positive++;
      else if (negativeCount > positiveCount) negative++;
      else neutral++;
    });

    // Source breakdown
    const sourceBreakdown: { [key: string]: number } = {};
    reviews.forEach((review) => {
      const source = review.source || 'Unknown';
      sourceBreakdown[source] = (sourceBreakdown[source] || 0) + 1;
    });

    return {
      demographics: {
        agePatterns: [...new Set(ageMatches)],
        genderPatterns: [...new Set(genderMatches)],
        locationPatterns: [...new Set(locationMatches)],
        occupationPatterns: [...new Set(occupationMatches)],
      },
      sentimentAnalysis: { positive, neutral, negative },
      sourceBreakdown,
      painPoints: [...new Set(painPoints)],
      buyingTriggers: [...new Set(buyingTriggers)],
      valuePropositions: [...new Set(valuePropositions)],
      customerJourney,
      businessContext,
    };
  }

  // Helper method to extract customer journey phase indicators
  private extractJourneyPhase(
    reviews: GoogleReview[],
    patterns: string[],
  ): string[] {
    const matches: string[] = [];
    reviews.forEach((review) => {
      patterns.forEach((pattern) => {
        const regex = new RegExp(pattern, 'gi');
        const phaseMatches = review.text.match(regex) || [];
        matches.push(...phaseMatches);
      });
    });
    return [...new Set(matches)].slice(0, 3);
  }

  // Extract business size indicators
  private extractBusinessSize(reviews: GoogleReview[]): string[] {
    const patterns = [
      /pieni yritys|startup|pk-yritys|mikroyritys/gi,
      /keskisuuri|kasvuyritys|20-50 henk/gi,
      /suuri yritys|konserni|multinational|yli 500/gi,
    ];

    const allText = reviews.map((r) => r.text).join(' ');
    return patterns
      .flatMap((pattern) => allText.match(pattern) || [])
      .slice(0, 3);
  }

  // Extract industry indicators
  private extractIndustry(reviews: GoogleReview[]): string[] {
    const patterns = [
      /teknologia|IT|ohjelmisto|tech|startup/gi,
      /terveys|lääkäri|sairaala|hoiva/gi,
      /rahoitus|pankki|vakuutus|sijoitus/gi,
      /kauppa|myynti|retail|verkkokauppa/gi,
      /teollisuus|tuotanto|valmistus/gi,
      /palvelu|konsultointi|asiakaspalvelu/gi,
    ];

    const allText = reviews.map((r) => r.text).join(' ');
    return patterns
      .flatMap((pattern) => allText.match(pattern) || [])
      .slice(0, 3);
  }

  // Extract budget/price sensitivity indicators
  private extractBudgetIndicators(reviews: GoogleReview[]): string[] {
    const patterns = [
      /halpa|edullinen|budjetti|säästö/gi,
      /keskihinta|kohtuullinen|sopiva hinta/gi,
      /kallis|premium|laadukas|investointi/gi,
    ];

    const allText = reviews.map((r) => r.text).join(' ');
    return patterns
      .flatMap((pattern) => allText.match(pattern) || [])
      .slice(0, 3);
  }

  // Legacy method for backwards compatibility
  analyzeReviewsForDemographics(reviews: GoogleReview[]): {
    agePatterns: string[];
    genderPatterns: string[];
    locationPatterns: string[];
    sentimentAnalysis: { positive: number; neutral: number; negative: number };
    sourceBreakdown: { [key: string]: number };
  } {
    const icpAnalysis = this.analyzeReviewsForICP(reviews);
    return {
      agePatterns: icpAnalysis.demographics.agePatterns,
      genderPatterns: icpAnalysis.demographics.genderPatterns,
      locationPatterns: icpAnalysis.demographics.locationPatterns,
      sentimentAnalysis: icpAnalysis.sentimentAnalysis,
      sourceBreakdown: icpAnalysis.sourceBreakdown,
    };
  }
}
