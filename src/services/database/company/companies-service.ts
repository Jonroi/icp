import { databaseManager } from '../../../../database/config';
import type { OwnCompany } from '../../project/management/project-service';

// Ensure database is initialized
async function ensureDatabaseInitialized() {
  if (!databaseManager.isReady()) {
    try {
      const config = {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'icp_builder',
        user: process.env.DB_USER || 'icp_user',
        password: process.env.DB_PASSWORD || '',
        ssl: process.env.DB_SSL === 'true',
      };
      await databaseManager.initialize(config);
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw new Error('Database initialization failed');
    }
  }
}

export interface Company {
  id: number;
  name: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface CompanyWithData extends Company {
  data: OwnCompany;
}

class CompaniesService {
  private TEST_USER_ID = '11111111-1111-1111-1111-111111111111';

  /**
   * Get all companies for the current user
   */
  async getCompanies(): Promise<Company[]> {
    await ensureDatabaseInitialized();
    const result = await databaseManager.query(
      'SELECT id, name, user_id::text AS user_id, created_at, updated_at FROM companies WHERE user_id = $1 ORDER BY created_at DESC',
      [this.TEST_USER_ID],
    );
    return result.rows;
  }

  /**
   * Get a specific company by ID
   */
  async getCompanyById(companyId: string): Promise<Company | null> {
    await ensureDatabaseInitialized();
    const result = await databaseManager.query(
      'SELECT id, name, user_id::text AS user_id, created_at, updated_at FROM companies WHERE id = $1 AND user_id = $2',
      [parseInt(companyId), this.TEST_USER_ID],
    );
    return result.rows[0] || null;
  }

  /**
   * Get company data (all fields) for a specific company
   */
  async getCompanyData(companyId: string): Promise<OwnCompany | null> {
    await ensureDatabaseInitialized();
    const result = await databaseManager.query(
      'SELECT field_name, field_value FROM company_data WHERE company_id = $1',
      [parseInt(companyId)],
    );

    if (result.rows.length === 0) {
      return null;
    }

    const data = {} as OwnCompany;
    for (const row of result.rows) {
      (data as any)[row.field_name] = row.field_value;
    }

    return data;
  }

  /**
   * Get company with all its data
   */
  async getCompanyWithData(companyId: string): Promise<CompanyWithData | null> {
    const company = await this.getCompanyById(companyId);
    if (!company) return null;

    const data = await this.getCompanyData(companyId);
    if (!data) return null;

    return {
      ...company,
      data,
    };
  }

  /**
   * Create a new company
   */
  async createCompany(name: string): Promise<Company> {
    await ensureDatabaseInitialized();
    const result = await databaseManager.query(
      'INSERT INTO companies (user_id, name) VALUES ($1, $2) RETURNING id, name, user_id::text AS user_id, created_at, updated_at',
      [this.TEST_USER_ID, name],
    );
    return result.rows[0];
  }

  /**
   * Update a company field
   */
  async updateCompanyField(
    companyId: string,
    field: keyof OwnCompany,
    value: string,
  ): Promise<void> {
    await ensureDatabaseInitialized();
    await databaseManager.query(
      `INSERT INTO company_data (company_id, field_name, field_value, created_at, updated_at, version)
       VALUES ($1, $2, $3, NOW(), NOW(), 1)
       ON CONFLICT (company_id, field_name)
       DO UPDATE SET field_value = EXCLUDED.field_value,
                     updated_at = NOW(),
                     version = company_data.version + 1`,
      [parseInt(companyId), field as string, value],
    );
  }

  /**
   * Delete a company and all its data
   */
  async deleteCompany(companyId: string): Promise<void> {
    await ensureDatabaseInitialized();
    await databaseManager.query(
      'DELETE FROM companies WHERE id = $1 AND user_id = $2',
      [parseInt(companyId), this.TEST_USER_ID],
    );
  }

  /**
   * Get all companies with their data
   */
  async getAllCompaniesWithData(): Promise<CompanyWithData[]> {
    const companies = await this.getCompanies();
    const companiesWithData: CompanyWithData[] = [];

    for (const company of companies) {
      const data = await this.getCompanyData(company.id.toString());
      if (data) {
        companiesWithData.push({
          ...company,
          data,
        });
      }
    }

    return companiesWithData;
  }
}

export const companiesService = new CompaniesService();
