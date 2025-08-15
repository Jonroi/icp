import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { icpProfilesService } from '@/services/database';
import { companiesService } from '@/services/database';
import { ICPGenerator } from '@/services/ai/icp-generator';
import type { ICP } from '@/services/ai/types';

// Create ICP generator instance
const icpGenerator = new ICPGenerator();

export const icpRouter = createTRPCRouter({
  generate: publicProcedure
    .input(z.object({ companyId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Get company data
        const companyData = await companiesService.getCompanyData(
          input.companyId,
        );
        if (!companyData || Object.keys(companyData).length === 0) {
          throw new Error('Company data not found');
        }

        // Generate ICPs
        const icps = await icpGenerator.generateICPs(companyData);

        // Cache ICPs in Redis
        await ctx.redis.setCompanyICPs(
          input.companyId,
          icps.map((icp) => icp.icp_name),
        );

        // Save to database
        const savedProfiles = await icpProfilesService.saveProfilesForCompany(
          input.companyId,
          icps,
        );

        return icps;
      } catch (error) {
        throw new Error(
          `Failed to generate ICPs: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        );
      }
    }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    try {
      // Get all companies for the user
      const companies = await companiesService.getCompanies();

      const allIcpProfiles = [];

      for (const company of companies) {
        const companyId = company.id;

        // Try to get from Redis cache first
        const cachedIcpIds = await ctx.redis.getCompanyICPs(
          companyId.toString(),
        );
        if (cachedIcpIds && cachedIcpIds.length > 0) {
          console.log(
            `[Redis] Found ${cachedIcpIds.length} ICPs for company ${companyId}`,
          );

          // Get the full ICP data from database since cache only has names
          const storedProfiles = await icpProfilesService.listProfilesByCompany(
            companyId.toString(),
          );
          if (storedProfiles.length > 0) {
            allIcpProfiles.push(...storedProfiles);
          }
          continue;
        }

        // Get from database
        const storedProfiles = await icpProfilesService.listProfilesByCompany(
          companyId.toString(),
        );
        if (storedProfiles.length > 0) {
          console.log(
            `[DB] Found ${storedProfiles.length} ICPs for company ${companyId}`,
          );

          // Cache in Redis
          const icpNames = storedProfiles.map((profile) => profile.name);
          await ctx.redis.setCompanyICPs(companyId.toString(), icpNames);

          allIcpProfiles.push(...storedProfiles);
        }
      }

      return allIcpProfiles;
    } catch (error) {
      throw new Error(
        `Failed to get ICPs: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }),

  getByCompany: publicProcedure
    .input(z.object({ companyId: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        // Verify company exists
        const company = await companiesService.getCompanyById(input.companyId);
        if (!company) {
          throw new Error('Company not found');
        }

        // Try to get from Redis cache first
        const cachedIcpIds = await ctx.redis.getCompanyICPs(input.companyId);
        if (cachedIcpIds && cachedIcpIds.length > 0) {
          console.log(
            `[Redis] Found ${cachedIcpIds.length} ICPs for company ${input.companyId}`,
          );

          // Get the full ICP data from database since cache only has names
          const storedProfiles = await icpProfilesService.listProfilesByCompany(
            input.companyId,
          );
          if (storedProfiles.length > 0) {
            return storedProfiles;
          }
        }

        // Get from database
        const storedProfiles = await icpProfilesService.listProfilesByCompany(
          input.companyId,
        );
        if (storedProfiles.length > 0) {
          console.log(
            `[DB] Found ${storedProfiles.length} ICPs for company ${input.companyId}`,
          );

          // Cache in Redis
          const icpNames = storedProfiles.map((profile) => profile.name);
          await ctx.redis.setCompanyICPs(input.companyId, icpNames);
        }

        return storedProfiles;
      } catch (error) {
        throw new Error(
          `Failed to get ICPs for company: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        );
      }
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        // Try cache first
        const cached = await ctx.redis.getCachedICP(input.id);
        if (cached) {
          return cached.data;
        }

        // Fallback to database - this would need to be implemented
        // For now, we'll throw an error
        throw new Error('ICP not found');
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
        await icpProfilesService.deleteProfileById(input.id);

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
        const companyData = await companiesService.getCompanyData(
          input.companyId,
        );
        if (!companyData || Object.keys(companyData).length === 0) {
          throw new Error('Company data not found');
        }

        // Generate additional ICPs
        const icps = await icpGenerator.generateICPs(companyData);

        // Cache each new ICP
        for (const icp of icps) {
          await ctx.redis.cacheICP(icp.icp_id, input.companyId, icp);
        }

        // Save to database
        await icpProfilesService.saveProfilesForCompany(input.companyId, icps);

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
        await icpProfilesService.deleteProfilesByCompany(input.companyId);

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

  // Delete all ICPs for company (alias for clearForCompany)
  deleteAllForCompany: publicProcedure
    .input(z.object({ companyId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Delete from database
        const deletedCount = await icpProfilesService.deleteProfilesByCompany(
          input.companyId,
        );

        // Clear cache
        await ctx.redis.invalidateCompanyData(input.companyId);

        return { success: true, deletedCount };
      } catch (error) {
        throw new Error(
          `Failed to delete all ICPs: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        );
      }
    }),
});
