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

      // 1. Google Reviews API
      if (this.apiKey) {
        try {
          const googleReviews = await this.fetchGoogleReviews(
            placeId,
            Math.ceil(maxResults * 0.4),
          );
          allReviews.push(...googleReviews);
        } catch (error) {
          console.error('Failed to fetch Google reviews:', error);
        }
      }

      // 2. Trustpilot API
      try {
        const trustpilotReviews = await this.fetchTrustpilotReviews(
          placeId,
          Math.ceil(maxResults * 0.3),
        );
        allReviews.push(...trustpilotReviews);
      } catch (error) {
        console.error('Failed to fetch Trustpilot reviews:', error);
      }

      // 3. Yelp API
      try {
        const yelpReviews = await this.fetchYelpReviews(
          placeId,
          Math.ceil(maxResults * 0.2),
        );
        allReviews.push(...yelpReviews);
      } catch (error) {
        console.error('Failed to fetch Yelp reviews:', error);
      }

      // 4. Facebook Reviews API
      try {
        const facebookReviews = await this.fetchFacebookReviews(
          placeId,
          Math.ceil(maxResults * 0.1),
        );
        allReviews.push(...facebookReviews);
      } catch (error) {
        console.error('Failed to fetch Facebook reviews:', error);
      }

      return allReviews.slice(0, maxResults);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return [];
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
            helpful: review.rating * 2, // Simuloidaan helpful-laskenta
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

  // LLM:llä demografisten tietojen poiminta
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
    } catch (error) {
      console.error('Error extracting demographics:', error);
      return {};
    }
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

  // Analysoi reviews demografian kannalta
  analyzeReviewsForDemographics(reviews: GoogleReview[]): {
    agePatterns: string[];
    genderPatterns: string[];
    locationPatterns: string[];
    sentimentAnalysis: { positive: number; neutral: number; negative: number };
    sourceBreakdown: { [key: string]: number };
  } {
    const reviewTexts = reviews.map((r) => r.text).join(' ');

    // Demografian regex-patternit
    const patterns = {
      age: /(\d{1,2})v|(\d{1,2})-(\d{1,2})v|(\d{1,2})vuotias|(\d{1,2})vuoden/gi,
      gender: /(naisena|miehenä|tyttö|poika|nainen|mies|tytön|pojan)/gi,
      location:
        /(Helsingissä|Tampereella|Turussa|Oulussa|pääkaupunkiseutu|Espoossa|Vantaalla)/gi,
    };

    const ageMatches = reviewTexts.match(patterns.age) || [];
    const genderMatches = reviewTexts.match(patterns.gender) || [];
    const locationMatches = reviewTexts.match(patterns.location) || [];

    // Yksinkertainen sentiment-analyysi
    const positiveWords = [
      'hyvä',
      'erinomainen',
      'loistava',
      'suosittelen',
      'tyytyväinen',
    ];
    const negativeWords = ['huono', 'huonoa', 'pettymys', 'ongelma', 'virhe'];

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

    // Lähdejakauma
    const sourceBreakdown: { [key: string]: number } = {};
    reviews.forEach((review) => {
      const source = review.source || 'Unknown';
      sourceBreakdown[source] = (sourceBreakdown[source] || 0) + 1;
    });

    return {
      agePatterns: [...new Set(ageMatches)],
      genderPatterns: [...new Set(genderMatches)],
      locationPatterns: [...new Set(locationMatches)],
      sentimentAnalysis: { positive, neutral, negative },
      sourceBreakdown,
    };
  }
}
