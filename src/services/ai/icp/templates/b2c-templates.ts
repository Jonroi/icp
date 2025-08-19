import type { ICPTemplate } from '@/services/ai/icp/templates/b2b-templates';

export const B2C_TEMPLATES: ICPTemplate[] = [
  // Demographics ICPs
  {
    id: 'young_professionals',
    name: 'Young Professionals',
    description: 'Early-career professionals aged 25-35',
    category: 'demographics',
  },
  {
    id: 'millennials',
    name: 'Millennials',
    description: 'Millennial consumers aged 28-43',
    category: 'demographics',
  },
  {
    id: 'gen_z',
    name: 'Gen Z',
    description: 'Generation Z consumers aged 16-27',
    category: 'demographics',
  },
  {
    id: 'baby_boomers',
    name: 'Baby Boomers',
    description: 'Baby boomer consumers aged 59-77',
    category: 'demographics',
  },
  {
    id: 'high_income',
    name: 'High Income',
    description: 'High-income consumers with disposable income',
    category: 'demographics',
  },
  {
    id: 'middle_class',
    name: 'Middle Class',
    description: 'Middle-class consumers seeking value',
    category: 'demographics',
  },
  {
    id: 'urban_professionals',
    name: 'Urban Professionals',
    description: 'City-dwelling professionals',
    category: 'demographics',
  },
  {
    id: 'suburban_families',
    name: 'Suburban Families',
    description: 'Suburban families with children',
    category: 'demographics',
  },

  // Lifestyle ICPs
  {
    id: 'fitness_enthusiasts',
    name: 'Fitness Enthusiasts',
    description: 'Health and fitness conscious consumers',
    category: 'lifestyle',
  },
  {
    id: 'tech_early_adopters',
    name: 'Tech Early Adopters',
    description: 'Technology enthusiasts who try new products first',
    category: 'lifestyle',
  },
  {
    id: 'eco_conscious',
    name: 'Eco-Conscious',
    description: 'Environmentally conscious consumers',
    category: 'lifestyle',
  },
  {
    id: 'luxury_seekers',
    name: 'Luxury Seekers',
    description: 'Consumers seeking premium and luxury products',
    category: 'lifestyle',
  },
  {
    id: 'budget_conscious',
    name: 'Budget Conscious',
    description: 'Price-sensitive consumers seeking deals',
    category: 'lifestyle',
  },
  {
    id: 'convenience_seekers',
    name: 'Convenience Seekers',
    description: 'Consumers prioritizing ease and convenience',
    category: 'lifestyle',
  },
  {
    id: 'quality_focused',
    name: 'Quality Focused',
    description: 'Consumers prioritizing product quality',
    category: 'lifestyle',
  },
  {
    id: 'trend_followers',
    name: 'Trend Followers',
    description: 'Consumers who follow current trends',
    category: 'lifestyle',
  },

  // Behavioral ICPs
  {
    id: 'online_shoppers',
    name: 'Online Shoppers',
    description: 'Consumers who prefer online shopping',
    category: 'behavior',
  },
  {
    id: 'mobile_users',
    name: 'Mobile Users',
    description: 'Heavy mobile device users',
    category: 'behavior',
  },
  {
    id: 'social_media_active',
    name: 'Social Media Active',
    description: 'Active social media users',
    category: 'behavior',
  },
  {
    id: 'brand_loyal',
    name: 'Brand Loyal',
    description: 'Consumers loyal to specific brands',
    category: 'behavior',
  },
  {
    id: 'impulse_buyers',
    name: 'Impulse Buyers',
    description: 'Consumers who make impulse purchases',
    category: 'behavior',
  },
  {
    id: 'research_intensive',
    name: 'Research Intensive',
    description: 'Consumers who research before buying',
    category: 'behavior',
  },
  {
    id: 'subscription_lovers',
    name: 'Subscription Lovers',
    description: 'Consumers who prefer subscription services',
    category: 'behavior',
  },
  {
    id: 'deal_hunters',
    name: 'Deal Hunters',
    description: 'Consumers who actively seek deals and discounts',
    category: 'behavior',
  },
];
