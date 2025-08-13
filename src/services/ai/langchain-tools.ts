import { DynamicTool } from '@langchain/core/tools';
import type { OwnCompany } from '@/services/project-service';

// Tool to get current form data
export const getCurrentFormDataTool = new DynamicTool({
  name: 'get_current_form_data',
  description:
    'Get the current values of all form fields to understand what has been filled. Use this when user wants to modify existing info or continue filling missing fields.',
  func: async () => {
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
      console.log('🔍 LangChain Tool: Server response:', result);

      if (result.success) {
        return JSON.stringify(result.data, null, 2);
      } else {
        throw new Error(result.error || 'Failed to get company data');
      }
    } catch (error) {
      console.error('Error getting current form data:', error);
      return JSON.stringify({
        currentData: {} as OwnCompany,
        filledFields: [],
        nextField: 'name',
        isComplete: false,
        progress: { filled: 0, total: 18, percentage: 0 },
      });
    }
  },
});

// Tool to update form field
export const updateFormFieldTool = new DynamicTool({
  name: 'update_form_field',
  description:
    'Update a specific form field with new value. Use this when user provides information for any field.',
  func: async (input: string) => {
    try {
      // Parse the input to extract field and value
      // Expected format: "field=fieldname,value=fieldvalue"
      const params = input.split(',').reduce((acc, pair) => {
        const [key, value] = pair.split('=');
        acc[key.trim()] = value.trim();
        return acc;
      }, {} as Record<string, string>);

      const { field, value } = params;

      if (!field || !value) {
        throw new Error('Field and value are required');
      }

      const response = await fetch('/api/company-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          field,
          value,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('🔍 LangChain Tool: Update response:', result);

      if (result.success) {
        return JSON.stringify({
          success: true,
          field: result.field,
          value: result.value,
          message: result.message,
          timestamp: result.timestamp,
        });
      } else {
        throw new Error(result.error || 'Failed to update field');
      }
    } catch (error) {
      console.error('Error updating form field:', error);
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },
});

// Tool to load test companies
export const loadTestCompaniesTool = new DynamicTool({
  name: 'load_test_companies',
  description:
    'Load available test companies that can be used to fill the form. Use this when user wants to see available test companies or switch between them.',
  func: async () => {
    try {
      const response = await fetch('/test-companies-data.json', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('🔍 LangChain Tool: Test companies response:', result);

      return JSON.stringify(
        result.companies.map((company: any) => ({
          id: company.id,
          name: company.name,
          industry: company.industry,
          location: company.location,
        })),
        null,
        2,
      );
    } catch (error) {
      console.error('Error loading test companies:', error);
      return JSON.stringify({
        error: 'Failed to load test companies',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },
});

// Tool to reset form
export const resetFormTool = new DynamicTool({
  name: 'reset_form',
  description:
    'Reset all form fields to empty values. Use this when user wants to clear all data and start over.',
  func: async () => {
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
      console.log('🔍 LangChain Tool: Reset form response:', result);

      return JSON.stringify({
        success: true,
        message: 'All form fields have been reset successfully',
      });
    } catch (error) {
      console.error('Error resetting form:', error);
      return JSON.stringify({
        success: false,
        error: 'Failed to reset form',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },
});

// Export all tools
export const langchainTools = [
  getCurrentFormDataTool,
  updateFormFieldTool,
  loadTestCompaniesTool,
  resetFormTool,
];
