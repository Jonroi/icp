import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { companyDataService } from '@/services/company-data-service';
import type { OwnCompany } from '@/services/project-service';

export const companyDataRouter = createTRPCRouter({
  // Get current company data
  getCurrent: publicProcedure.query(async () => {
    try {
      const state = await companyDataService.getCurrentData();
      return state;
    } catch (error) {
      throw new Error(`Failed to get current data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }),

  // Update a field
  updateField: publicProcedure
    .input(z.object({
      field: z.string(),
      value: z.string(),
    }))
    .mutation(async ({ input }) => {
      try {
        const result = await companyDataService.updateField(input.field as keyof OwnCompany, input.value);
        return result;
      } catch (error) {
        throw new Error(`Failed to update field: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }),

  // Get field value
  getFieldValue: publicProcedure
    .input(z.object({ field: z.string() }))
    .query(async ({ input }) => {
      try {
        const value = await companyDataService.getFieldValue(input.field as keyof OwnCompany);
        return value;
      } catch (error) {
        throw new Error(`Failed to get field value: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }),

  // Check if field is filled
  isFieldFilled: publicProcedure
    .input(z.object({ field: z.string() }))
    .query(async ({ input }) => {
      try {
        const isFilled = await companyDataService.isFieldFilled(input.field as keyof OwnCompany);
        return isFilled;
      } catch (error) {
        throw new Error(`Failed to check field: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }),

  // Get next unfilled field
  getNextUnfilledField: publicProcedure.query(async () => {
    try {
      const nextField = await companyDataService.getNextUnfilledField();
      return nextField;
    } catch (error) {
      throw new Error(`Failed to get next field: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }),

  // Get completion progress
  getCompletionProgress: publicProcedure.query(async () => {
    try {
      const progress = await companyDataService.getCompletionProgress();
      return progress;
    } catch (error) {
      throw new Error(`Failed to get progress: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }),

  // Reset data
  reset: publicProcedure.mutation(async () => {
    try {
      await companyDataService.resetData();
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to reset data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }),

  // Export for ICP
  exportForICP: publicProcedure.query(async () => {
    try {
      const data = await companyDataService.exportForICP();
      return data;
    } catch (error) {
      throw new Error(`Failed to export data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }),
});
