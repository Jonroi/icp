import axios from 'axios';

export interface GoogleReview {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  helpful: number;
  language: string;
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

  // Hae reviews Google Places API:sta (simuloidaan, koska API rajoitukset)
  async getReviews(
    _placeId: string,
    maxResults: number = 20,
  ): Promise<GoogleReview[]> {
    try {
      // Simuloidaan Google Reviews -dataa, koska Google Places API ei tarjoa reviews-rajapintaa
      // Todellisessa toteutuksessa käytettäisiin Google My Business API:a tai kolmannen osapuolen palvelua

      const mockReviews: GoogleReview[] = [
        {
          id: '1',
          author: 'Matti Virtanen',
          rating: 5,
          text: 'Erinomainen palvelu! Tuotteet olivat laadukkaita ja toimitus nopea. Suosittelen lämpimästi.',
          date: '2024-01-15',
          helpful: 12,
          language: 'fi',
        },
        {
          id: '2',
          author: 'Anna Korhonen',
          rating: 4,
          text: 'Hyvä kokemus, mutta hinnat olisivat voineet olla hieman edullisemmat. Muuten kaikki ok.',
          date: '2024-01-10',
          helpful: 8,
          language: 'fi',
        },
        {
          id: '3',
          author: 'Pekka Mäkinen',
          rating: 5,
          text: 'Yllättävän hyvä palvelu! Olin skeptinen aluksi, mutta nyt olen tyytyväinen asiakas.',
          date: '2024-01-08',
          helpful: 15,
          language: 'fi',
        },
        {
          id: '4',
          author: 'Liisa Järvinen',
          rating: 3,
          text: 'Ihan ok, mutta palvelu voisi olla nopeampi. Tuotteet laadukkaita.',
          date: '2024-01-05',
          helpful: 3,
          language: 'fi',
        },
        {
          id: '5',
          author: 'Jari Nieminen',
          rating: 5,
          text: 'Paras palvelu mitä olen kokenut! Suosittelen kaikille.',
          date: '2024-01-03',
          helpful: 20,
          language: 'fi',
        },
      ];

      return mockReviews.slice(0, maxResults);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return [];
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
        return response.data.results.map((place: unknown) => ({
          placeId: (place as { place_id: string }).place_id,
          name: (place as { name: string }).name,
          address: (place as { formatted_address: string }).formatted_address,
        }));
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

    return {
      agePatterns: [...new Set(ageMatches)],
      genderPatterns: [...new Set(genderMatches)],
      locationPatterns: [...new Set(locationMatches)],
      sentimentAnalysis: { positive, neutral, negative },
    };
  }
}
