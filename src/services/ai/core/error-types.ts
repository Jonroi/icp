/**
 * Error types for AI services with detailed error information
 */

export interface AIServiceError {
  type: string;
  message: string;
  details?: any;
  timestamp: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: AIServiceError[];
}

export interface ICPGenerationError extends AIServiceError {
  type: 'ICP_GENERATION_ERROR';
  companyData?: any;
  templateId?: string;
}

export class AIServiceErrorFactory {
  static createICPGenerationError(
    message: string,
    details?: any,
    companyData?: any,
    templateId?: string,
  ): ICPGenerationError {
    return {
      type: 'ICP_GENERATION_ERROR',
      message,
      details,
      companyData,
      templateId,
      timestamp: new Date().toISOString(),
    };
  }

  static createValidationError(message: string, details?: any): AIServiceError {
    return {
      type: 'VALIDATION_ERROR',
      message,
      details,
      timestamp: new Date().toISOString(),
    };
  }

  static createLLMError(message: string, details?: any): AIServiceError {
    return {
      type: 'LLM_ERROR',
      message,
      details,
      timestamp: new Date().toISOString(),
    };
  }
}

export class InputValidator {
  static validateCompanyData(companyData: any): ValidationResult {
    const errors: AIServiceError[] = [];

    if (!companyData) {
      errors.push(
        AIServiceErrorFactory.createValidationError('Company data is required'),
      );
      return { isValid: false, errors };
    }

    if (!companyData.name || companyData.name.trim() === '') {
      errors.push(
        AIServiceErrorFactory.createValidationError('Company name is required'),
      );
    }

    if (!companyData.industry || companyData.industry.trim() === '') {
      errors.push(
        AIServiceErrorFactory.createValidationError('Industry is required'),
      );
    }

    if (!companyData.targetMarket || companyData.targetMarket.trim() === '') {
      errors.push(
        AIServiceErrorFactory.createValidationError(
          'Target market is required',
        ),
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateICPTemplate(template: any): ValidationResult {
    const errors: AIServiceError[] = [];

    if (!template) {
      errors.push(
        AIServiceErrorFactory.createValidationError('ICP template is required'),
      );
      return { isValid: false, errors };
    }

    if (!template.id || template.id.trim() === '') {
      errors.push(
        AIServiceErrorFactory.createValidationError('Template ID is required'),
      );
    }

    if (!template.name || template.name.trim() === '') {
      errors.push(
        AIServiceErrorFactory.createValidationError(
          'Template name is required',
        ),
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
