import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { companiesService } from '@/services/companies-service';
import type { OwnCompany } from '@/services/project-service';

export const companyRouter = createTRPCRouter({
  // List all companies for the current user
  list: publicProcedure.query(async ({ ctx }) => {
    try {
      const companies = await companiesService.getAllCompaniesWithData();

      // Transform to match expected format
      const companyList = companies.map((company) => ({
        ...company.data,
        id: company.id,
        name: company.name, // Add name field explicitly
        created_at: company.created_at,
        updated_at: company.updated_at,
      }));

      return {
        list: companyList,
        active: null, // No company selected by default
      };
    } catch (error) {
      throw new Error(
        `Failed to list companies: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }),

  // Get company by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const company = await companiesService.getCompanyWithData(input.id);
        if (!company) {
          throw new Error('Company not found');
        }

        return {
          ...company.data,
          id: company.id,
          name: company.name,
          created_at: company.created_at,
          updated_at: company.updated_at,
        };
      } catch (error) {
        throw new Error(
          `Failed to get company: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        );
      }
    }),

  // Create new company
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        location: z.string().optional(),
        website: z.string().optional(),
        social: z.string().optional(),
        industry: z.string().optional(),
        companySize: z.string().optional(),
        targetMarket: z.string().optional(),
        valueProposition: z.string().optional(),
        mainOfferings: z.string().optional(),
        pricingModel: z.string().optional(),
        uniqueFeatures: z.string().optional(),
        marketSegment: z.string().optional(),
        competitiveAdvantages: z.string().optional(),
        currentCustomers: z.string().optional(),
        successStories: z.string().optional(),
        painPointsSolved: z.string().optional(),
        customerGoals: z.string().optional(),
        currentMarketingChannels: z.string().optional(),
        marketingMessaging: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Create the company
        const newCompany = await companiesService.createCompany(input.name);

        // Update company data fields
        const updates = [];
        for (const [field, value] of Object.entries(input)) {
          if (field !== 'name' && value !== undefined) {
            await companiesService.updateCompanyField(
              newCompany.id.toString(),
              field as keyof OwnCompany,
              value,
            );
            updates.push({ field, value });
          }
        }

        // Get the created company with data
        const companyWithData = await companiesService.getCompanyWithData(
          newCompany.id.toString(),
        );
        if (!companyWithData) {
          throw new Error('Failed to retrieve created company');
        }

        return {
          ...companyWithData.data,
          id: companyWithData.id,
          name: companyWithData.name,
          created_at: companyWithData.created_at,
          updated_at: companyWithData.updated_at,
        };
      } catch (error) {
        throw new Error(
          `Failed to create company: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        );
      }
    }),

  // Update company field
  updateField: publicProcedure
    .input(
      z.object({
        id: z.string(),
        field: z.string(),
        value: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        await companiesService.updateCompanyField(
          input.id,
          input.field as keyof OwnCompany,
          input.value,
        );

        // Get updated company data
        const companyWithData = await companiesService.getCompanyWithData(
          input.id,
        );
        if (!companyWithData) {
          throw new Error('Company not found');
        }

        return {
          ...companyWithData.data,
          id: companyWithData.id,
          name: companyWithData.name,
          created_at: companyWithData.created_at,
          updated_at: companyWithData.updated_at,
        };
      } catch (error) {
        throw new Error(
          `Failed to update company field: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        );
      }
    }),

  // Delete company
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        await companiesService.deleteCompany(input.id);
        return { success: true };
      } catch (error) {
        throw new Error(
          `Failed to delete company: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        );
      }
    }),

  // Get active company (returns null if no company is selected)
  getActive: publicProcedure.query(async ({ ctx }) => {
    try {
      // For now, return null to indicate no company is selected
      // This will be updated when we implement user preferences
      return null;
    } catch (error) {
      throw new Error(
        `Failed to get active company: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }),

  // Set active company (no-op for now, could be implemented with user preferences)
  setActive: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Verify company exists and belongs to user
        const company = await companiesService.getCompanyById(input.id);
        if (!company) {
          throw new Error('Company not found');
        }

        // For now, just return success (could store active company preference)
        return { success: true };
      } catch (error) {
        throw new Error(
          `Failed to set active company: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        );
      }
    }),
});
