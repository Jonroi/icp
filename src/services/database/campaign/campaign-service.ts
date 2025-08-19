import { prisma } from '@/services/database/prisma-service';
import type { Campaign, CopyStyle, MediaType } from '@/services/ai';
import type { Campaign as PrismaCampaign } from '@prisma/client';

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
    const createdCampaign = await prisma.campaign.create({
      data: {
        name: campaign.name,
        icpId: campaign.icpId,
        copyStyle: campaign.copyStyle,
        mediaType: campaign.mediaType,
        adCopy: campaign.adCopy,
        imagePrompt: campaign.imagePrompt,
        imageUrl: campaign.imageUrl,
        cta: campaign.cta,
        hooks: campaign.hooks,
        landingPageCopy: campaign.landingPageCopy,
      },
    });

    return this.mapToStoredCampaign(createdCampaign);
  }

  async getById(id: string): Promise<StoredCampaign | null> {
    const campaign = await prisma.campaign.findUnique({
      where: { id },
    });

    if (!campaign) {
      return null;
    }

    return this.mapToStoredCampaign(campaign);
  }

  async getByIcpId(icpId: string): Promise<StoredCampaign[]> {
    const campaigns = await prisma.campaign.findMany({
      where: { icpId },
      orderBy: { createdAt: 'desc' },
    });

    return campaigns.map((campaign) => this.mapToStoredCampaign(campaign));
  }

  async getAll(): Promise<StoredCampaign[]> {
    const campaigns = await prisma.campaign.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return campaigns.map((campaign) => this.mapToStoredCampaign(campaign));
  }

  async getByCompanyId(companyId: string): Promise<StoredCampaign[]> {
    const campaigns = await prisma.campaign.findMany({
      where: {
        icpProfile: {
          companyId: parseInt(companyId),
        },
      },
      include: {
        icpProfile: {
          include: {
            company: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return campaigns.map((campaign) => this.mapToStoredCampaign(campaign));
  }

  async update(
    id: string,
    updates: Partial<Campaign>,
  ): Promise<StoredCampaign | null> {
    const fields = Object.keys(updates).filter(
      (key) => key !== 'id' && key !== 'createdAt' && key !== 'updatedAt',
    );

    if (fields.length === 0) {
      return this.getById(id);
    }

    const updateData: any = {};
    fields.forEach((field) => {
      const snakeField = this.camelToSnake(field);
      updateData[snakeField] = updates[field as keyof Campaign];
    });

    const updatedCampaign = await prisma.campaign.update({
      where: { id },
      data: updateData,
    });

    return this.mapToStoredCampaign(updatedCampaign);
  }

  async delete(id: string): Promise<boolean> {
    console.log('CampaignService: Deleting campaign with ID:', id);

    try {
      await prisma.campaign.delete({
        where: { id },
      });
      console.log('CampaignService: Campaign deleted successfully');
      return true;
    } catch (error) {
      console.log('CampaignService: Campaign not found or already deleted');
      return false;
    }
  }

  private mapToStoredCampaign(campaign: PrismaCampaign): StoredCampaign {
    return {
      id: campaign.id,
      name: campaign.name,
      icp_id: campaign.icpId,
      copy_style: campaign.copyStyle as CopyStyle,
      media_type: campaign.mediaType as MediaType,
      ad_copy: campaign.adCopy,
      image_prompt: campaign.imagePrompt || undefined,
      image_url: campaign.imageUrl || undefined,
      cta: campaign.cta,
      hooks: campaign.hooks,
      landing_page_copy: campaign.landingPageCopy,
      created_at: campaign.createdAt,
      updated_at: campaign.updatedAt,
    };
  }

  private camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }
}
