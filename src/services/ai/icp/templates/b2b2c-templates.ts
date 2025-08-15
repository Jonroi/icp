import type { ICPTemplate } from './b2b-templates';

export const B2B2C_TEMPLATES: ICPTemplate[] = [
  // Platform Partners
  {
    id: 'platform_partner',
    name: 'Platform Partner',
    description: 'Businesses that partner with platforms to reach end consumers',
    category: 'platform',
  },
  {
    id: 'marketplace_seller',
    name: 'Marketplace Seller',
    description: 'Businesses selling through online marketplaces',
    category: 'platform',
  },
  {
    id: 'franchise_owner',
    name: 'Franchise Owner',
    description: 'Franchise businesses serving local consumers',
    category: 'platform',
  },
  {
    id: 'reseller_distributor',
    name: 'Reseller/Distributor',
    description: 'Businesses that resell products to end consumers',
    category: 'platform',
  },
  {
    id: 'affiliate_partner',
    name: 'Affiliate Partner',
    description: 'Businesses earning commissions from consumer sales',
    category: 'platform',
  },

  // Hybrid Businesses
  {
    id: 'direct_to_consumer',
    name: 'Direct to Consumer',
    description: 'Manufacturers selling directly to consumers',
    category: 'hybrid',
  },
  {
    id: 'omnichannel_retailer',
    name: 'Omnichannel Retailer',
    description: 'Retailers with both B2B and B2C channels',
    category: 'hybrid',
  },
  {
    id: 'service_provider',
    name: 'Service Provider',
    description: 'Service businesses serving both businesses and consumers',
    category: 'hybrid',
  },
  {
    id: 'consulting_firm',
    name: 'Consulting Firm',
    description: 'Consulting firms serving businesses and individuals',
    category: 'hybrid',
  },
  {
    id: 'software_company',
    name: 'Software Company',
    description: 'Software companies with B2B and B2C products',
    category: 'hybrid',
  },
];
