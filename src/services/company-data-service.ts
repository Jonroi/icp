import type { OwnCompany } from './project-service';

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

// File system storage implementation (PostgreSQL-ready)
class FileSystemCompanyDataService implements CompanyDataService {
  private data: OwnCompany = {} as OwnCompany;
  private readonly FILE_PATH = './company-data.json';
  private readonly TEST_USER_ID = 'test-user-123';

  // Field order for systematic completion
  private readonly fieldOrder: (keyof OwnCompany)[] = [
    'name',
    'location',
    'website',
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
    // Load data from file
    await this.loadFromFile();

    const filledFields = this.fieldOrder.filter(
      (field) => this.data[field] && this.data[field]!.trim() !== '',
    );

    const nextField = await this.getNextUnfilledField();

    return {
      currentData: { ...this.data },
      filledFields,
      nextField,
      isComplete: filledFields.length === this.fieldOrder.length,
      lastUpdated: new Date(),
    };
  }

  async updateField(
    field: keyof OwnCompany,
    value: string,
  ): Promise<FormFieldUpdate> {
    this.data[field] = value;

    // Save to file after each update
    await this.saveToFile();

    return {
      field,
      value,
      timestamp: new Date(),
    };
  }

  // Save data to file system (PostgreSQL-ready format)
  async saveToFile(): Promise<void> {
    try {
      // Only try to use fs in Node.js environment
      if (typeof window === 'undefined' && typeof require !== 'undefined') {
        const fs = require('fs').promises;

        // Convert to PostgreSQL-ready format
        const dataRows: CompanyDataRow[] = Object.entries(this.data)
          .filter(([_, value]) => value && value.trim() !== '')
          .map(([field, value]) => ({
            id: `${this.TEST_USER_ID}-${field}`,
            user_id: this.TEST_USER_ID,
            field_name: field as keyof OwnCompany,
            field_value: value,
            created_at: new Date(),
            updated_at: new Date(),
            version: 1,
          }));

        const dataToSave = {
          user_id: this.TEST_USER_ID,
          data_rows: dataRows,
          lastUpdated: new Date().toISOString(),
          version: '1.0',
          // Keep legacy format for backward compatibility
          legacy_data: this.data,
        };

        await fs.writeFile(this.FILE_PATH, JSON.stringify(dataToSave, null, 2));
        console.log(
          `✅ Company data saved to ${this.FILE_PATH} (PostgreSQL-ready format)`,
        );
      } else {
        console.log(
          'File system operations not available in browser environment',
        );
      }
    } catch (error) {
      console.warn('Failed to save company data to file:', error);
    }
  }

  // Load data from file system (PostgreSQL-ready format)
  async loadFromFile(): Promise<void> {
    try {
      // Only try to use fs in Node.js environment
      if (typeof window === 'undefined' && typeof require !== 'undefined') {
        const fs = require('fs').promises;
        const fileContent = await fs.readFile(this.FILE_PATH, 'utf-8');
        const parsed = JSON.parse(fileContent);

        // Handle both new PostgreSQL format and legacy format
        if (parsed.data_rows && Array.isArray(parsed.data_rows)) {
          // New PostgreSQL-ready format
          this.data = {} as OwnCompany;
          for (const row of parsed.data_rows) {
            this.data[row.field_name as keyof OwnCompany] = row.field_value;
          }
          console.log(
            `✅ Company data loaded from ${this.FILE_PATH} (PostgreSQL format)`,
          );
        } else if (parsed.legacy_data) {
          // Legacy format
          this.data = parsed.legacy_data;
          console.log(
            `✅ Company data loaded from ${this.FILE_PATH} (legacy format)`,
          );
        } else if (parsed.data) {
          // Old format
          this.data = parsed.data;
          console.log(
            `✅ Company data loaded from ${this.FILE_PATH} (old format)`,
          );
        }
      } else {
        console.log(
          'File system operations not available in browser environment',
        );
      }
    } catch (error) {
      console.warn('Failed to load company data from file:', error);
    }
  }

  async getFieldValue(field: keyof OwnCompany): Promise<string | undefined> {
    return this.data[field];
  }

  async isFieldFilled(field: keyof OwnCompany): Promise<boolean> {
    return !!(this.data[field] && this.data[field]!.trim() !== '');
  }

  async getNextUnfilledField(): Promise<keyof OwnCompany | null> {
    for (const field of this.fieldOrder) {
      if (!(await this.isFieldFilled(field))) {
        return field;
      }
    }
    return null;
  }

  async getCompletionProgress(): Promise<{
    filled: number;
    total: number;
    percentage: number;
  }> {
    const filled = (await this.getCurrentData()).filledFields.length;
    const total = this.fieldOrder.length;
    const percentage = Math.round((filled / total) * 100);

    return { filled, total, percentage };
  }

  async resetData(): Promise<void> {
    this.data = {} as OwnCompany;
    await this.saveToFile();
  }

  async exportForICP(): Promise<OwnCompany> {
    return { ...this.data };
  }
}

// Singleton instance
export const companyDataService = new FileSystemCompanyDataService();

// PostgreSQL implementation (for future use)
/*
class PostgreSQLCompanyDataService implements CompanyDataService {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  async getCurrentData(): Promise<CompanyDataState> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        'SELECT field_name, field_value FROM company_data WHERE user_id = $1 ORDER BY field_name',
        [this.getCurrentUserId()]
      );

      const data: OwnCompany = {} as OwnCompany;
      const filledFields: (keyof OwnCompany)[] = [];

      for (const row of result.rows) {
        data[row.field_name as keyof OwnCompany] = row.field_value;
        filledFields.push(row.field_name as keyof OwnCompany);
      }

      const nextField = await this.getNextUnfilledField();

      return {
        currentData: data,
        filledFields,
        nextField,
        isComplete: filledFields.length === 18, // Total field count
        lastUpdated: new Date(),
      };
    } finally {
      client.release();
    }
  }

  async updateField(field: keyof OwnCompany, value: string): Promise<FormFieldUpdate> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO company_data (user_id, field_name, field_value, created_at, updated_at, version)
         VALUES ($1, $2, $3, NOW(), NOW(), 1)
         ON CONFLICT (user_id, field_name)
         DO UPDATE SET 
           field_value = EXCLUDED.field_value,
           updated_at = NOW(),
           version = company_data.version + 1
         RETURNING *`,
        [this.getCurrentUserId(), field, value]
      );

      return {
        field,
        value,
        timestamp: result.rows[0].updated_at,
      };
    } finally {
      client.release();
    }
  }

  private getCurrentUserId(): string {
    // This would come from your authentication system
    return 'current-user-id';
  }

  // ... other methods with actual PostgreSQL queries
}
*/
