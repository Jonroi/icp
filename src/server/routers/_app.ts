import { createTRPCRouter } from '../trpc';
import { companyRouter } from './company';
import { companyDataRouter } from './company-data';
import { icpRouter } from './icp';
import { campaignRouter } from './campaign';

export const appRouter = createTRPCRouter({
  company: companyRouter,
  companyData: companyDataRouter,
  icp: icpRouter,
  campaign: campaignRouter,
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
