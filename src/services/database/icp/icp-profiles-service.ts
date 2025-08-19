import type { ICP } from '@/services/ai/core/types';
import { prisma } from '@/services/database/prisma-service';
import type { ICPProfile } from '@prisma/client';

const CURRENT_USER_ID =
  process.env.TEST_USER_ID || '11111111-1111-1111-1111-111111111111';

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
    profiles: ICP[],
  ): Promise<StoredICPProfile[]> {
    const inserted: StoredICPProfile[] = [];

    for (const p of profiles) {
      const confidenceLevel = p.confidence || 'medium';

      const profile = await prisma.iCPProfile.create({
        data: {
          companyId: parseInt(companyId),
          name: p.icp_name,
          description: p.segments?.join(', ') || 'ICP Profile',
          profileData: p as any,
          confidenceLevel,
        },
      });

      inserted.push({
        id: profile.id,
        companyId: parseInt(companyId),
        name: profile.name,
        description: profile.description || '',
        profileData: profile.profileData as unknown as ICP,
        confidenceLevel: profile.confidenceLevel as 'high' | 'medium' | 'low',
        createdAt: profile.createdAt.toISOString(),
        updatedAt: profile.updatedAt.toISOString(),
      });
    }

    return inserted;
  },

  async listProfilesByCompany(companyId: string): Promise<StoredICPProfile[]> {
    const profiles = await prisma.iCPProfile.findMany({
      where: { companyId: parseInt(companyId) },
      orderBy: { createdAt: 'desc' },
    });

    return profiles.map((profile) => ({
      id: profile.id,
      companyId: parseInt(companyId),
      name: profile.name,
      description: profile.description || '',
      profileData: profile.profileData as unknown as ICP,
      confidenceLevel: profile.confidenceLevel as 'high' | 'medium' | 'low',
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString(),
    }));
  },

  async getProfileById(id: string): Promise<StoredICPProfile | null> {
    const profile = await prisma.iCPProfile.findUnique({
      where: { id },
    });

    if (!profile) {
      return null;
    }

    return {
      id: profile.id,
      companyId: profile.companyId,
      name: profile.name,
      description: profile.description || '',
      profileData: profile.profileData as unknown as ICP,
      confidenceLevel: profile.confidenceLevel as 'high' | 'medium' | 'low',
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString(),
    };
  },

  async deleteProfileById(id: string): Promise<void> {
    await prisma.iCPProfile.delete({
      where: { id },
    });
  },

  async deleteProfilesByCompany(companyId: string): Promise<number> {
    const result = await prisma.iCPProfile.deleteMany({
      where: { companyId: parseInt(companyId) },
    });

    return result.count;
  },
};
