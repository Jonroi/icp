import type { ICP, ApifyBasedICP } from './ai/types';
import {
  databaseManager,
  getDatabaseConfig,
  DatabaseMigration,
} from '../../database/config';

const CURRENT_USER_ID =
  process.env.TEST_USER_ID || '11111111-1111-1111-1111-111111111111';

let isDbInitialized = false;
async function ensureDb(): Promise<void> {
  if (isDbInitialized) return;
  await databaseManager.initialize(getDatabaseConfig());
  const migrator = new DatabaseMigration();
  await migrator.runMigrations();
  isDbInitialized = true;
}

export interface StoredICPProfile {
  id: string;
  companyId: number | null;
  name: string;
  description: string;
  profileData: ICP;
  confidenceLevel: 'high' | 'medium' | 'low';
  createdAt: string;
  updatedAt: string;
}

export const icpProfilesService = {
  async saveProfilesForCompany(
    companyId: string,
    profiles: (ICP | ApifyBasedICP)[],
  ): Promise<StoredICPProfile[]> {
    await ensureDb();
    const inserted: StoredICPProfile[] = [];
    for (const p of profiles) {
      const confidenceLevel = p.confidence || 'medium';
      const res = await databaseManager.query(
        `INSERT INTO icp_profiles (company_id, name, description, profile_data, confidence_level, created_at, updated_at)
				 VALUES ($1, $2, $3, $4::jsonb, $5, NOW(), NOW())
				 RETURNING id::text AS id, name, description, profile_data, confidence_level, created_at, updated_at`,
        [
          parseInt(companyId),
          p.icp_name,
          p.segments?.join(', ') || 'ICP Profile',
          JSON.stringify(p),
          confidenceLevel,
        ],
      );
      const row = res.rows[0] as {
        id: string;
        name: string;
        description: string;
        profile_data: ICP;
        confidence_level: 'high' | 'medium' | 'low';
        created_at: Date;
        updated_at: Date;
      };
      inserted.push({
        id: row.id,
        companyId: parseInt(companyId), // Keep for interface compatibility
        name: row.name,
        description: row.description,
        profileData: row.profile_data,
        confidenceLevel: row.confidence_level,
        createdAt: row.created_at.toISOString(),
        updatedAt: row.updated_at.toISOString(),
      });
    }

    return inserted;
  },

  async listProfilesByCompany(companyId: string): Promise<StoredICPProfile[]> {
    await ensureDb();
    const res = await databaseManager.query(
      `SELECT id::text AS id, name, description, profile_data, confidence_level, created_at, updated_at
			 FROM icp_profiles WHERE company_id = $1 ORDER BY created_at DESC`,
      [parseInt(companyId)],
    );
    return res.rows.map((row: any) => ({
      id: row.id,
      companyId: parseInt(companyId), // Keep for interface compatibility
      name: row.name,
      description: row.description,
      profileData: row.profile_data as ICP,
      confidenceLevel: row.confidence_level as 'high' | 'medium' | 'low',
      createdAt:
        row.created_at instanceof Date
          ? row.created_at.toISOString()
          : new Date(row.created_at).toISOString(),
      updatedAt:
        row.updated_at instanceof Date
          ? row.updated_at.toISOString()
          : new Date(row.updated_at).toISOString(),
    }));
  },

  async deleteProfileById(id: string): Promise<void> {
    await ensureDb();
    await databaseManager.query(`DELETE FROM icp_profiles WHERE id = $1`, [id]);
  },

  async deleteProfilesByCompany(companyId: string): Promise<number> {
    await ensureDb();
    const res = await databaseManager.query(
      `DELETE FROM icp_profiles WHERE company_id = $1`,
      [parseInt(companyId)],
    );
    // node-postgres doesn't return rowCount on some setups; fallback to 0
    return (
      res && typeof res.rowCount === 'number' ? res.rowCount : 0
    ) as number;
  },
};
