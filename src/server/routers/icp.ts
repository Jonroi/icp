import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '@/server/trpc';
import { prisma } from '@/services/database/prisma-service';
import { ICPGenerator } from '@/services/ai';
import type { ICP } from '@/services/ai';
import type { ICPProfile } from '@prisma/client';

// Create ICP generator instance
const icpGenerator = new ICPGenerator();

export const icpRouter = createTRPCRouter({
  generate: publicProcedure
    .input(z.object({ companyId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Get company data
        const company = await prisma.company.findUnique({
          where: { id: parseInt(input.companyId) },
          include: {
            companyData: true,
          },
        });

        if (!company) {
          throw new Error('Company not found');
        }

        // Transform company data to the format expected by ICP generator
        const companyData: Record<string, string> = {};
        company.companyData.forEach((field) => {
          companyData[field.fieldName] = field.fieldValue;
        });

        if (Object.keys(companyData).length === 0) {
          throw new Error('Company data not found');
        }

        // Generate ICPs
        const icps = await icpGenerator.generateICPs(companyData);

        // Save to database
        const savedProfiles: ICPProfile[] = [];
        for (const icp of icps) {
          const profile = await prisma.iCPProfile.create({
            data: {
              companyId: company.id,
              name: icp.icp_name,
              description: '',
              profileData: icp as any, // Store the full ICP data as JSON
              confidenceLevel: 'medium',
            },
          });
          savedProfiles.push(profile);
        }

        // Cache ICPs in Redis if available
        if (ctx.redis) {
          await ctx.redis.setCompanyICPs(
            input.companyId,
            icps.map((icp) => icp.icp_name),
          );
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

  getAll: publicProcedure.query(async ({ ctx }) => {
    try {
      // Get all ICP profiles with company data
      const icpProfiles = await prisma.iCPProfile.findMany({
        include: {
          company: {
            include: {
              companyData: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Transform to match expected format
      const transformedProfiles = icpProfiles.map((profile) => ({
        id: profile.id,
        name: profile.name,
        description: profile.description,
        profile_data: profile.profileData,
        confidence_level: profile.confidenceLevel,
        company_id: profile.companyId.toString(),
        created_at: profile.createdAt,
        updated_at: profile.updatedAt,
        company: {
          id: profile.company.id.toString(),
          name: profile.company.name,
          data: profile.company.companyData.reduce((acc, field) => {
            acc[field.fieldName] = field.fieldValue;
            return acc;
          }, {} as Record<string, string>),
        },
      }));

      return transformedProfiles;
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
        const company = await prisma.company.findUnique({
          where: { id: parseInt(input.companyId) },
        });
        if (!company) {
          throw new Error('Company not found');
        }

        // Get ICP profiles for the company
        const profiles = await prisma.iCPProfile.findMany({
          where: { companyId: parseInt(input.companyId) },
          include: {
            company: {
              include: {
                companyData: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        // Transform to match expected format
        const transformedProfiles = profiles.map((profile) => ({
          id: profile.id,
          name: profile.name,
          description: profile.description,
          profile_data: profile.profileData,
          confidence_level: profile.confidenceLevel,
          company_id: profile.companyId.toString(),
          created_at: profile.createdAt,
          updated_at: profile.updatedAt,
          company: {
            id: profile.company.id.toString(),
            name: profile.company.name,
            data: profile.company.companyData.reduce((acc, field) => {
              acc[field.fieldName] = field.fieldValue;
              return acc;
            }, {} as Record<string, string>),
          },
        }));

        // Cache in Redis if available
        if (ctx.redis && transformedProfiles.length > 0) {
          const icpNames = transformedProfiles.map((profile) => profile.name);
          await ctx.redis.setCompanyICPs(input.companyId, icpNames);
        }

        return transformedProfiles;
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
        // Try cache first if available
        if (ctx.redis) {
          const cached = await ctx.redis.getCachedICP(input.id);
          if (cached) {
            return cached.data;
          }
        }

        // Get from database
        const profile = await prisma.iCPProfile.findUnique({
          where: { id: input.id },
          include: {
            company: {
              include: {
                companyData: true,
              },
            },
          },
        });

        if (!profile) {
          throw new Error('ICP not found');
        }

        // Transform to match expected format
        const transformedProfile = {
          id: profile.id,
          name: profile.name,
          description: profile.description,
          profile_data: profile.profileData,
          confidence_level: profile.confidenceLevel,
          company_id: profile.companyId.toString(),
          created_at: profile.createdAt,
          updated_at: profile.updatedAt,
          company: {
            id: profile.company.id.toString(),
            name: profile.company.name,
            data: profile.company.companyData.reduce((acc, field) => {
              acc[field.fieldName] = field.fieldValue;
              return acc;
            }, {} as Record<string, string>),
          },
        };

        return transformedProfile;
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
        await prisma.iCPProfile.delete({
          where: { id: input.id },
        });

        // Invalidate cache if available
        if (ctx.redis) {
          await ctx.redis.invalidateICPCache(input.id);
        }

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
        const company = await prisma.company.findUnique({
          where: { id: parseInt(input.companyId) },
          include: {
            companyData: true,
          },
        });

        if (!company) {
          throw new Error('Company not found');
        }

        // Transform company data
        const companyData: Record<string, string> = {};
        company.companyData.forEach((field) => {
          companyData[field.fieldName] = field.fieldValue;
        });

        if (Object.keys(companyData).length === 0) {
          throw new Error('Company data not found');
        }

        // Generate additional ICPs
        const icps = await icpGenerator.generateICPs(companyData);

        // Save to database
        const savedProfiles: ICPProfile[] = [];
        for (const icp of icps) {
          const profile = await prisma.iCPProfile.create({
            data: {
              companyId: company.id,
              name: icp.icp_name,
              description: '',
              profileData: icp as any,
              confidenceLevel: 'medium',
            },
          });
          savedProfiles.push(profile);
        }

        // Cache each new ICP if Redis is available
        if (ctx.redis) {
          for (const icp of icps) {
            await ctx.redis.cacheICP(icp.icp_id, input.companyId, icp);
          }
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
        // Get count before deletion
        const count = await prisma.iCPProfile.count({
          where: { companyId: parseInt(input.companyId) },
        });

        // Delete from database
        await prisma.iCPProfile.deleteMany({
          where: { companyId: parseInt(input.companyId) },
        });

        // Clear cache if available
        if (ctx.redis) {
          await ctx.redis.invalidateCompanyData(input.companyId);
        }

        return { success: true, deletedCount: count };
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
        // Get count before deletion
        const count = await prisma.iCPProfile.count({
          where: { companyId: parseInt(input.companyId) },
        });

        // Delete from database
        await prisma.iCPProfile.deleteMany({
          where: { companyId: parseInt(input.companyId) },
        });

        // Clear cache if available
        if (ctx.redis) {
          await ctx.redis.invalidateCompanyData(input.companyId);
        }

        return { success: true, deletedCount: count };
      } catch (error) {
        throw new Error(
          `Failed to delete all ICPs: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        );
      }
    }),
});
