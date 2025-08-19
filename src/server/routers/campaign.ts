import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '@/server/trpc';
import { CampaignGenerator } from '@/services/ai';
import { prisma } from '@/services/database/prisma-service';
import { redisService } from '@/services/cache';
import type { Campaign } from '@prisma/client';

const campaignGenerator = new CampaignGenerator();

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
        const savedCampaign = await prisma.campaign.create({
          data: {
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
          },
          include: {
            icpProfile: {
              include: {
                company: true,
              },
            },
          },
        });

        console.log('Campaign saved to database:', savedCampaign.id);

        // Transform to match expected format
        const transformedCampaign = {
          id: savedCampaign.id,
          name: savedCampaign.name,
          icp_id: savedCampaign.icpId,
          copy_style: savedCampaign.copyStyle as
            | 'facts'
            | 'humour'
            | 'smart'
            | 'emotional'
            | 'professional',
          media_type: savedCampaign.mediaType as
            | 'google-ads'
            | 'linkedin'
            | 'email'
            | 'print'
            | 'social-media',
          ad_copy: savedCampaign.adCopy,
          image_prompt: savedCampaign.imagePrompt || undefined,
          image_url: savedCampaign.imageUrl || undefined,
          cta: savedCampaign.cta,
          hooks: savedCampaign.hooks,
          landing_page_copy: savedCampaign.landingPageCopy,
          created_at: savedCampaign.createdAt,
          updated_at: savedCampaign.updatedAt,
        };

        // Cache the result
        await redisService.set(
          `campaign:${savedCampaign.id}`,
          JSON.stringify(transformedCampaign),
          3600, // 1 hour TTL
        );

        // Invalidate related caches so library shows new campaign
        await redisService.del('campaigns:all');
        await redisService.del(`campaigns:icp:${savedCampaign.icpId}`);

        // Get company ID from ICP to invalidate company cache
        if (savedCampaign.icpProfile?.company?.id) {
          await redisService.del(
            `campaigns:company:${savedCampaign.icpProfile.company.id}`,
          );
          console.log(
            'Invalidated company cache for company ID:',
            savedCampaign.icpProfile.company.id,
          );
        }

        return transformedCampaign;
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
        const campaign = await prisma.campaign.findUnique({
          where: { id: input.id },
          include: {
            icpProfile: {
              include: {
                company: true,
              },
            },
          },
        });

        if (!campaign) {
          throw new Error('Campaign not found');
        }

        // Transform to match expected format
        const transformedCampaign = {
          id: campaign.id,
          name: campaign.name,
          icp_id: campaign.icpId,
          copy_style: campaign.copyStyle as
            | 'facts'
            | 'humour'
            | 'smart'
            | 'emotional'
            | 'professional',
          media_type: campaign.mediaType as
            | 'google-ads'
            | 'linkedin'
            | 'email'
            | 'print'
            | 'social-media',
          ad_copy: campaign.adCopy,
          image_prompt: campaign.imagePrompt || undefined,
          image_url: campaign.imageUrl || undefined,
          cta: campaign.cta,
          hooks: campaign.hooks,
          landing_page_copy: campaign.landingPageCopy,
          created_at: campaign.createdAt,
          updated_at: campaign.updatedAt,
        };

        // Cache the result
        await redisService.set(
          `campaign:${input.id}`,
          JSON.stringify(transformedCampaign),
          3600, // 1 hour TTL
        );

        return transformedCampaign;
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
        const campaigns = await prisma.campaign.findMany({
          where: { icpId: input.icpId },
          include: {
            icpProfile: {
              include: {
                company: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        // Transform to match expected format
        const transformedCampaigns = campaigns.map((campaign) => ({
          id: campaign.id,
          name: campaign.name,
          icp_id: campaign.icpId,
          copy_style: campaign.copyStyle as
            | 'facts'
            | 'humour'
            | 'smart'
            | 'emotional'
            | 'professional',
          media_type: campaign.mediaType as
            | 'google-ads'
            | 'linkedin'
            | 'email'
            | 'print'
            | 'social-media',
          ad_copy: campaign.adCopy,
          image_prompt: campaign.imagePrompt || undefined,
          image_url: campaign.imageUrl || undefined,
          cta: campaign.cta,
          hooks: campaign.hooks,
          landing_page_copy: campaign.landingPageCopy,
          created_at: campaign.createdAt,
          updated_at: campaign.updatedAt,
        }));

        // Cache the result
        await redisService.set(
          `campaigns:icp:${input.icpId}`,
          JSON.stringify(transformedCampaigns),
          1800, // 30 minutes TTL
        );

        return transformedCampaigns;
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
      const campaigns = await prisma.campaign.findMany({
        include: {
          icpProfile: {
            include: {
              company: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Transform to match expected format
      const transformedCampaigns = campaigns.map((campaign) => ({
        id: campaign.id,
        name: campaign.name,
        icp_id: campaign.icpId,
        copy_style: campaign.copyStyle as
          | 'facts'
          | 'humour'
          | 'smart'
          | 'emotional'
          | 'professional',
        media_type: campaign.mediaType as
          | 'google-ads'
          | 'linkedin'
          | 'email'
          | 'print'
          | 'social-media',
        ad_copy: campaign.adCopy,
        image_prompt: campaign.imagePrompt || undefined,
        image_url: campaign.imageUrl || undefined,
        cta: campaign.cta,
        hooks: campaign.hooks,
        landing_page_copy: campaign.landingPageCopy,
        created_at: campaign.createdAt,
        updated_at: campaign.updatedAt,
      }));

      // Cache the result
      await redisService.set(
        'campaigns:all',
        JSON.stringify(transformedCampaigns),
        1800, // 30 minutes TTL
      );

      return transformedCampaigns;
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
        const campaigns = await prisma.campaign.findMany({
          where: {
            icpProfile: {
              companyId: parseInt(input.companyId),
            },
          },
          include: {
            icpProfile: {
              include: {
                company: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        // Transform to match expected format
        const transformedCampaigns = campaigns.map((campaign) => ({
          id: campaign.id,
          name: campaign.name,
          icp_id: campaign.icpId,
          copy_style: campaign.copyStyle as
            | 'facts'
            | 'humour'
            | 'smart'
            | 'emotional'
            | 'professional',
          media_type: campaign.mediaType as
            | 'google-ads'
            | 'linkedin'
            | 'email'
            | 'print'
            | 'social-media',
          ad_copy: campaign.adCopy,
          image_prompt: campaign.imagePrompt || undefined,
          image_url: campaign.imageUrl || undefined,
          cta: campaign.cta,
          hooks: campaign.hooks,
          landing_page_copy: campaign.landingPageCopy,
          created_at: campaign.createdAt,
          updated_at: campaign.updatedAt,
        }));

        // Cache the result
        await redisService.set(
          `campaigns:company:${input.companyId}`,
          JSON.stringify(transformedCampaigns),
          1800, // 30 minutes TTL
        );

        return transformedCampaigns;
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
        const updatedCampaign = await prisma.campaign.update({
          where: { id: input.id },
          data: input.updates,
          include: {
            icpProfile: {
              include: {
                company: true,
              },
            },
          },
        });

        // Transform to match expected format
        const transformedCampaign = {
          id: updatedCampaign.id,
          name: updatedCampaign.name,
          icp_id: updatedCampaign.icpId,
          copy_style: updatedCampaign.copyStyle as
            | 'facts'
            | 'humour'
            | 'smart'
            | 'emotional'
            | 'professional',
          media_type: updatedCampaign.mediaType as
            | 'google-ads'
            | 'linkedin'
            | 'email'
            | 'print'
            | 'social-media',
          ad_copy: updatedCampaign.adCopy,
          image_prompt: updatedCampaign.imagePrompt || undefined,
          image_url: updatedCampaign.imageUrl || undefined,
          cta: updatedCampaign.cta,
          hooks: updatedCampaign.hooks,
          landing_page_copy: updatedCampaign.landingPageCopy,
          created_at: updatedCampaign.createdAt,
          updated_at: updatedCampaign.updatedAt,
        };

        // Update cache
        await redisService.set(
          `campaign:${input.id}`,
          JSON.stringify(transformedCampaign),
          3600, // 1 hour TTL
        );

        // Invalidate related caches
        await redisService.del('campaigns:all');
        await redisService.del(`campaigns:icp:${updatedCampaign.icpId}`);

        return transformedCampaign;
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
        const campaign = await prisma.campaign.findUnique({
          where: { id: input.id },
          include: {
            icpProfile: {
              include: {
                company: true,
              },
            },
          },
        });

        if (!campaign) {
          throw new Error('Campaign not found');
        }

        // Store campaign info for cache invalidation
        const icpId = campaign.icpId;
        const companyId = campaign.icpProfile?.company?.id;
        console.log('Campaign ICP ID for cache invalidation:', icpId);
        console.log('Campaign company ID for cache invalidation:', companyId);

        // Now delete the campaign
        await prisma.campaign.delete({
          where: { id: input.id },
        });

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
