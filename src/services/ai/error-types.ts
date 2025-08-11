/**
 * Error types for AI services with detailed error information
 */

export interface AIServiceError {
  code: string;
  message: string;
  details?: Record<string, any>;
  originalError?: Error;
  timestamp: Date;
}

export interface ValidationResult {
  isValid: boolean;
  errors: AIServiceError[];
  warnings: string[];
}

export interface ICPGenerationError extends AIServiceError {
  code:
    | 'ICP_GENERATION_FAILED'
    | 'INVALID_INPUT_DATA'
    | 'LLM_UNAVAILABLE'
    | 'PARSING_FAILED';
  inputData?: {
    competitorCount: number;
    reviewCount: number;
    hasAdditionalContext: boolean;
  };
}

export interface ReviewCollectionError extends AIServiceError {
  code:
    | 'NO_REVIEWS_FOUND'
    | 'INVALID_WEBSITE'
    | 'NETWORK_ERROR'
    | 'VALIDATION_FAILED'
    | 'INVALID_COMPANY_NAME'
    | 'NO_API_KEY'
    | 'SERP_API_ERROR';
  source?: string;
  attemptedUrls?: string[];
}

export interface CompanySearchError extends AIServiceError {
  code:
    | 'COMPANY_NOT_FOUND'
    | 'INVALID_COMPANY_NAME'
    | 'LLM_SEARCH_FAILED'
    | 'VALIDATION_FAILED';
  searchTerms?: string[];
}

export class AIServiceErrorFactory {
  static createICPGenerationError(
    code: ICPGenerationError['code'],
    message: string,
    details?: Record<string, any>,
    originalError?: Error,
  ): ICPGenerationError {
    return {
      code,
      message,
      details,
      originalError,
      timestamp: new Date(),
    };
  }

  static createReviewCollectionError(
    code: ReviewCollectionError['code'],
    message: string,
    source?: string,
    attemptedUrls?: string[],
    originalError?: Error,
  ): ReviewCollectionError {
    return {
      code,
      message,
      source,
      attemptedUrls,
      originalError,
      timestamp: new Date(),
    };
  }

  static createCompanySearchError(
    code: CompanySearchError['code'],
    message: string,
    searchTerms?: string[],
    originalError?: Error,
  ): CompanySearchError {
    return {
      code,
      message,
      searchTerms,
      originalError,
      timestamp: new Date(),
    };
  }
}

export class InputValidator {
  static validateCompanyName(name: string): ValidationResult {
    const errors: AIServiceError[] = [];
    const warnings: string[] = [];

    if (!name || name.trim().length === 0) {
      errors.push({
        code: 'EMPTY_COMPANY_NAME',
        message: 'Company name cannot be empty',
        timestamp: new Date(),
      });
    }

    if (name && name.trim().length < 2) {
      errors.push({
        code: 'COMPANY_NAME_TOO_SHORT',
        message: 'Company name must be at least 2 characters long',
        timestamp: new Date(),
      });
    }

    if (name && /^[0-9]+$/.test(name.trim())) {
      errors.push({
        code: 'INVALID_COMPANY_NAME_FORMAT',
        message: 'Company name cannot be only numbers',
        timestamp: new Date(),
      });
    }

    if (name && name.length > 100) {
      warnings.push('Company name is unusually long');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  static validateWebsiteUrl(url: string): ValidationResult {
    const errors: AIServiceError[] = [];
    const warnings: string[] = [];

    if (!url || url.trim().length === 0) {
      return { isValid: true, errors: [], warnings: [] }; // Optional field
    }

    try {
      const urlObj = new URL(url);

      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        errors.push({
          code: 'INVALID_URL_PROTOCOL',
          message: 'URL must use HTTP or HTTPS protocol',
          timestamp: new Date(),
        });
      }

      if (urlObj.hostname.length === 0) {
        errors.push({
          code: 'INVALID_URL_HOSTNAME',
          message: 'URL must have a valid hostname',
          timestamp: new Date(),
        });
      }
    } catch (error) {
      errors.push({
        code: 'INVALID_URL_FORMAT',
        message: 'Invalid URL format',
        originalError: error as Error,
        timestamp: new Date(),
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  static validateICPGenerationInput(
    competitors: any[],
    additionalContext: string,
  ): ValidationResult {
    const errors: AIServiceError[] = [];
    const warnings: string[] = [];

    if (!competitors || competitors.length === 0) {
      errors.push({
        code: 'NO_COMPETITORS_PROVIDED',
        message: 'At least one competitor is required for ICP generation',
        timestamp: new Date(),
      });
    }

    if (competitors && competitors.length > 6) {
      warnings.push('More than 6 competitors may reduce analysis quality');
    }

    let validCompetitors = 0;
    competitors?.forEach((competitor, index) => {
      const nameValidation = this.validateCompanyName(competitor.name);
      if (nameValidation.isValid) {
        validCompetitors++;
      } else {
        errors.push({
          code: 'INVALID_COMPETITOR_DATA',
          message: `Competitor ${index + 1}: ${
            nameValidation.errors[0]?.message
          }`,
          timestamp: new Date(),
        });
      }
    });

    if (validCompetitors === 0) {
      errors.push({
        code: 'NO_VALID_COMPETITORS',
        message: 'No valid competitors found',
        timestamp: new Date(),
      });
    }

    if (additionalContext && additionalContext.length > 2000) {
      warnings.push('Additional context is very long and may be truncated');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}
