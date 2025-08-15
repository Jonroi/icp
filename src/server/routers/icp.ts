import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { icpProfilesService } from '@/services/icp-profiles-service';
import { companiesService } from '@/services/companies-service';
import { icpGenerator } from '@/services/ai/icp-generator';
import type { ICP } from '@/services/ai/types';

export const icpRouter = createTRPCRouter({
  // Generate ICPs with Redis caching
  generate: publicProcedure
    .input(z.object({ companyId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Get company data
        const company = await companiesService.selectCompany(input.companyId);
        if (!company) {
          throw new Error('Company not found');
        }

        // Generate ICPs
        const icps = await icpGenerator.generateICPs(company);

        // Cache each ICP
        for (const icp of icps) {
          await ctx.redis.cacheICP(icp.icp_id, input.companyId, icp);
        }

        // Save to database
        for (const icp of icps) {
          await icpProfilesService.saveICPProfile(icp);
        }

        return icps;
      } catch (error) {
        throw new Error(
          `Failed to generate ICPs: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        );
      }
    }),

  // Get ICPs for company with Redis caching
  getByCompany: publicProcedure
    .input(z.object({ companyId: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        // Try to get from cache first
        const cachedIcpIds = await ctx.redis.getCompanyICPs(input.companyId);
        const cachedIcps: ICP[] = [];

        for (const icpId of cachedIcpIds) {
          const cached = await ctx.redis.getCachedICP(icpId);
          if (cached) {
            cachedIcps.push(cached.data);
          }
        }

        if (cachedIcps.length > 0) {
          return cachedIcps;
        }

        // Fallback to database
        const icps = await icpProfilesService.getICPProfilesByCompany(
          input.companyId,
        );

        // Cache the results
        for (const icp of icps) {
          await ctx.redis.cacheICP(icp.icp_id, input.companyId, icp);
        }

        return icps;
      } catch (error) {
        throw new Error(
          `Failed to get ICPs: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        );
      }
    }),

  // Get all ICPs with Redis caching
  getAll: publicProcedure.query(async ({ ctx }) => {
    try {
      // Get active company
      const activeCompanyId = await ctx.redis.getActiveCompany();
      if (!activeCompanyId) {
        return [];
      }

      // Get ICPs for active company
      const cachedIcpIds = await ctx.redis.getCompanyICPs(activeCompanyId);
      const cachedIcps: ICP[] = [];

      for (const icpId of cachedIcpIds) {
        const cached = await ctx.redis.getCachedICP(icpId);
        if (cached) {
          cachedIcps.push(cached.data);
        }
      }

      if (cachedIcps.length > 0) {
        return cachedIcps;
      }

      // Fallback to database
      const icps = await icpProfilesService.getICPProfilesByCompany(
        activeCompanyId,
      );

      // Cache the results
      for (const icp of icps) {
        await ctx.redis.cacheICP(icp.icp_id, activeCompanyId, icp);
      }

      return icps;
    } catch (error) {
      throw new Error(
        `Failed to get all ICPs: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }),

  // Get ICP by ID with Redis caching
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        // Try cache first
        const cached = await ctx.redis.getCachedICP(input.id);
        if (cached) {
          return cached.data;
        }

        // Fallback to database
        const icp = await icpProfilesService.getICPProfileById(input.id);
        if (!icp) {
          throw new Error('ICP not found');
        }

        // Cache the result
        await ctx.redis.cacheICP(
          icp.icp_id,
          icp.meta?.source_company || 'unknown',
          icp,
        );

        return icp;
      } catch (error) {
        throw new Error(
          `Failed to get ICP: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        );
      }
    }),

  // Delete ICP with cache cleanup
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        await icpProfilesService.deleteICPProfile(input.id);

        // Invalidate cache
        await ctx.redis.invalidateICPCache(input.id);

        return { success: true };
      } catch (error) {
        throw new Error(
          `Failed to delete ICP: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        );
      }
    }),

  // Generate more ICPs for existing company
  generateMore: publicProcedure
    .input(z.object({ companyId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Get company data
        const company = await companiesService.selectCompany(input.companyId);
        if (!company) {
          throw new Error('Company not found');
        }

        // Generate additional ICPs
        const icps = await icpGenerator.generateICPs(company);

        // Cache each new ICP
        for (const icp of icps) {
          await ctx.redis.cacheICP(icp.icp_id, input.companyId, icp);
        }

        // Save to database
        for (const icp of icps) {
          await icpProfilesService.saveICPProfile(icp);
        }

        return icps;
      } catch (error) {
        throw new Error(
          `Failed to generate more ICPs: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        );
      }
    }),

  // Clear all ICPs for company
  clearForCompany: publicProcedure
    .input(z.object({ companyId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Get all ICP IDs for this company
        const icpIds = await ctx.redis.getCompanyICPs(input.companyId);

        // Delete from database
        for (const icpId of icpIds) {
          await icpProfilesService.deleteICPProfile(icpId);
        }

        // Clear cache
        await ctx.redis.invalidateCompanyData(input.companyId);

        return { success: true, deletedCount: icpIds.length };
      } catch (error) {
        throw new Error(
          `Failed to clear ICPs: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        );
      }
    }),
});
