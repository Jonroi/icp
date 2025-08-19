import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { CampaignGenerator } from '@/services/ai';
import { CampaignService, icpProfilesService } from '@/services/database';
import { redisService } from '@/services/cache';

const campaignGenerator = new CampaignGenerator();
const campaignService = new CampaignService();

export const campaignRouter = createTRPCRouter({
  generate: publicProcedure
    .input(
      z.object({
        icpId: z.string(),
        copyStyle: z.enum([
          'facts',
          'humour',
          'smart',
          'emotional',
          'professional',
        ]),
        mediaType: z.enum([
          'google-ads',
          'linkedin',
          'email',
          'print',
          'social-media',
        ]),
        imagePrompt: z.string().optional(),
        campaignDetails: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        // Generate campaign using AI
        const result = await campaignGenerator.generateCampaign(input);

        if (!result.success) {
          throw new Error(result.error || 'Failed to generate campaign');
        }

        // Save to database
        const savedCampaign = await campaignService.create({
          name: result.campaign.name,
          icpId: result.campaign.icpId,
          copyStyle: result.campaign.copyStyle,
          mediaType: result.campaign.mediaType,
          adCopy: result.campaign.adCopy,
          imagePrompt: result.campaign.imagePrompt,
          imageUrl: result.campaign.imageUrl,
          cta: result.campaign.cta,
          hooks: result.campaign.hooks,
          landingPageCopy: result.campaign.landingPageCopy,
        });

        console.log('Campaign saved to database:', savedCampaign.id);

        // Cache the result
        await redisService.set(
          `campaign:${savedCampaign.id}`,
          JSON.stringify(savedCampaign),
          3600, // 1 hour TTL
        );

        // Invalidate related caches so library shows new campaign
        await redisService.del('campaigns:all');
        await redisService.del(`campaigns:icp:${savedCampaign.icp_id}`);

        // Get company ID from ICP to invalidate company cache
        try {
          const icpProfile = await icpProfilesService.getProfileById(
            savedCampaign.icp_id,
          );
          if (icpProfile && icpProfile.companyId) {
            await redisService.del(`campaigns:company:${icpProfile.companyId}`);
            console.log(
              'Invalidated company cache for company ID:',
              icpProfile.companyId,
            );
          }
        } catch (e) {
          console.warn('Failed to invalidate company cache:', e);
        }

        return savedCampaign;
      } catch (error) {
        console.error('Error in campaign generation:', error);
        throw new Error(
          error instanceof Error
            ? error.message
            : 'Failed to generate campaign',
        );
      }
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      try {
        // Try cache first
        const cached = await redisService.get(`campaign:${input.id}`);
        if (cached) {
          return JSON.parse(cached);
        }

        // Fetch from database
        const campaign = await campaignService.getById(input.id);
        if (!campaign) {
          throw new Error('Campaign not found');
        }

        // Cache the result
        await redisService.set(
          `campaign:${input.id}`,
          JSON.stringify(campaign),
          3600, // 1 hour TTL
        );

        return campaign;
      } catch (error) {
        console.error('Error fetching campaign:', error);
        throw new Error(
          error instanceof Error ? error.message : 'Failed to fetch campaign',
        );
      }
    }),

  getByIcpId: publicProcedure
    .input(z.object({ icpId: z.string() }))
    .query(async ({ input }) => {
      try {
        // Try cache first
        const cached = await redisService.get(`campaigns:icp:${input.icpId}`);
        if (cached) {
          return JSON.parse(cached);
        }

        // Fetch from database
        const campaigns = await campaignService.getByIcpId(input.icpId);

        // Cache the result
        await redisService.set(
          `campaigns:icp:${input.icpId}`,
          JSON.stringify(campaigns),
          1800, // 30 minutes TTL
        );

        return campaigns;
      } catch (error) {
        console.error('Error fetching campaigns by ICP:', error);
        throw new Error(
          error instanceof Error ? error.message : 'Failed to fetch campaigns',
        );
      }
    }),

  getAll: publicProcedure.query(async () => {
    try {
      // Try cache first
      const cached = await redisService.get('campaigns:all');
      if (cached) {
        return JSON.parse(cached);
      }

      // Fetch from database
      const campaigns = await campaignService.getAll();

      // Cache the result
      await redisService.set(
        'campaigns:all',
        JSON.stringify(campaigns),
        1800, // 30 minutes TTL
      );

      return campaigns;
    } catch (error) {
      console.error('Error fetching all campaigns:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Failed to fetch campaigns',
      );
    }
  }),

  getByCompany: publicProcedure
    .input(z.object({ companyId: z.string() }))
    .query(async ({ input }) => {
      try {
        // Try cache first
        const cached = await redisService.get(
          `campaigns:company:${input.companyId}`,
        );
        if (cached) {
          return JSON.parse(cached);
        }

        // Fetch from database
        const campaigns = await campaignService.getByCompanyId(input.companyId);

        // Cache the result
        await redisService.set(
          `campaigns:company:${input.companyId}`,
          JSON.stringify(campaigns),
          1800, // 30 minutes TTL
        );

        return campaigns;
      } catch (error) {
        console.error('Error fetching campaigns by company:', error);
        throw new Error(
          error instanceof Error ? error.message : 'Failed to fetch campaigns',
        );
      }
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        updates: z.object({
          name: z.string().optional(),
          adCopy: z.string().optional(),
          imagePrompt: z.string().optional(),
          imageUrl: z.string().optional(),
          cta: z.string().optional(),
          hooks: z.string().optional(),
          landingPageCopy: z.string().optional(),
        }),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const updatedCampaign = await campaignService.update(
          input.id,
          input.updates,
        );

        if (!updatedCampaign) {
          throw new Error('Campaign not found');
        }

        // Update cache
        await redisService.set(
          `campaign:${input.id}`,
          JSON.stringify(updatedCampaign),
          3600, // 1 hour TTL
        );

        // Invalidate related caches
        await redisService.del('campaigns:all');
        await redisService.del(`campaigns:icp:${updatedCampaign.icp_id}`);

        // Cache invalidation temporarily disabled during reorganization

        return updatedCampaign;
      } catch (error) {
        console.error('Error updating campaign:', error);
        throw new Error(
          error instanceof Error ? error.message : 'Failed to update campaign',
        );
      }
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      try {
        console.log('Attempting to delete campaign:', input.id);

        // Get campaign details BEFORE deleting to invalidate specific caches
        const campaign = await campaignService.getById(input.id);
        if (!campaign) {
          throw new Error('Campaign not found');
        }

        // Store campaign info for cache invalidation
        const icpId = campaign.icp_id;
        console.log('Campaign ICP ID for cache invalidation:', icpId);
        let companyId: string | null = null;

        try {
          const icpProfile = await icpProfilesService.getProfileById(icpId);
          console.log('ICP Profile found:', icpProfile ? 'yes' : 'no');
          if (icpProfile) {
            console.log('ICP Profile companyId:', icpProfile.companyId);
            companyId = icpProfile.companyId || null;
          }
        } catch (e) {
          console.warn('Failed to get ICP profile for cache invalidation:', e);
        }

        // Now delete the campaign
        const success = await campaignService.delete(input.id);
        if (!success) {
          throw new Error('Campaign not found');
        }

        console.log('Campaign deleted successfully:', input.id);

        // Clear cache
        console.log('Clearing caches for deleted campaign...');
        await redisService.del(`campaign:${input.id}`);
        await redisService.del('campaigns:all');
        await redisService.del(`campaigns:icp:${icpId}`);
        console.log('Basic caches cleared');

        if (companyId) {
          await redisService.del(`campaigns:company:${companyId}`);
          console.log(
            'Invalidated company cache for deleted campaign, company ID:',
            companyId,
          );
        } else {
          console.log(
            'No company ID found, skipping company cache invalidation',
          );
        }

        return { success: true };
      } catch (error) {
        console.error('Error deleting campaign:', error);
        console.error('Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
        });
        throw new Error(
          error instanceof Error ? error.message : 'Failed to delete campaign',
        );
      }
    }),
});
