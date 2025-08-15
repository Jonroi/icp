import type { OwnCompany } from '../project/project-service';
import { redisService } from '../cache/redis-service';

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

// PostgreSQL-ready schema design
export interface CompanyDataRow {
  id: string; // UUID primary key
  user_id: string; // UUID foreign key to users table
  field_name: keyof OwnCompany;
  field_value: string;
  created_at: Date;
  updated_at: Date;
  version: number; // For optimistic locking
}

export interface CompanyDataTable {
  id: string;
  user_id: string;
  field_name: string;
  field_value: string;
  created_at: Date;
  updated_at: Date;
  version: number;
}

// Database integration
import {
  databaseManager,
  getDatabaseConfig,
  DatabaseMigration,
} from '../../../database/config';

const CURRENT_USER_ID =
  process.env.TEST_USER_ID || '11111111-1111-1111-1111-111111111111';

async function ensureDatabaseInitialized(): Promise<void> {
  // Try a lightweight probe; if it fails, (re)initialize and migrate
  try {
    if (databaseManager.isReady()) {
      await databaseManager.query('SELECT 1');
      return;
    }
  } catch (_) {}

  console.log('[DB] Initializing PostgreSQL connection');
  try {
    await databaseManager.initialize(getDatabaseConfig());
    const migrator = new DatabaseMigration();
    console.log('[DB] Running migrations');
    await migrator.runMigrations();
    console.log('[DB] Initialization complete');
  } catch (error) {
    console.error('[DB] Failed to initialize database:', error);
    throw new Error(
      `Database initialization failed: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    );
  }
}

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
    await ensureDatabaseInitialized();

    // Try to get from Redis cache first
    const cacheKey = `company_data:${this.TEST_USER_ID}`;
    const cached = await redisService.getSessionData(cacheKey);

    if (cached) {
      console.log('[Redis] Retrieved company data from cache');
      return cached as CompanyDataState;
    }

    console.log('[DB] Fetching current company_data from PostgreSQL');
    const result = await databaseManager.query(
      'SELECT field_name, field_value FROM company_data WHERE user_id = $1',
      [this.TEST_USER_ID],
    );

    const data = {} as unknown as Record<string, string>;
    for (const row of result.rows as Array<{
      field_name: string;
      field_value: string;
    }>) {
      data[row.field_name] = row.field_value;
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
    await ensureDatabaseInitialized();
    console.log(`[DB] Upserting company_data field: ${String(field)}`);

    const result = await databaseManager.query(
      `INSERT INTO company_data (user_id, field_name, field_value, created_at, updated_at, version)
       VALUES ($1, $2, $3, NOW(), NOW(), 1)
       ON CONFLICT (user_id, field_name)
       DO UPDATE SET field_value = EXCLUDED.field_value,
                     updated_at = NOW(),
                     version = company_data.version + 1
       RETURNING updated_at`,
      [this.TEST_USER_ID, field as string, value],
    );

    const updatedAt: Date = result.rows[0].updated_at as Date;

    // Invalidate Redis cache
    const cacheKey = `company_data:${this.TEST_USER_ID}`;
    await redisService.deleteSession(cacheKey);
    console.log('[Redis] Invalidated company data cache');

    return { field, value, timestamp: updatedAt };
  }

  async getFieldValue(field: keyof OwnCompany): Promise<string | undefined> {
    await ensureDatabaseInitialized();
    console.log(`[DB] Read company_data field: ${String(field)}`);

    const result = await databaseManager.query(
      'SELECT field_value FROM company_data WHERE user_id = $1 AND field_name = $2',
      [this.TEST_USER_ID, field as string],
    );

    if (result.rows.length > 0) return result.rows[0].field_value as string;
    return undefined;
  }

  async isFieldFilled(field: keyof OwnCompany): Promise<boolean> {
    const value = await this.getFieldValue(field);
    return !!(value && value.trim() !== '');
  }

  async getNextUnfilledField(): Promise<keyof OwnCompany | null> {
    await ensureDatabaseInitialized();
    const result = await databaseManager.query(
      'SELECT field_name, field_value FROM company_data WHERE user_id = $1',
      [this.TEST_USER_ID],
    );
    const filledSet = new Set<string>();
    for (const row of result.rows as Array<{
      field_name: string;
      field_value: string;
    }>) {
      if (row.field_value && row.field_value.trim() !== '')
        filledSet.add(row.field_name);
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
    await ensureDatabaseInitialized();
    console.log('[DB] Calculating completion progress');
    const result = await databaseManager.query(
      `SELECT COUNT(*)::int AS filled
       FROM company_data
       WHERE user_id = $1 AND field_value != ''`,
      [this.TEST_USER_ID],
    );
    const filled = (result.rows[0]?.filled as number) || 0;
    const total = this.fieldOrder.length;
    const percentage = Math.round((filled / total) * 100);
    return { filled, total, percentage };
  }

  async resetData(): Promise<void> {
    await ensureDatabaseInitialized();
    console.log('[DB] Deleting all company_data rows for user');
    await databaseManager.query('DELETE FROM company_data WHERE user_id = $1', [
      this.TEST_USER_ID,
    ]);

    // Invalidate Redis cache
    const cacheKey = `company_data:${this.TEST_USER_ID}`;
    await redisService.deleteSession(cacheKey);
    console.log('[Redis] Invalidated company data cache after reset');
  }

  async deleteCompanyData(companyId: string): Promise<void> {
    await ensureDatabaseInitialized();
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
