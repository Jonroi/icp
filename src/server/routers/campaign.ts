import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { CampaignGenerator } from '@/services/ai/campaign-generator';
import { CampaignService } from '@/services/database/campaign-service';
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

        // Cache the result
        await redisService.set(
          `campaign:${savedCampaign.id}`,
          JSON.stringify(savedCampaign),
          3600, // 1 hour TTL
        );

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

        // Get company ID from ICP to invalidate company cache
        const icpService = await import(
          '@/services/database/icp-profiles-service'
        );
        const icp = await icpService.icpProfilesService.getProfileById(
          updatedCampaign.icp_id,
        );
        if (icp) {
          await redisService.del(`campaigns:company:${icp.companyId}`);
        }

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
        const success = await campaignService.delete(input.id);

        if (!success) {
          throw new Error('Campaign not found');
        }

        // Clear cache
        await redisService.del(`campaign:${input.id}`);
        await redisService.del('campaigns:all');

        // Get company ID from ICP to invalidate company cache
        const campaign = await campaignService.getById(input.id);
        if (campaign) {
          const icpService = await import(
            '@/services/database/icp-profiles-service'
          );
          const icp = await icpService.icpProfilesService.getProfileById(
            campaign.icp_id,
          );
          if (icp) {
            await redisService.del(`campaigns:company:${icp.companyId}`);
          }
        }

        return { success: true };
      } catch (error) {
        console.error('Error deleting campaign:', error);
        throw new Error(
          error instanceof Error ? error.message : 'Failed to delete campaign',
        );
      }
    }),
});
