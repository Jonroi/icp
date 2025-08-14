import type { OwnCompany } from '@/services/project-service';
import {
  databaseManager,
  getDatabaseConfig,
  DatabaseMigration,
} from '../../database/config';

export interface StoredCompany extends OwnCompany {
  id: string;
  updatedAt: string;
}

const CURRENT_USER_ID = process.env.TEST_USER_ID || '11111111-1111-1111-1111-111111111111';

let isDbInitialized = false;
async function ensureDb(): Promise<void> {
  if (isDbInitialized) return;
  console.log('[DB] Initializing PostgreSQL connection (companies-service)');
  await databaseManager.initialize(getDatabaseConfig());
  const migrator = new DatabaseMigration();
  console.log('[DB] Running migrations (companies-service)');
  await migrator.runMigrations();
  isDbInitialized = true;
  console.log('[DB] Initialization complete (companies-service)');
}

interface CompanyDbRow {
  id: string;
  name: string;
  location: string | null;
  website: string | null;
  social: string | null;
  industry: string | null;
  company_size: string | null;
  target_market: string | null;
  value_proposition: string | null;
  main_offerings: string | null;
  pricing_model: string | null;
  unique_features: string | null;
  market_segment: string | null;
  competitive_advantages: string | null;
  current_customers: string | null;
  success_stories: string | null;
  pain_points_solved: string | null;
  customer_goals: string | null;
  current_marketing_channels: string | null;
  marketing_messaging: string | null;
  reviews: string | null;
  linkedin_data: string | null;
  created_at: Date;
  updated_at: Date;
}

export const companiesService = {
  async listCompanies(): Promise<Pick<StoredCompany, 'id' | 'name'>[]> {
    await ensureDb();
    console.log('[DB] Listing companies from Postgres');
    const result = await databaseManager.query(
      'SELECT id::text AS id, name FROM companies ORDER BY name',
    );
    return result.rows as Array<{ id: string; name: string }>;
  },

  async getActiveCompany(): Promise<StoredCompany | null> {
    await ensureDb();
    console.log('[DB] Fetching active company for user');
    const res = await databaseManager.query(
      `SELECT c.*, c.id::text AS id
			 FROM user_active_company u
			 JOIN companies c ON c.id = u.company_id
			 WHERE u.user_id = $1`,
      [CURRENT_USER_ID],
    );
    if (res.rows.length === 0) return null;
    const row = res.rows[0] as CompanyDbRow;
    const mapped: StoredCompany = {
      id: row.id,
      name: row.name || '',
      website: row.website || '',
      social: row.social || '',
      location: row.location || '',
      industry: row.industry || '',
      companySize: row.company_size || '',
      targetMarket: row.target_market || '',
      valueProposition: row.value_proposition || '',
      mainOfferings: row.main_offerings || '',
      pricingModel: row.pricing_model || '',
      uniqueFeatures: row.unique_features || '',
      marketSegment: row.market_segment || '',
      competitiveAdvantages: row.competitive_advantages || '',
      currentCustomers: row.current_customers || '',
      successStories: row.success_stories || '',
      painPointsSolved: row.pain_points_solved || '',
      customerGoals: row.customer_goals || '',
      currentMarketingChannels: row.current_marketing_channels || '',
      marketingMessaging: row.marketing_messaging || '',
      updatedAt:
        row.updated_at instanceof Date
          ? row.updated_at.toISOString()
          : new Date().toISOString(),
    };
    return mapped;
  },

  async selectCompany(id: string): Promise<StoredCompany | null> {
    await ensureDb();
    console.log(`[DB] Setting active company: ${id}`);
    // Set active
    await databaseManager.query(
      `INSERT INTO user_active_company (user_id, company_id, updated_at)
			 VALUES ($1, $2, NOW())
			 ON CONFLICT (user_id)
			 DO UPDATE SET company_id = EXCLUDED.company_id, updated_at = NOW()`,
      [CURRENT_USER_ID, id],
    );
    // Return selected
    const res = await databaseManager.query(
      'SELECT * FROM companies WHERE id = $1',
      [id],
    );
    if (res.rows.length === 0) return null;
    const row = res.rows[0] as CompanyDbRow;
    const mapped: StoredCompany = {
      id: row.id,
      name: row.name || '',
      website: row.website || '',
      social: row.social || '',
      location: row.location || '',
      industry: row.industry || '',
      companySize: row.company_size || '',
      targetMarket: row.target_market || '',
      valueProposition: row.value_proposition || '',
      mainOfferings: row.main_offerings || '',
      pricingModel: row.pricing_model || '',
      uniqueFeatures: row.unique_features || '',
      marketSegment: row.market_segment || '',
      competitiveAdvantages: row.competitive_advantages || '',
      currentCustomers: row.current_customers || '',
      successStories: row.success_stories || '',
      painPointsSolved: row.pain_points_solved || '',
      customerGoals: row.customer_goals || '',
      currentMarketingChannels: row.current_marketing_channels || '',
      marketingMessaging: row.marketing_messaging || '',
      updatedAt:
        row.updated_at instanceof Date
          ? row.updated_at.toISOString()
          : new Date().toISOString(),
    };
    return mapped;
  },

  async createCompany(
    partial: Partial<OwnCompany> & { name: string },
  ): Promise<StoredCompany> {
    await ensureDb();
    console.log(`[DB] Creating company: ${partial.name}`);
    const res = await databaseManager.query(
      `INSERT INTO companies (
			  name, location, website, social, industry, company_size, target_market,
			  value_proposition, main_offerings, pricing_model, unique_features,
			  market_segment, competitive_advantages, current_customers,
			  success_stories, pain_points_solved, customer_goals,
			  current_marketing_channels, marketing_messaging, created_at, updated_at
			) VALUES (
			  $1,$2,$3,$4,$5,$6,$7,
			  $8,$9,$10,$11,
			  $12,$13,$14,
			  $15,$16,$17,
			  $18,$19, NOW(), NOW()
			) RETURNING *`,
      [
        partial.name,
        partial.location || '',
        partial.website || '',
        partial.social || '',
        partial.industry || '',
        partial.companySize || '',
        partial.targetMarket || '',
        partial.valueProposition || '',
        partial.mainOfferings || '',
        partial.pricingModel || '',
        partial.uniqueFeatures || '',
        partial.marketSegment || '',
        partial.competitiveAdvantages || '',
        partial.currentCustomers || '',
        partial.successStories || '',
        partial.painPointsSolved || '',
        partial.customerGoals || '',
        partial.currentMarketingChannels || '',
        partial.marketingMessaging || '',
      ],
    );
    const row = res.rows[0] as CompanyDbRow;
    const created: StoredCompany = {
      id: row.id,
      name: row.name || '',
      website: row.website || '',
      social: row.social || '',
      location: row.location || '',
      industry: row.industry || '',
      companySize: row.company_size || '',
      targetMarket: row.target_market || '',
      valueProposition: row.value_proposition || '',
      mainOfferings: row.main_offerings || '',
      pricingModel: row.pricing_model || '',
      uniqueFeatures: row.unique_features || '',
      marketSegment: row.market_segment || '',
      competitiveAdvantages: row.competitive_advantages || '',
      currentCustomers: row.current_customers || '',
      successStories: row.success_stories || '',
      painPointsSolved: row.pain_points_solved || '',
      customerGoals: row.customer_goals || '',
      currentMarketingChannels: row.current_marketing_channels || '',
      marketingMessaging: row.marketing_messaging || '',
      updatedAt:
        row.updated_at instanceof Date
          ? row.updated_at.toISOString()
          : new Date().toISOString(),
    };
    // Set active for current user
    await databaseManager.query(
      `INSERT INTO user_active_company (user_id, company_id, updated_at)
			 VALUES ($1, $2, NOW())
			 ON CONFLICT (user_id)
			 DO UPDATE SET company_id = EXCLUDED.company_id, updated_at = NOW()`,
      [CURRENT_USER_ID, created.id],
    );
    return created;
  },

  async updateCompanyField(
    id: string,
    field: keyof OwnCompany,
    value: string,
  ): Promise<StoredCompany> {
    await ensureDb();
    // Map TS field to DB column
    const fieldMap: Record<string, string> = {
      name: 'name',
      location: 'location',
      website: 'website',
      social: 'social',
      industry: 'industry',
      companySize: 'company_size',
      targetMarket: 'target_market',
      valueProposition: 'value_proposition',
      mainOfferings: 'main_offerings',
      pricingModel: 'pricing_model',
      uniqueFeatures: 'unique_features',
      marketSegment: 'market_segment',
      competitiveAdvantages: 'competitive_advantages',
      currentCustomers: 'current_customers',
      successStories: 'success_stories',
      painPointsSolved: 'pain_points_solved',
      customerGoals: 'customer_goals',
      currentMarketingChannels: 'current_marketing_channels',
      marketingMessaging: 'marketing_messaging',
      reviews: 'reviews',
      linkedInData: 'linkedin_data',
    };
    const column = fieldMap[field as string];
    if (!column) throw new Error('Unsupported field');
    console.log(`[DB] Updating company field: id=${id}, column=${column}`);
    await databaseManager.query(
      `UPDATE companies SET ${column} = $2, updated_at = NOW() WHERE id = $1`,
      [id, value],
    );
    const res = await databaseManager.query(
      'SELECT * FROM companies WHERE id = $1',
      [id],
    );
    const row = res.rows[0] as CompanyDbRow;
    const updated: StoredCompany = {
      id: row.id,
      name: row.name || '',
      website: row.website || '',
      social: row.social || '',
      location: row.location || '',
      industry: row.industry || '',
      companySize: row.company_size || '',
      targetMarket: row.target_market || '',
      valueProposition: row.value_proposition || '',
      mainOfferings: row.main_offerings || '',
      pricingModel: row.pricing_model || '',
      uniqueFeatures: row.unique_features || '',
      marketSegment: row.market_segment || '',
      competitiveAdvantages: row.competitive_advantages || '',
      currentCustomers: row.current_customers || '',
      successStories: row.success_stories || '',
      painPointsSolved: row.pain_points_solved || '',
      customerGoals: row.customer_goals || '',
      currentMarketingChannels: row.current_marketing_channels || '',
      marketingMessaging: row.marketing_messaging || '',
      updatedAt:
        row.updated_at instanceof Date
          ? row.updated_at.toISOString()
          : new Date().toISOString(),
    };
    return updated;
  },
};
