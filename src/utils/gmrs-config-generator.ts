/**
 * Google Maps Reviews Scraper Configuration Generator
 * Generates dynamic configurations for different company names and locations
 */

export interface GMRSConfigOptions {
  companyName: string;
  location?: string;
  city?: string;
  country?: string;
  maxReviews?: number;
  language?: string;
  includeBusinessInfo?: boolean;
  includePhotos?: boolean;
  personalData?: boolean;
  maxRequestRetries?: number;
  requestTimeoutSecs?: number;
}

export interface GMRSConfig {
  searchStringsArray: string[];
  maxCrawledPlaces: number;
  includeReviews: boolean;
  maxReviews: number;
  reviewsLanguage: string;
  reviewsSort: string;
  includeBusinessInfo: boolean;
  includePhotos: boolean;
  personalData: boolean;
  headless: boolean;
  language: string;
  maxConcurrency: number;
  maxRequestRetries: number;
  requestTimeoutSecs: number;
  proxyConfiguration: {
    useApifyProxy: boolean;
    apifyProxyGroups: string[];
  };
}

/**
 * Generate a Google Maps Reviews Scraper configuration for a specific company
 */
export function generateGMRSConfig(options: GMRSConfigOptions): GMRSConfig {
  const {
    companyName,
    location = 'United States',
    city,
    country,
    maxReviews = 20,
    language = 'en',
    includeBusinessInfo = true,
    includePhotos = false,
    personalData = true,
    maxRequestRetries = 5,
    requestTimeoutSecs = 180,
  } = options;

  // Build search string with location context
  let searchString = companyName;

  if (city && country) {
    searchString = `${companyName} ${city} ${country}`;
  } else if (city) {
    searchString = `${companyName} ${city}`;
  } else if (country) {
    searchString = `${companyName} ${country}`;
  } else if (location && location !== 'United States') {
    searchString = `${companyName} ${location}`;
  }

  return {
    searchStringsArray: [searchString],
    maxCrawledPlaces: 1,
    includeReviews: true,
    maxReviews,
    reviewsLanguage: 'all',
    reviewsSort: 'newest',
    includeBusinessInfo,
    includePhotos,
    personalData,
    headless: true,
    language,
    maxConcurrency: 1,
    maxRequestRetries,
    requestTimeoutSecs,
    proxyConfiguration: {
      useApifyProxy: true,
      apifyProxyGroups: ['RESIDENTIAL'],
    },
  };
}

/**
 * Generate configuration for multiple companies
 */
export function generateBatchGMRSConfig(
  companies: Array<{
    name: string;
    location?: string;
    city?: string;
    country?: string;
  }>,
  options: Partial<GMRSConfigOptions> = {},
): GMRSConfig[] {
  return companies.map((company) =>
    generateGMRSConfig({
      companyName: company.name,
      location: company.location,
      city: company.city,
      country: company.country,
      ...options,
    }),
  );
}

/**
 * Generate configuration from a template with placeholders
 */
export function generateFromTemplate(
  template: GMRSConfig,
  replacements: Record<string, string>,
): GMRSConfig {
  const config = JSON.parse(JSON.stringify(template));

  // Replace placeholders in searchStringsArray
  if (config.searchStringsArray) {
    config.searchStringsArray = config.searchStringsArray.map(
      (searchString: string) => {
        let result = searchString;
        Object.entries(replacements).forEach(([key, value]) => {
          result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
        });
        return result;
      },
    );
  }

  return config;
}

/**
 * Validate GMRS configuration
 */
export function validateGMRSConfig(config: GMRSConfig): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!config.searchStringsArray || config.searchStringsArray.length === 0) {
    errors.push('searchStringsArray is required and cannot be empty');
  }

  if (config.maxReviews < 1 || config.maxReviews > 50) {
    errors.push('maxReviews must be between 1 and 50');
  }

  if (config.maxRequestRetries < 1 || config.maxRequestRetries > 10) {
    errors.push('maxRequestRetries must be between 1 and 10');
  }

  if (config.requestTimeoutSecs < 30 || config.requestTimeoutSecs > 600) {
    errors.push('requestTimeoutSecs must be between 30 and 600 seconds');
  }

  if (!config.proxyConfiguration?.useApifyProxy) {
    errors.push('Apify proxy configuration is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get default configuration template
 */
export function getDefaultGMRSConfig(): GMRSConfig {
  return {
    searchStringsArray: ['{{COMPANY_NAME}} {{LOCATION}}'],
    maxCrawledPlaces: 1,
    includeReviews: true,
    maxReviews: 20,
    reviewsLanguage: 'all',
    reviewsSort: 'newest',
    includeBusinessInfo: true,
    includePhotos: false,
    personalData: false,
    headless: true,
    language: 'en',
    maxConcurrency: 1,
    maxRequestRetries: 5,
    requestTimeoutSecs: 180,
    proxyConfiguration: {
      useApifyProxy: true,
      apifyProxyGroups: ['RESIDENTIAL'],
    },
  };
}

/**
 * Example usage functions
 */
export const GMRSExamples = {
  // Example: Single company configuration
  singleCompany: (companyName: string, location?: string) =>
    generateGMRSConfig({ companyName, location }),

  // Example: Finnish company with specific location
  finnishCompany: (companyName: string, city?: string) =>
    generateGMRSConfig({
      companyName,
      country: 'Finland',
      city,
      language: 'fi',
      maxReviews: 30,
    }),

  // Example: US company with city and state
  usCompany: (companyName: string, city: string, state: string) =>
    generateGMRSConfig({
      companyName,
      city: `${city}, ${state}`,
      country: 'United States',
      maxReviews: 40,
    }),

  // Example: European company
  europeanCompany: (companyName: string, country: string) =>
    generateGMRSConfig({
      companyName,
      country,
      language: 'en',
      maxReviews: 35,
    }),
};
