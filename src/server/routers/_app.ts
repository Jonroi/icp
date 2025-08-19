import { createTRPCRouter } from '@/server/trpc';
import { companyRouter } from '@/server/routers/company';
import { companyDataRouter } from '@/server/routers/company-data';
import { icpRouter } from '@/server/routers/icp';
import { campaignRouter } from '@/server/routers/campaign';

export const appRouter = createTRPCRouter({
  company: companyRouter,
  companyData: companyDataRouter,
  icp: icpRouter,
  campaign: campaignRouter,
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
