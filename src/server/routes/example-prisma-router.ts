import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '@/server/trpc';
import { prisma } from '@/services/database/prisma-service';

// Example tRPC router using Prisma with full TypeScript support
export const examplePrismaRouter = createTRPCRouter({
  // Get all companies with their data
  getCompanies: publicProcedure.query(async () => {
    const companies = await prisma.company.findMany({
      include: {
        companyData: true,
        icpProfiles: {
          include: {
            campaigns: true,
          },
        },
      },
    });
    return companies;
  }),

  // Get company by ID with full data
  getCompanyById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const company = await prisma.company.findUnique({
        where: { id: input.id },
        include: {
          companyData: true,
          icpProfiles: {
            include: {
              campaigns: true,
            },
          },
        },
      });
      return company;
    }),

  // Create new company with data
  createCompany: publicProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
        name: z.string(),
        companyData: z.array(
          z.object({
            fieldName: z.string(),
            fieldValue: z.string(),
          }),
        ),
      }),
    )
    .mutation(async ({ input }) => {
      const company = await prisma.company.create({
        data: {
          userId: input.userId,
          name: input.name,
          companyData: {
            create: input.companyData,
          },
        },
        include: {
          companyData: true,
        },
      });
      return company;
    }),

  // Update company data
  updateCompanyData: publicProcedure
    .input(
      z.object({
        companyId: z.number(),
        fieldName: z.string(),
        fieldValue: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const companyData = await prisma.companyData.upsert({
        where: {
          companyId_fieldName: {
            companyId: input.companyId,
            fieldName: input.fieldName,
          },
        },
        update: {
          fieldValue: input.fieldValue,
          version: {
            increment: 1,
          },
        },
        create: {
          companyId: input.companyId,
          fieldName: input.fieldName,
          fieldValue: input.fieldValue,
        },
      });
      return companyData;
    }),

  // Get ICP profiles for a company
  getICPProfiles: publicProcedure
    .input(z.object({ companyId: z.number() }))
    .query(async ({ input }) => {
      const profiles = await prisma.iCPProfile.findMany({
        where: { companyId: input.companyId },
        include: {
          campaigns: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      return profiles;
    }),

  // Create ICP profile
  createICPProfile: publicProcedure
    .input(
      z.object({
        companyId: z.number(),
        name: z.string(),
        description: z.string().optional(),
        profileData: z.record(z.string(), z.any()),
        confidenceLevel: z.enum(['low', 'medium', 'high']).default('medium'),
      }),
    )
    .mutation(async ({ input }) => {
      const profile = await prisma.iCPProfile.create({
        data: {
          companyId: input.companyId,
          name: input.name,
          description: input.description,
          profileData: input.profileData as any,
          confidenceLevel: input.confidenceLevel,
        },
      });
      return profile;
    }),

  // Get campaigns with ICP data
  getCampaigns: publicProcedure.query(async () => {
    const campaigns = await prisma.campaign.findMany({
      include: {
        icpProfile: {
          include: {
            company: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return campaigns;
  }),

  // Create campaign
  createCampaign: publicProcedure
    .input(
      z.object({
        name: z.string(),
        icpId: z.string().uuid(),
        copyStyle: z.enum([
          'facts',
          'humour',
          'smart',
          'emotional',
          'professional',
        ]),
        mediaType: z.enum([
          'google-ads',
          'linkedin',
          'email',
          'print',
          'social-media',
        ]),
        adCopy: z.string(),
        imagePrompt: z.string().optional(),
        imageUrl: z.string().optional(),
        cta: z.string(),
        hooks: z.string(),
        landingPageCopy: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const campaign = await prisma.campaign.create({
        data: input,
        include: {
          icpProfile: true,
        },
      });
      return campaign;
    }),
});
