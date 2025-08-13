import { DynamicTool } from '@langchain/core/tools';
import { companyDataService } from '@/services/company-data-service';
import { companiesService } from '@/services/companies-service';
import { promises as fs } from 'fs';
import path from 'path';
import type { OwnCompany } from '@/services/project-service';

// Tool to get current form data (server-side service, no HTTP)
export const getCurrentFormDataTool = new DynamicTool({
  name: 'get_current_form_data',
  description:
    'Get the current values of all form fields to understand what has been filled. Use this when user wants to modify existing info or continue filling missing fields.',
  func: async () => {
    try {
      const data = await companyDataService.getCurrentData();
      return JSON.stringify(data, null, 2);
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

// Tool to update form field (server-side service)
export const updateFormFieldTool = new DynamicTool({
  name: 'update_form_field',
  description:
    'Update a specific form field with new value. Use this when user provides information for any field. Input format: "field=fieldname,value=fieldvalue"',
  func: async (input: string) => {
    try {
      const params = input.split(',').reduce((acc, pair) => {
        const [key, value] = pair.split('=');
        acc[key.trim()] = value?.trim() ?? '';
        return acc;
      }, {} as Record<string, string>);

      const field = params.field as keyof OwnCompany | undefined;
      const value = params.value;

      if (!field || !value) {
        throw new Error('Field and value are required');
      }

      const update = await companyDataService.updateField(field, value);
      // If we just set the company name and there is no active company, create/select it
      if (field === 'name' && value) {
        try {
          await companiesService.createCompany({ name: value });
        } catch (_) {
          // ignore if already exists or write failure
        }
      }
      return JSON.stringify({
        success: true,
        field: update.field,
        value: update.value,
        timestamp: update.timestamp,
        message: `Updated ${update.field}`,
      });
    } catch (error) {
      console.error('Error updating form field:', error);
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },
});

// Tool to load test companies (server-side fs)
export const loadTestCompaniesTool = new DynamicTool({
  name: 'load_test_companies',
  description:
    'Load available companies (seeded test companies and user companies).',
  func: async () => {
    try {
      const filePath = path.join(process.cwd(), 'data', 'companies.json');
      const file = await fs.readFile(filePath, 'utf-8');
      const result = JSON.parse(file);
      const companies = (result.companies || []).map((company: any) => ({
        id: company.id,
        name: company.name,
        industry: company.industry,
        location: company.location,
      }));
      return JSON.stringify(companies, null, 2);
    } catch (error) {
      return JSON.stringify([]);
    }
  },
});

// Tool to reset form (server-side service)
export const resetFormTool = new DynamicTool({
  name: 'reset_form',
  description:
    'Reset all form fields to empty values. Use this when user wants to clear all data and start over.',
  func: async () => {
    try {
      await companyDataService.resetData();
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

// Tool to create/select/update companies
export const manageCompanyTool = new DynamicTool({
  name: 'manage_company',
  description:
    'Create/select/update a company and set it as active. Input format examples: "action=create,name=Acme" | "action=select,id=company-123" | "action=update,id=company-123,field=website,value=https://acme.com"',
  func: async (input: string) => {
    try {
      const params = input.split(',').reduce((acc, pair) => {
        const [key, value] = pair.split('=');
        acc[key.trim()] = (value ?? '').trim();
        return acc;
      }, {} as Record<string, string>);

      const action = params.action;
      if (action === 'create') {
        if (!params.name) throw new Error('name is required for create');
        const created = await companiesService.createCompany({
          name: params.name,
        });
        return JSON.stringify({ success: true, company: created });
      }

      if (action === 'update') {
        const { id, field, value } = params;
        if (!id || !field)
          throw new Error('id and field are required for update');
        const updated = await companiesService.updateCompanyField(
          id,
          field as keyof import('@/services/project-service').OwnCompany,
          value ?? '',
        );
        return JSON.stringify({ success: true, company: updated });
      }

      if (action === 'select') {
        if (!params.id) throw new Error('id is required for select');
        const selected = await companiesService.selectCompany(params.id);
        return JSON.stringify({ success: true, company: selected });
      }

      throw new Error('Unsupported action. Use create|update|select');
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
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
  manageCompanyTool,
];
