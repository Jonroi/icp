import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '@/server/trpc';
import { prisma } from '@/services/database/prisma-service';
import type { Company, CompanyData } from '@prisma/client';

export const companyDataRouter = createTRPCRouter({
  // Get current company data
  getCurrent: publicProcedure.query(async () => {
    try {
      // For now, get the first company (could be enhanced with user preferences)
      const company = await prisma.company.findFirst({
        include: {
          companyData: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (!company) {
        return {
          companyId: null,
          data: {},
          isComplete: false,
        };
      }

      const data: Record<string, string> = {};
      company.companyData.forEach((field) => {
        data[field.fieldName] = field.fieldValue;
      });

      const requiredFields = [
        'industry',
        'companySize',
        'targetMarket',
        'valueProposition',
        'mainOfferings',
        'pricingModel',
      ];

      const isComplete = requiredFields.every(
        (field) => data[field] && data[field].trim() !== '',
      );

      return {
        companyId: company.id.toString(),
        data,
        isComplete,
      };
    } catch (error) {
      throw new Error(
        `Failed to get current data: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }),

  // Update a field
  updateField: publicProcedure
    .input(
      z.object({
        field: z.string(),
        value: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        // Get the first company (could be enhanced with user preferences)
        const company = await prisma.company.findFirst({
          orderBy: {
            createdAt: 'desc',
          },
        });

        if (!company) {
          throw new Error('No company found');
        }

        // Upsert the field
        await prisma.companyData.upsert({
          where: {
            companyId_fieldName: {
              companyId: company.id,
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
            companyId: company.id,
            fieldName: input.field,
            fieldValue: input.value,
          },
        });

        // Get updated data
        const updatedCompany = await prisma.company.findUnique({
          where: { id: company.id },
          include: {
            companyData: true,
          },
        });

        if (!updatedCompany) {
          throw new Error('Failed to retrieve updated company');
        }

        const data: Record<string, string> = {};
        updatedCompany.companyData.forEach((field) => {
          data[field.fieldName] = field.fieldValue;
        });

        return {
          companyId: updatedCompany.id.toString(),
          data,
          success: true,
        };
      } catch (error) {
        throw new Error(
          `Failed to update field: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        );
      }
    }),

  // Get field value
  getFieldValue: publicProcedure
    .input(z.object({ field: z.string() }))
    .query(async ({ input }) => {
      try {
        const company = await prisma.company.findFirst({
          include: {
            companyData: {
              where: {
                fieldName: input.field,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        if (!company || company.companyData.length === 0) {
          return '';
        }

        return company.companyData[0].fieldValue;
      } catch (error) {
        throw new Error(
          `Failed to get field value: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        );
      }
    }),

  // Check if field is filled
  isFieldFilled: publicProcedure
    .input(z.object({ field: z.string() }))
    .query(async ({ input }) => {
      try {
        const company = await prisma.company.findFirst({
          include: {
            companyData: {
              where: {
                fieldName: input.field,
                fieldValue: {
                  not: '',
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        return company !== null && company.companyData.length > 0;
      } catch (error) {
        throw new Error(
          `Failed to check field: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        );
      }
    }),

  // Get next unfilled field
  getNextUnfilledField: publicProcedure.query(async () => {
    try {
      const requiredFields = [
        'industry',
        'companySize',
        'targetMarket',
        'valueProposition',
        'mainOfferings',
        'pricingModel',
      ];

      const company = await prisma.company.findFirst({
        include: {
          companyData: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (!company) {
        return requiredFields[0];
      }

      const filledFields = new Set(
        company.companyData.map((field) => field.fieldName),
      );
      const nextField = requiredFields.find(
        (field) => !filledFields.has(field),
      );

      return nextField || null;
    } catch (error) {
      throw new Error(
        `Failed to get next field: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }),

  // Get completion progress
  getCompletionProgress: publicProcedure.query(async () => {
    try {
      const requiredFields = [
        'industry',
        'companySize',
        'targetMarket',
        'valueProposition',
        'mainOfferings',
        'pricingModel',
      ];

      const company = await prisma.company.findFirst({
        include: {
          companyData: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (!company) {
        return {
          completed: 0,
          total: requiredFields.length,
          percentage: 0,
        };
      }

      const filledFields = company.companyData.filter(
        (field) =>
          requiredFields.includes(field.fieldName) &&
          field.fieldValue.trim() !== '',
      ).length;

      return {
        completed: filledFields,
        total: requiredFields.length,
        percentage: Math.round((filledFields / requiredFields.length) * 100),
      };
    } catch (error) {
      throw new Error(
        `Failed to get progress: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }),

  // Reset data
  reset: publicProcedure.mutation(async () => {
    try {
      const company = await prisma.company.findFirst({
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (company) {
        await prisma.companyData.deleteMany({
          where: {
            companyId: company.id,
          },
        });
      }

      return { success: true };
    } catch (error) {
      throw new Error(
        `Failed to reset data: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }),

  // Export for ICP
  exportForICP: publicProcedure.query(async () => {
    try {
      const company = await prisma.company.findFirst({
        include: {
          companyData: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (!company) {
        return {};
      }

      const data: Record<string, string> = {};
      company.companyData.forEach((field) => {
        data[field.fieldName] = field.fieldValue;
      });

      return data;
    } catch (error) {
      throw new Error(
        `Failed to export data: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }),
});
