import type { OwnCompany } from '@/services/project/management/project-service';
import { redisService } from '@/services/cache/redis/redis-service';
import { prisma } from '@/services/database/prisma-service';
import type { CompanyData } from '@prisma/client';

export interface CompanyDataState {
  currentData: OwnCompany;
  filledFields: (keyof OwnCompany)[];
  nextField: keyof OwnCompany | null;
  isComplete: boolean;
  lastUpdated: Date;
}

export interface FormFieldUpdate {
  field: keyof OwnCompany;
  value: string;
  timestamp: Date;
}

export interface CompanyDataService {
  getCurrentData(): Promise<CompanyDataState>;
  updateField(field: keyof OwnCompany, value: string): Promise<FormFieldUpdate>;
  getFieldValue(field: keyof OwnCompany): Promise<string | undefined>;
  isFieldFilled(field: keyof OwnCompany): Promise<boolean>;
  getNextUnfilledField(): Promise<keyof OwnCompany | null>;
  getCompletionProgress(): Promise<{
    filled: number;
    total: number;
    percentage: number;
  }>;
  resetData(): Promise<void>;
  exportForICP(): Promise<OwnCompany>;
  saveToFile(): Promise<void>;
  loadFromFile(): Promise<void>;
}

const CURRENT_USER_ID =
  process.env.TEST_USER_ID || '11111111-1111-1111-1111-111111111111';

class PostgreSQLCompanyDataService implements CompanyDataService {
  private readonly TEST_USER_ID = CURRENT_USER_ID;

  private readonly fieldOrder: (keyof OwnCompany)[] = [
    'name',
    'location',
    'website',
    'social',
    'industry',
    'companySize',
    'targetMarket',
    'valueProposition',
    'mainOfferings',
    'pricingModel',
    'uniqueFeatures',
    'marketSegment',
    'competitiveAdvantages',
    'currentCustomers',
    'successStories',
    'painPointsSolved',
    'customerGoals',
    'currentMarketingChannels',
    'marketingMessaging',
  ];

  async getCurrentData(): Promise<CompanyDataState> {
    // Try to get from Redis cache first
    const cacheKey = `company_data:${this.TEST_USER_ID}`;
    const cached = await redisService.getSessionData(cacheKey);

    if (cached) {
      console.log('[Redis] Retrieved company data from cache');
      return cached as CompanyDataState;
    }

    console.log('[DB] Fetching current company_data from PostgreSQL');

    // Get the first company for the user
    const company = await prisma.company.findFirst({
      where: { userId: this.TEST_USER_ID },
      include: {
        companyData: true,
      },
    });

    if (!company) {
      const state: CompanyDataState = {
        currentData: {} as OwnCompany,
        filledFields: [],
        nextField: this.fieldOrder[0],
        isComplete: false,
        lastUpdated: new Date(),
      };
      return state;
    }

    const data = {} as unknown as Record<string, string>;
    for (const field of company.companyData) {
      data[field.fieldName] = field.fieldValue;
    }

    const filledFields = this.fieldOrder.filter(
      (field) => data[field as string]?.trim() !== '',
    );
    const nextField = await this.getNextUnfilledField();

    const state: CompanyDataState = {
      currentData: data as unknown as OwnCompany,
      filledFields,
      nextField,
      isComplete: filledFields.length === this.fieldOrder.length,
      lastUpdated: new Date(),
    };

    // Cache in Redis for 5 minutes
    await redisService.setSessionData(cacheKey, state, 300);
    console.log('[Redis] Cached company data');

    return state;
  }

  async updateField(
    field: keyof OwnCompany,
    value: string,
  ): Promise<FormFieldUpdate> {
    console.log(`[DB] Upserting company_data field: ${String(field)}`);

    // Get or create company first
    let company = await prisma.company.findFirst({
      where: { userId: this.TEST_USER_ID },
    });

    if (!company) {
      company = await prisma.company.create({
        data: {
          userId: this.TEST_USER_ID,
          name: 'Default Company',
        },
      });
    }

    // Upsert the field
    const updatedField = await prisma.companyData.upsert({
      where: {
        companyId_fieldName: {
          companyId: company.id,
          fieldName: field as string,
        },
      },
      update: {
        fieldValue: value,
        version: { increment: 1 },
      },
      create: {
        companyId: company.id,
        fieldName: field as string,
        fieldValue: value,
      },
    });

    // Invalidate Redis cache
    const cacheKey = `company_data:${this.TEST_USER_ID}`;
    await redisService.deleteSession(cacheKey);
    console.log('[Redis] Invalidated company data cache');

    return { field, value, timestamp: updatedField.updatedAt };
  }

  async getFieldValue(field: keyof OwnCompany): Promise<string | undefined> {
    console.log(`[DB] Read company_data field: ${String(field)}`);

    const company = await prisma.company.findFirst({
      where: { userId: this.TEST_USER_ID },
    });

    if (!company) return undefined;

    const fieldData = await prisma.companyData.findUnique({
      where: {
        companyId_fieldName: {
          companyId: company.id,
          fieldName: field as string,
        },
      },
    });

    return fieldData?.fieldValue;
  }

  async isFieldFilled(field: keyof OwnCompany): Promise<boolean> {
    const value = await this.getFieldValue(field);
    return !!(value && value.trim() !== '');
  }

  async getNextUnfilledField(): Promise<keyof OwnCompany | null> {
    const company = await prisma.company.findFirst({
      where: { userId: this.TEST_USER_ID },
      include: {
        companyData: true,
      },
    });

    if (!company) return this.fieldOrder[0];

    const filledSet = new Set<string>();
    for (const field of company.companyData) {
      if (field.fieldValue && field.fieldValue.trim() !== '')
        filledSet.add(field.fieldName);
    }

    for (const field of this.fieldOrder) {
      if (!filledSet.has(field)) return field;
    }
    return null;
  }

  async getCompletionProgress(): Promise<{
    filled: number;
    total: number;
    percentage: number;
  }> {
    console.log('[DB] Calculating completion progress');

    const company = await prisma.company.findFirst({
      where: { userId: this.TEST_USER_ID },
      include: {
        companyData: true,
      },
    });

    if (!company) {
      return { filled: 0, total: this.fieldOrder.length, percentage: 0 };
    }

    const filled = company.companyData.filter(
      (field) => field.fieldValue && field.fieldValue.trim() !== '',
    ).length;

    const total = this.fieldOrder.length;
    const percentage = Math.round((filled / total) * 100);
    return { filled, total, percentage };
  }

  async resetData(): Promise<void> {
    console.log('[DB] Deleting all company_data rows for user');

    const company = await prisma.company.findFirst({
      where: { userId: this.TEST_USER_ID },
    });

    if (company) {
      await prisma.companyData.deleteMany({
        where: { companyId: company.id },
      });
    }

    // Invalidate Redis cache
    const cacheKey = `company_data:${this.TEST_USER_ID}`;
    await redisService.deleteSession(cacheKey);
    console.log('[Redis] Invalidated company data cache after reset');
  }

  async deleteCompanyData(companyId: string): Promise<void> {
    console.log(`[DB] Deleting company_data for company: ${companyId}`);
    // Note: company_data is user-specific, not company-specific
    // This method is kept for interface consistency but doesn't need company-specific logic
    await this.resetData();
  }

  async exportForICP(): Promise<OwnCompany> {
    const state = await this.getCurrentData();
    return { ...state.currentData };
  }

  // Compatibility no-ops
  async saveToFile(): Promise<void> {}
  async loadFromFile(): Promise<void> {}
}

// Singleton instance (PostgreSQL-backed with Redis caching)
export const companyDataService = new PostgreSQLCompanyDataService();
