import { databaseManager } from '../../../database/config';
import type { Campaign, CopyStyle, MediaType } from '@/services/ai/types';

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

export interface StoredCampaign {
  id: string;
  name: string;
  icp_id: string;
  copy_style: CopyStyle;
  media_type: MediaType;
  ad_copy: string;
  image_prompt?: string;
  image_url?: string;
  cta: string;
  hooks: string;
  landing_page_copy: string;
  created_at: Date;
  updated_at: Date;
}

export class CampaignService {
  async create(
    campaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<StoredCampaign> {
    await ensureDatabaseInitialized();
    const query = `
      INSERT INTO campaigns (
        name, icp_id, copy_style, media_type, ad_copy, 
        image_prompt, image_url, cta, hooks, landing_page_copy
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const values = [
      campaign.name,
      campaign.icpId,
      campaign.copyStyle,
      campaign.mediaType,
      campaign.adCopy,
      campaign.imagePrompt,
      campaign.imageUrl,
      campaign.cta,
      campaign.hooks,
      campaign.landingPageCopy,
    ];

    const result = await databaseManager.query(query, values);
    return this.mapToStoredCampaign(result.rows[0]);
  }

  async getById(id: string): Promise<StoredCampaign | null> {
    await ensureDatabaseInitialized();
    const query = 'SELECT * FROM campaigns WHERE id = $1';
    const result = await databaseManager.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapToStoredCampaign(result.rows[0]);
  }

  async getByIcpId(icpId: string): Promise<StoredCampaign[]> {
    await ensureDatabaseInitialized();
    const query =
      'SELECT * FROM campaigns WHERE icp_id = $1 ORDER BY created_at DESC';
    const result = await databaseManager.query(query, [icpId]);

    return result.rows.map((row: any) => this.mapToStoredCampaign(row));
  }

  async getAll(): Promise<StoredCampaign[]> {
    await ensureDatabaseInitialized();
    const query = 'SELECT * FROM campaigns ORDER BY created_at DESC';
    const result = await databaseManager.query(query);

    return result.rows.map((row: any) => this.mapToStoredCampaign(row));
  }

  async getByCompanyId(companyId: string): Promise<StoredCampaign[]> {
    await ensureDatabaseInitialized();
    const query = `
      SELECT c.* 
      FROM campaigns c
      JOIN icp_profiles i ON c.icp_id = i.id
      WHERE i.company_id = $1
      ORDER BY c.created_at DESC
    `;
    const result = await databaseManager.query(query, [companyId]);

    return result.rows.map((row: any) => this.mapToStoredCampaign(row));
  }

  async update(
    id: string,
    updates: Partial<Campaign>,
  ): Promise<StoredCampaign | null> {
    await ensureDatabaseInitialized();
    const fields = Object.keys(updates).filter(
      (key) => key !== 'id' && key !== 'createdAt' && key !== 'updatedAt',
    );

    if (fields.length === 0) {
      return this.getById(id);
    }

    const setClause = fields
      .map((field, index) => `${this.camelToSnake(field)} = $${index + 2}`)
      .join(', ');
    const query = `
      UPDATE campaigns 
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const values = [
      id,
      ...fields.map((field) => updates[field as keyof Campaign]),
    ];
    const result = await databaseManager.query(query, values);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapToStoredCampaign(result.rows[0]);
  }

  async delete(id: string): Promise<boolean> {
    await ensureDatabaseInitialized();
    const query = 'DELETE FROM campaigns WHERE id = $1';
    const result = await databaseManager.query(query, [id]);
    return result.rowCount > 0;
  }

  private mapToStoredCampaign(row: any): StoredCampaign {
    return {
      id: row.id,
      name: row.name,
      icp_id: row.icp_id,
      copy_style: row.copy_style,
      media_type: row.media_type,
      ad_copy: row.ad_copy,
      image_prompt: row.image_prompt,
      image_url: row.image_url,
      cta: row.cta,
      hooks: row.hooks,
      landing_page_copy: row.landing_page_copy,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  private camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }
}
