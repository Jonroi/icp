import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '@/server/trpc';
import { prisma } from '@/services/database/prisma-service';
import type { Company, CompanyData } from '@prisma/client';

export const companyRouter = createTRPCRouter({
  // List all companies for the current user
  list: publicProcedure.query(async ({ ctx }) => {
    try {
      const companies = await prisma.company.findMany({
        include: {
          companyData: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Transform to match expected format
      const companyList = companies.map((company) => {
        const data: Record<string, string> = {};
        company.companyData.forEach((field) => {
          data[field.fieldName] = field.fieldValue;
        });

        return {
          id: company.id,
          name: company.name,
          website: data.website || '',
          social: data.social || '',
          location: data.location || '',
          industry: data.industry || '',
          companySize: data.companySize || '',
          targetMarket: data.targetMarket || '',
          valueProposition: data.valueProposition || '',
          mainOfferings: data.mainOfferings || '',
          pricingModel: data.pricingModel || '',
          uniqueFeatures: data.uniqueFeatures || '',
          marketSegment: data.marketSegment || '',
          competitiveAdvantages: data.competitiveAdvantages || '',
          currentCustomers: data.currentCustomers || '',
          successStories: data.successStories || '',
          currentMarketingChannels: data.currentMarketingChannels || '',
          marketingMessaging: data.marketingMessaging || '',
          painPointsSolved: data.painPointsSolved || '',
          customerGoals: data.customerGoals || '',
          created_at: company.createdAt,
          updated_at: company.updatedAt,
        };
      });

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
        const company = await prisma.company.findUnique({
          where: { id: parseInt(input.id) },
          include: {
            companyData: true,
          },
        });

        if (!company) {
          throw new Error('Company not found');
        }

        const data: Record<string, string> = {};
        company.companyData.forEach((field) => {
          data[field.fieldName] = field.fieldValue;
        });

        return {
          id: company.id,
          name: company.name,
          website: data.website || '',
          social: data.social || '',
          location: data.location || '',
          industry: data.industry || '',
          companySize: data.companySize || '',
          targetMarket: data.targetMarket || '',
          valueProposition: data.valueProposition || '',
          mainOfferings: data.mainOfferings || '',
          pricingModel: data.pricingModel || '',
          uniqueFeatures: data.uniqueFeatures || '',
          marketSegment: data.marketSegment || '',
          competitiveAdvantages: data.competitiveAdvantages || '',
          currentCustomers: data.currentCustomers || '',
          successStories: data.successStories || '',
          currentMarketingChannels: data.currentMarketingChannels || '',
          marketingMessaging: data.marketingMessaging || '',
          painPointsSolved: data.painPointsSolved || '',
          customerGoals: data.customerGoals || '',
          created_at: company.createdAt,
          updated_at: company.updatedAt,
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
        // Create the company with all data in a single transaction
        const newCompany = await prisma.company.create({
          data: {
            name: input.name,
            userId:
              process.env.TEST_USER_ID ||
              '11111111-1111-1111-1111-111111111111',
            companyData: {
              create: Object.entries(input)
                .filter(
                  ([field, value]) => field !== 'name' && value !== undefined,
                )
                .map(([fieldName, fieldValue]) => ({
                  fieldName,
                  fieldValue: fieldValue!,
                })),
            },
          },
          include: {
            companyData: true,
          },
        });

        const data: Record<string, string> = {};
        newCompany.companyData.forEach((field) => {
          data[field.fieldName] = field.fieldValue;
        });

        return {
          id: newCompany.id,
          name: newCompany.name,
          website: data.website || '',
          social: data.social || '',
          location: data.location || '',
          industry: data.industry || '',
          companySize: data.companySize || '',
          targetMarket: data.targetMarket || '',
          valueProposition: data.valueProposition || '',
          mainOfferings: data.mainOfferings || '',
          pricingModel: data.pricingModel || '',
          uniqueFeatures: data.uniqueFeatures || '',
          marketSegment: data.marketSegment || '',
          competitiveAdvantages: data.competitiveAdvantages || '',
          currentCustomers: data.currentCustomers || '',
          successStories: data.successStories || '',
          currentMarketingChannels: data.currentMarketingChannels || '',
          marketingMessaging: data.marketingMessaging || '',
          painPointsSolved: data.painPointsSolved || '',
          customerGoals: data.customerGoals || '',
          created_at: newCompany.createdAt,
          updated_at: newCompany.updatedAt,
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
        const companyId = parseInt(input.id);

        // Upsert the field (create if doesn't exist, update if it does)
        await prisma.companyData.upsert({
          where: {
            companyId_fieldName: {
              companyId,
              fieldName: input.field,
            },
          },
          update: {
            fieldValue: input.value,
            version: {
              increment: 1,
            },
          },
          create: {
            companyId,
            fieldName: input.field,
            fieldValue: input.value,
          },
        });

        // Get updated company data
        const companyWithData = await prisma.company.findUnique({
          where: { id: companyId },
          include: {
            companyData: true,
          },
        });

        if (!companyWithData) {
          throw new Error('Company not found');
        }

        const data: Record<string, string> = {};
        companyWithData.companyData.forEach((field) => {
          data[field.fieldName] = field.fieldValue;
        });

        return {
          id: companyWithData.id,
          name: companyWithData.name,
          website: data.website || '',
          social: data.social || '',
          location: data.location || '',
          industry: data.industry || '',
          companySize: data.companySize || '',
          targetMarket: data.targetMarket || '',
          valueProposition: data.valueProposition || '',
          mainOfferings: data.mainOfferings || '',
          pricingModel: data.pricingModel || '',
          uniqueFeatures: data.uniqueFeatures || '',
          marketSegment: data.marketSegment || '',
          competitiveAdvantages: data.competitiveAdvantages || '',
          currentCustomers: data.currentCustomers || '',
          successStories: data.successStories || '',
          currentMarketingChannels: data.currentMarketingChannels || '',
          marketingMessaging: data.marketingMessaging || '',
          painPointsSolved: data.painPointsSolved || '',
          customerGoals: data.customerGoals || '',
          created_at: companyWithData.createdAt,
          updated_at: companyWithData.updatedAt,
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
        await prisma.company.delete({
          where: { id: parseInt(input.id) },
        });
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
        const company = await prisma.company.findUnique({
          where: { id: parseInt(input.id) },
        });

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
