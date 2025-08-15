import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { companiesService } from '@/services/companies-service';
import type { OwnCompany } from '@/services/project-service';

export const companyRouter = createTRPCRouter({
  // List all companies with Redis caching
  list: publicProcedure.query(async ({ ctx }) => {
    try {
      // Try to get from cache first
      const cachedActiveCompanyId = await ctx.redis.getActiveCompany();

      const companies = await companiesService.listCompanies();
      const activeCompany = cachedActiveCompanyId
        ? await companiesService.selectCompany(cachedActiveCompanyId)
        : await companiesService.getActiveCompany();

      // Cache active company if found
      if (activeCompany) {
        await ctx.redis.cacheCompany(activeCompany.id, activeCompany);
        await ctx.redis.setActiveCompany(activeCompany.id);
      }

      return {
        list: companies,
        active: activeCompany,
      };
    } catch (error) {
      throw new Error(
        `Failed to list companies: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }),

  // Get company by ID with Redis caching
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        // Try cache first
        const cached = await ctx.redis.getCachedCompany(input.id);
        if (cached) {
          // Set as active in cache
          await ctx.redis.setActiveCompany(input.id);
          return cached.data;
        }

        // Fetch from database
        const company = await companiesService.selectCompany(input.id);

        // Cache the result
        await ctx.redis.cacheCompany(input.id, company);
        await ctx.redis.setActiveCompany(input.id);

        return company;
      } catch (error) {
        throw new Error(
          `Failed to get company: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        );
      }
    }),

  // Create new company with cache invalidation
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
        const company = await companiesService.createCompany(input);

        // Cache the new company
        await ctx.redis.cacheCompany(company.id, company);
        await ctx.redis.setActiveCompany(company.id);

        return company;
      } catch (error) {
        throw new Error(
          `Failed to create company: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        );
      }
    }),

  // Update company field with cache invalidation
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
        const result = await companiesService.updateCompanyField(
          input.id,
          input.field as keyof OwnCompany,
          input.value,
        );

        // Invalidate cache for this company
        await ctx.redis.invalidateCompanyCache(input.id);

        // Re-cache the updated company
        const updatedCompany = await companiesService.selectCompany(input.id);
        await ctx.redis.cacheCompany(input.id, updatedCompany);

        return result;
      } catch (error) {
        throw new Error(
          `Failed to update company field: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        );
      }
    }),

  // Delete company with cache cleanup
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        await companiesService.deleteCompany(input.id);

        // Clean up all cached data for this company
        await ctx.redis.invalidateCompanyData(input.id);

        return { success: true };
      } catch (error) {
        throw new Error(
          `Failed to delete company: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        );
      }
    }),

  // Get active company from cache
  getActive: publicProcedure.query(async ({ ctx }) => {
    try {
      const activeCompanyId = await ctx.redis.getActiveCompany();
      if (!activeCompanyId) return null;

      // Try cache first
      const cached = await ctx.redis.getCachedCompany(activeCompanyId);
      if (cached) return cached.data;

      // Fallback to database
      const company = await companiesService.selectCompany(activeCompanyId);
      await ctx.redis.cacheCompany(activeCompanyId, company);

      return company;
    } catch (error) {
      throw new Error(
        `Failed to get active company: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }),

  // Set active company
  setActive: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        await ctx.redis.setActiveCompany(input.id);
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
