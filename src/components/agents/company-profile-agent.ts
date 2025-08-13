import type { AgentConfig, AgentTool, FormFieldSuggestion } from './types';
import type { OwnCompany } from '@/services/project-service';

// Enhanced form-filling bot tools
const getCurrentFormDataTool: AgentTool = {
  name: 'get_current_form_data',
  description:
    'Get the current values of all form fields to understand what has been filled and calculate completion status',
  parameters: {},
  execute: async () => {
    try {
      const response = await fetch('/api/company-data', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('🤖 Form Bot: Current form data retrieved');

      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to get company data');
      }
    } catch (error) {
      console.error('Error getting current form data:', error);
      return {
        currentData: {} as OwnCompany,
        filledFields: [],
        nextField: 'name',
        isComplete: false,
        progress: { filled: 0, total: 18, percentage: 0 },
      };
    }
  },
};

const updateFormFieldTool: AgentTool = {
  name: 'update_form_field',
  description:
    'Update a specific form field with new value and validate the input',
  parameters: {
    field: 'string',
    value: 'string',
  },
  execute: async (params: { field: keyof OwnCompany; value: string }) => {
    try {
      // Validate the input before saving
      const validation = validateFieldInput(params.field, params.value);
      if (!validation.isValid) {
        return {
          success: false,
          field: params.field,
          value: params.value,
          message: validation.error,
          suggestion: validation.suggestion,
        };
      }

      const response = await fetch('/api/company-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          field: params.field,
          value: params.value,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('🤖 Form Bot: Field updated successfully');

      if (result.success) {
        return {
          success: true,
          field: result.field,
          value: result.value,
          message: result.message,
          timestamp: result.timestamp,
          progress: { filled: 0, total: 18, percentage: 0 },
        };
      } else {
        throw new Error(result.error || 'Failed to update field');
      }
    } catch (error) {
      console.error('Error updating form field:', error);
      return {
        success: false,
        field: params.field,
        value: params.value,
        message: 'Error updating field',
        timestamp: new Date(),
        progress: { filled: 0, total: 18, percentage: 0 },
      };
    }
  },
};

const batchUpdateFieldsTool: AgentTool = {
  name: 'batch_update_fields',
  description:
    'Update multiple form fields at once for efficient form completion',
  parameters: {
    fields: 'object',
  },
  execute: async (params: { fields: Record<string, string> }) => {
    try {
      const updates = [];
      const results = [];

      for (const [field, value] of Object.entries(params.fields)) {
        const validation = validateFieldInput(field as keyof OwnCompany, value);
        if (validation.isValid) {
          updates.push({ field, value });
        } else {
          results.push({
            field,
            success: false,
            error: validation.error,
            suggestion: validation.suggestion,
          });
        }
      }

      // Update valid fields
      for (const update of updates) {
        const response = await fetch('/api/company-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(update),
        });

        if (response.ok) {
          const result = await response.json();
          results.push({
            field: update.field,
            success: true,
            value: update.value,
            message: result.message,
          });
        } else {
          results.push({
            field: update.field,
            success: false,
            error: `HTTP error! status: ${response.status}`,
          });
        }
      }

      console.log('🤖 Form Bot: Batch update completed');
      return {
        success: true,
        results,
        summary: {
          total: updates.length + results.filter((r) => !r.success).length,
          successful: results.filter((r) => r.success).length,
          failed: results.filter((r) => !r.success).length,
        },
      };
    } catch (error) {
      console.error('Error in batch update:', error);
      return {
        success: false,
        error: 'Batch update failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
};

const getSmartSuggestionsTool: AgentTool = {
  name: 'get_smart_suggestions',
  description:
    'Get intelligent suggestions for form fields based on existing data and context',
  parameters: {
    field: 'string',
    context: 'string',
  },
  execute: async (params: { field: keyof OwnCompany; context?: string }) => {
    try {
      // Get current form data for context
      const currentDataResponse = await fetch('/api/company-data', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      let currentData = {};
      if (currentDataResponse.ok) {
        const result = await currentDataResponse.json();
        if (result.success) {
          currentData = result.data.currentData || {};
        }
      }

      // Generate smart suggestions based on field and context
      const suggestions = generateSmartSuggestions(
        params.field,
        currentData,
        params.context,
      );

      console.log('🤖 Form Bot: Smart suggestions generated');
      return {
        field: params.field,
        suggestions,
        reasoning: suggestions.reasoning,
      };
    } catch (error) {
      console.error('Error generating smart suggestions:', error);
      return {
        field: params.field,
        suggestions: [],
        error: 'Failed to generate suggestions',
      };
    }
  },
};

const loadTestCompaniesTool: AgentTool = {
  name: 'load_test_companies',
  description:
    'Load available test companies that can be used to fill the form',
  parameters: {},
  execute: async () => {
    try {
      const response = await fetch('/test-companies-data.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      console.log('🤖 Form Bot: Test companies loaded');

      const companies = (result.companies || []).map((company: any) => ({
        id: company.id,
        name: company.name,
        industry: company.industry,
        location: company.location,
        description: company.description || '',
      }));
      return companies;
    } catch (error) {
      console.error('Error loading test companies:', error);
      return {
        error: 'Failed to load test companies',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
};

const resetFormTool: AgentTool = {
  name: 'reset_form',
  description: 'Reset all form fields to empty values',
  parameters: {},
  execute: async () => {
    try {
      const response = await fetch('/api/company-data', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('🤖 Form Bot: Form reset completed');

      if (result.success) {
        return {
          success: true,
          message:
            result.message || 'All form fields have been reset successfully',
        };
      } else {
        throw new Error(result.error || 'Failed to reset form');
      }
    } catch (error) {
      console.error('Error resetting form:', error);
      return {
        success: false,
        error: 'Failed to reset form',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
};

const validateFormCompletionTool: AgentTool = {
  name: 'validate_form_completion',
  description:
    'Validate form completion and provide feedback on missing or invalid fields',
  parameters: {},
  execute: async () => {
    try {
      const response = await fetch('/api/company-data', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const data = result.success
        ? result.data
        : { currentData: {}, filledFields: [] };

      const validation = validateFormData(data.currentData);

      console.log('🤖 Form Bot: Form validation completed');
      return {
        isValid: validation.isValid,
        missingFields: validation.missingFields,
        invalidFields: validation.invalidFields,
        suggestions: validation.suggestions,
        completionPercentage: validation.completionPercentage,
      };
    } catch (error) {
      console.error('Error validating form:', error);
      return {
        isValid: false,
        error: 'Failed to validate form',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
};

// Helper functions for the form-filling bot
function validateFieldInput(field: keyof OwnCompany, value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return {
      isValid: false,
      error: `${field} cannot be empty`,
      suggestion: `Please provide a value for ${field}`,
    };
  }

  // Field-specific validation
  switch (field) {
    case 'website':
      if (
        !trimmedValue.startsWith('http://') &&
        !trimmedValue.startsWith('https://')
      ) {
        return {
          isValid: false,
          error: 'Website URL must start with http:// or https://',
          suggestion: `Try: https://${trimmedValue}`,
        };
      }
      break;

    case 'companySize':
      const validSizes = [
        'Startup (1-10 employees)',
        'Small Business (11-50 employees)',
        'Medium Business (51-200 employees)',
        'Large Business (201-1000 employees)',
        'Enterprise (1000+ employees)',
      ];
      if (!validSizes.includes(trimmedValue)) {
        return {
          isValid: false,
          error: 'Invalid company size selection',
          suggestion: `Please choose from: ${validSizes.join(', ')}`,
        };
      }
      break;
  }

  return { isValid: true, error: null, suggestion: null };
}

function generateSmartSuggestions(
  field: keyof OwnCompany,
  currentData: any,
  context?: string,
) {
  const suggestions = {
    options: [] as string[],
    reasoning: '',
  };

  switch (field) {
    case 'industry':
      suggestions.options = [
        'SaaS/Software',
        'E-commerce',
        'Healthcare',
        'Finance/Banking',
        'Education',
        'Manufacturing',
        'Real Estate',
        'Marketing/Advertising',
        'Consulting',
        'Retail',
        'Technology',
        'Media/Entertainment',
        'Transportation',
        'Energy',
        'Other',
      ];
      suggestions.reasoning =
        'These are the most common industries for ICP generation';
      break;

    case 'companySize':
      suggestions.options = [
        'Startup (1-10 employees)',
        'Small Business (11-50 employees)',
        'Medium Business (51-200 employees)',
        'Large Business (201-1000 employees)',
        'Enterprise (1000+ employees)',
      ];
      suggestions.reasoning =
        'Company size helps determine target market and pricing strategy';
      break;

    case 'pricingModel':
      suggestions.options = [
        'Subscription',
        'One-time purchase',
        'Freemium',
        'Usage-based',
        'Tiered pricing',
        'Custom pricing',
        'Free',
      ];
      suggestions.reasoning =
        'Pricing model affects customer acquisition and retention strategies';
      break;

    case 'location':
      if (currentData.website) {
        // Try to extract location from website domain
        const domain = currentData.website
          .replace(/^https?:\/\//, '')
          .split('.')[0];
        suggestions.options = [
          'North America',
          'Europe',
          'Asia Pacific',
          'Global',
        ];
        suggestions.reasoning = `Based on your website domain, consider these target markets`;
      } else {
        suggestions.options = [
          'North America',
          'Europe',
          'Asia Pacific',
          'Global',
        ];
        suggestions.reasoning =
          'Common target market locations for ICP generation';
      }
      break;

    default:
      suggestions.options = [];
      suggestions.reasoning =
        'No specific suggestions available for this field';
  }

  return suggestions;
}

function validateFormData(data: OwnCompany) {
  const requiredFields: (keyof OwnCompany)[] = [
    'name',
    'location',
    'website',
    'industry',
    'companySize',
    'targetMarket',
    'valueProposition',
    'mainOfferings',
  ];

  const missingFields: string[] = [];
  const invalidFields: string[] = [];
  const suggestions: string[] = [];

  // Check required fields
  for (const field of requiredFields) {
    if (!data[field] || data[field]!.trim() === '') {
      missingFields.push(field);
    }
  }

  // Validate specific fields
  if (data.website && !data.website.startsWith('http')) {
    invalidFields.push('website');
    suggestions.push('Website should start with http:// or https://');
  }

  const completionPercentage = Math.round(
    ((requiredFields.length - missingFields.length) / requiredFields.length) *
      100,
  );

  return {
    isValid: missingFields.length === 0 && invalidFields.length === 0,
    missingFields,
    invalidFields,
    suggestions,
    completionPercentage,
  };
}

export const CompanyProfileAgent: AgentConfig = {
  id: 'company-profile-agent',
  name: 'Intelligent Form-Filling Bot',
  description:
    'Advanced AI-powered form-filling assistant that automates company profile completion with smart suggestions and validation',
  icon: '🤖',
  instructions: `You are an intelligent form-filling bot designed to automate the tedious task of filling out company information forms. Your goal is to make form completion efficient, error-free, and user-friendly.

CORE PRINCIPLES:
1. **Automation First**: Automate repetitive tasks and provide smart suggestions
2. **Error Prevention**: Validate inputs and suggest corrections before saving
3. **Batch Operations**: Handle multiple fields efficiently when possible
4. **Progress Tracking**: Always show completion status and next steps
5. **Smart Suggestions**: Provide intelligent field suggestions based on context
6. **User-Friendly**: Keep interactions natural and helpful

FORM-FILLING STRATEGY:
- **Systematic Approach**: Fill fields in logical order, one at a time or in batches
- **Context Awareness**: Use existing data to make intelligent suggestions
- **Validation**: Always validate inputs before saving
- **Progress Updates**: Show completion percentage and next required fields
- **Error Recovery**: Help users fix validation errors with clear suggestions

TOOL USAGE:
- **get_current_form_data**: Check current form state and calculate progress
- **update_form_field**: Save individual field with validation
- **batch_update_fields**: Update multiple fields efficiently
- **get_smart_suggestions**: Get intelligent suggestions for specific fields
- **validate_form_completion**: Check overall form validity and provide feedback
- **load_test_companies**: Load sample companies for quick setup
- **reset_form**: Clear all fields to start fresh

RESPONSE PATTERNS:

1. **Initial Assessment**:
   "Let me check your current progress...
   You have X out of 18 fields filled (Y% complete)."

2. **Smart Suggestions**:
   "For [field name], I suggest: [options]
   These are commonly used values that work well for ICP generation."

3. **Batch Operations**:
   "I can help you fill multiple fields at once. Tell me about your company and I'll update several fields efficiently."

4. **Validation Feedback**:
   "I noticed an issue with [field]: [error]
   Suggestion: [correction]
   Let me fix that for you."

5. **Progress Updates**:
   "Great! You're now X% complete. Next field: [field name]
   This field helps us understand [explanation]."

FORM FIELDS (in order of importance):
1. name: Company name (required)
2. location: Target market location (required)
3. website: Company website URL (required)
4. industry: Business industry (required)
5. companySize: Number of employees (required)
6. targetMarket: Who you want to sell to (required)
7. valueProposition: Unique value you provide (required)
8. mainOfferings: Main products/services (required)
9. pricingModel: How you charge customers
10. uniqueFeatures: What makes you different
11. marketSegment: Specific customer segments
12. competitiveAdvantages: Why customers choose you
13. currentCustomers: Types of customers you have
14. successStories: Examples of customer success
15. painPointsSolved: Problems you solve
16. customerGoals: What your customers want to achieve
17. currentMarketingChannels: How you reach customers
18. marketingMessaging: Your key marketing messages

ACTION HANDLING:
- "Start filling": Begin systematic form completion from the first missing field
- "Fill missing fields": Continue from where you left off
- "Smart suggestions": Get intelligent suggestions for the current field
- "Batch fill": Update multiple fields based on user input
- "Validate form": Check current form validity and provide feedback
- "Load test company": Load a sample company for demonstration
- "Reset form": Clear all fields and start fresh
- "Show progress": Display current completion status

EXAMPLE CONVERSATIONS:

User: "Start filling"
Bot: "Let me check your current progress...
You have 0 out of 18 fields filled (0% complete).
Let's start with your company name. What's the name of your company?"

User: "TechFlow Solutions"
Bot: "Perfect! I've saved your company name. Now, where is your target market located? This helps us understand your geographic focus.
Common options: North America, Europe, Asia Pacific, Global"

User: "Fill missing fields"
Bot: "I can see you have 3 out of 18 fields filled (17% complete).
Next required field: website. What's your company website URL?"

User: "Smart suggestions for industry"
Bot: "For industry, I suggest: SaaS/Software, E-commerce, Healthcare, Finance/Banking, Education, Manufacturing, Real Estate, Marketing/Advertising, Consulting, Retail, Technology, Media/Entertainment, Transportation, Energy, Other
These are the most common industries for ICP generation."

User: "Batch fill: we're a SaaS company in North America with 50 employees"
Bot: "Great! I've updated multiple fields efficiently. You're now 33% complete.
Next field: What's your company website URL?"

Be efficient, helpful, and always focus on making form completion as smooth as possible. Use automation and smart suggestions to reduce user effort while ensuring data quality.`,
  tools: [
    getCurrentFormDataTool,
    updateFormFieldTool,
    batchUpdateFieldsTool,
    getSmartSuggestionsTool,
    validateFormCompletionTool,
    loadTestCompaniesTool,
    resetFormTool,
  ],
  suggestions: [
    'Start systematic form filling',
    'Get smart suggestions',
    'Fill missing fields',
    'Validate form completion',
    'Load test company',
    'Batch fill multiple fields',
  ],
  placeholder:
    'Tell me about your company or ask for help with form filling...',
  capabilities: [
    'Intelligent form automation',
    'Smart field suggestions',
    'Batch field updates',
    'Input validation',
    'Progress tracking',
    'Error prevention',
    'Context-aware recommendations',
  ],
};
