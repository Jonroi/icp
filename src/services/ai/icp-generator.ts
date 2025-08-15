import type { ICP, CustomerReview, ApifyDataSource } from './types';
import { OllamaClient } from './ollama-client';
import { AIServiceErrorFactory, InputValidator } from './error-types';

// Comprehensive ICP Template Library - Dozens of variations
const ICP_TEMPLATES = {
  B2B: [
    // Startup/SMB ICPs (10 variations)
    {
      id: 'startup_innovator',
      name: 'Startup Innovator',
      description: 'Early-stage companies seeking rapid innovation and growth',
      category: 'startup',
    },
    {
      id: 'smb_optimizer',
      name: 'SMB Optimizer',
      description: 'Small-medium businesses focused on process optimization',
      category: 'smb',
    },
    {
      id: 'tech_startup',
      name: 'Tech Startup',
      description: 'Technology startups with high growth potential',
      category: 'startup',
    },
    {
      id: 'saas_startup',
      name: 'SaaS Startup',
      description:
        'Software-as-a-Service companies building scalable solutions',
      category: 'startup',
    },
    {
      id: 'ecommerce_smb',
      name: 'E-commerce SMB',
      description: 'Small-medium e-commerce businesses',
      category: 'smb',
    },
    {
      id: 'consulting_smb',
      name: 'Consulting SMB',
      description: 'Small consulting and service businesses',
      category: 'smb',
    },
    {
      id: 'manufacturing_smb',
      name: 'Manufacturing SMB',
      description: 'Small manufacturing companies',
      category: 'smb',
    },
    {
      id: 'healthcare_startup',
      name: 'Healthcare Startup',
      description: 'Healthcare technology and service startups',
      category: 'startup',
    },
    {
      id: 'fintech_startup',
      name: 'FinTech Startup',
      description: 'Financial technology startups',
      category: 'startup',
    },
    {
      id: 'edtech_startup',
      name: 'EdTech Startup',
      description: 'Education technology startups',
      category: 'startup',
    },
    {
      id: 'ai_startup',
      name: 'AI Startup',
      description: 'Artificial intelligence and machine learning startups',
      category: 'startup',
    },
    {
      id: 'blockchain_startup',
      name: 'Blockchain Startup',
      description: 'Blockchain and cryptocurrency startups',
      category: 'startup',
    },
    {
      id: 'biotech_startup',
      name: 'Biotech Startup',
      description: 'Biotechnology and life sciences startups',
      category: 'startup',
    },
    {
      id: 'clean_tech_startup',
      name: 'CleanTech Startup',
      description: 'Clean technology and sustainability startups',
      category: 'startup',
    },
    {
      id: 'retail_smb',
      name: 'Retail SMB',
      description: 'Small retail businesses',
      category: 'smb',
    },
    {
      id: 'restaurant_smb',
      name: 'Restaurant SMB',
      description: 'Small restaurant and food service businesses',
      category: 'smb',
    },
    {
      id: 'construction_smb',
      name: 'Construction SMB',
      description: 'Small construction and contracting businesses',
      category: 'smb',
    },
    {
      id: 'automotive_smb',
      name: 'Automotive SMB',
      description: 'Small automotive service and sales businesses',
      category: 'smb',
    },
    {
      id: 'beauty_smb',
      name: 'Beauty SMB',
      description: 'Small beauty and wellness businesses',
      category: 'smb',
    },
    {
      id: 'fitness_smb',
      name: 'Fitness SMB',
      description: 'Small fitness and gym businesses',
      category: 'smb',
    },

    // Mid-Market ICPs (15 variations)
    {
      id: 'mid_market_scale',
      name: 'Mid-Market Scale',
      description: 'Growing companies scaling operations',
      category: 'mid_market',
    },
    {
      id: 'mid_market_efficiency',
      name: 'Mid-Market Efficiency',
      description: 'Established companies optimizing efficiency',
      category: 'mid_market',
    },
    {
      id: 'mid_market_expansion',
      name: 'Mid-Market Expansion',
      description: 'Companies expanding to new markets',
      category: 'mid_market',
    },
    {
      id: 'mid_market_digital',
      name: 'Mid-Market Digital',
      description: 'Traditional companies going digital',
      category: 'mid_market',
    },
    {
      id: 'mid_market_automation',
      name: 'Mid-Market Automation',
      description: 'Companies automating manual processes',
      category: 'mid_market',
    },
    {
      id: 'mid_market_compliance',
      name: 'Mid-Market Compliance',
      description: 'Companies needing regulatory compliance',
      category: 'mid_market',
    },
    {
      id: 'mid_market_integration',
      name: 'Mid-Market Integration',
      description: 'Companies integrating multiple systems',
      category: 'mid_market',
    },
    {
      id: 'mid_market_analytics',
      name: 'Mid-Market Analytics',
      description: 'Companies seeking data-driven insights',
      category: 'mid_market',
    },
    {
      id: 'mid_market_security',
      name: 'Mid-Market Security',
      description: 'Companies prioritizing cybersecurity',
      category: 'mid_market',
    },
    {
      id: 'mid_market_collaboration',
      name: 'Mid-Market Collaboration',
      description: 'Companies improving team collaboration',
      category: 'mid_market',
    },
    {
      id: 'mid_market_customer_experience',
      name: 'Mid-Market Customer Experience',
      description: 'Companies focusing on customer experience',
      category: 'mid_market',
    },
    {
      id: 'mid_market_supply_chain',
      name: 'Mid-Market Supply Chain',
      description: 'Companies optimizing supply chain operations',
      category: 'mid_market',
    },
    {
      id: 'mid_market_human_resources',
      name: 'Mid-Market HR',
      description: 'Companies modernizing HR processes',
      category: 'mid_market',
    },
    {
      id: 'mid_market_finance',
      name: 'Mid-Market Finance',
      description: 'Companies streamlining financial operations',
      category: 'mid_market',
    },
    {
      id: 'mid_market_sales',
      name: 'Mid-Market Sales',
      description: 'Companies optimizing sales processes',
      category: 'mid_market',
    },
    {
      id: 'mid_market_marketing',
      name: 'Mid-Market Marketing',
      description: 'Companies enhancing marketing capabilities',
      category: 'mid_market',
    },

    // Enterprise ICPs (20 variations)
    {
      id: 'enterprise_transformer',
      name: 'Enterprise Transformer',
      description: 'Large companies undergoing digital transformation',
      category: 'enterprise',
    },
    {
      id: 'enterprise_optimizer',
      name: 'Enterprise Optimizer',
      description: 'Large companies optimizing existing operations',
      category: 'enterprise',
    },
    {
      id: 'enterprise_innovator',
      name: 'Enterprise Innovator',
      description: 'Large companies driving innovation',
      category: 'enterprise',
    },
    {
      id: 'enterprise_compliance',
      name: 'Enterprise Compliance',
      description: 'Large companies with strict compliance needs',
      category: 'enterprise',
    },
    {
      id: 'enterprise_security',
      name: 'Enterprise Security',
      description: 'Large companies prioritizing security',
      category: 'enterprise',
    },
    {
      id: 'enterprise_integration',
      name: 'Enterprise Integration',
      description: 'Large companies with complex integrations',
      category: 'enterprise',
    },
    {
      id: 'enterprise_analytics',
      name: 'Enterprise Analytics',
      description: 'Large companies seeking advanced analytics',
      category: 'enterprise',
    },
    {
      id: 'enterprise_automation',
      name: 'Enterprise Automation',
      description: 'Large companies automating at scale',
      category: 'enterprise',
    },
    {
      id: 'enterprise_collaboration',
      name: 'Enterprise Collaboration',
      description: 'Large companies improving collaboration',
      category: 'enterprise',
    },
    {
      id: 'enterprise_customer_experience',
      name: 'Enterprise Customer Experience',
      description: 'Large companies focusing on customer experience',
      category: 'enterprise',
    },
    {
      id: 'enterprise_supply_chain',
      name: 'Enterprise Supply Chain',
      description: 'Large companies optimizing supply chains',
      category: 'enterprise',
    },
    {
      id: 'enterprise_human_resources',
      name: 'Enterprise HR',
      description: 'Large companies modernizing HR',
      category: 'enterprise',
    },
    {
      id: 'enterprise_finance',
      name: 'Enterprise Finance',
      description: 'Large companies streamlining finance',
      category: 'enterprise',
    },
    {
      id: 'enterprise_sales',
      name: 'Enterprise Sales',
      description: 'Large companies optimizing sales',
      category: 'enterprise',
    },
    {
      id: 'enterprise_marketing',
      name: 'Enterprise Marketing',
      description: 'Large companies enhancing marketing',
      category: 'enterprise',
    },
    {
      id: 'enterprise_operations',
      name: 'Enterprise Operations',
      description: 'Large companies optimizing operations',
      category: 'enterprise',
    },
    {
      id: 'enterprise_risk_management',
      name: 'Enterprise Risk Management',
      description: 'Large companies managing risk',
      category: 'enterprise',
    },
    {
      id: 'enterprise_quality_management',
      name: 'Enterprise Quality Management',
      description: 'Large companies ensuring quality',
      category: 'enterprise',
    },
    {
      id: 'enterprise_sustainability',
      name: 'Enterprise Sustainability',
      description: 'Large companies focusing on sustainability',
      category: 'enterprise',
    },
    {
      id: 'enterprise_global_operations',
      name: 'Enterprise Global Operations',
      description: 'Large companies with global presence',
      category: 'enterprise',
    },
    {
      id: 'enterprise_mergers_acquisitions',
      name: 'Enterprise M&A',
      description: 'Large companies in M&A activities',
      category: 'enterprise',
    },
    {
      id: 'enterprise_regulatory',
      name: 'Enterprise Regulatory',
      description: 'Large companies in regulated industries',
      category: 'enterprise',
    },

    // Industry-Specific ICPs (25 variations)
    {
      id: 'healthcare_provider',
      name: 'Healthcare Provider',
      description: 'Healthcare providers and medical organizations',
      category: 'healthcare',
    },
    {
      id: 'healthcare_technology',
      name: 'Healthcare Technology',
      description: 'Healthcare technology companies',
      category: 'healthcare',
    },
    {
      id: 'healthcare_insurance',
      name: 'Healthcare Insurance',
      description: 'Health insurance companies',
      category: 'healthcare',
    },
    {
      id: 'healthcare_pharmaceutical',
      name: 'Healthcare Pharmaceutical',
      description: 'Pharmaceutical companies',
      category: 'healthcare',
    },
    {
      id: 'healthcare_biotech',
      name: 'Healthcare Biotech',
      description: 'Biotechnology companies',
      category: 'healthcare',
    },
    {
      id: 'financial_services',
      name: 'Financial Services',
      description: 'Banks, insurance, and financial institutions',
      category: 'financial',
    },
    {
      id: 'financial_technology',
      name: 'Financial Technology',
      description: 'Financial technology companies',
      category: 'financial',
    },
    {
      id: 'financial_investment',
      name: 'Financial Investment',
      description: 'Investment and asset management firms',
      category: 'financial',
    },
    {
      id: 'financial_insurance',
      name: 'Financial Insurance',
      description: 'Insurance companies',
      category: 'financial',
    },
    {
      id: 'financial_banking',
      name: 'Financial Banking',
      description: 'Traditional and digital banks',
      category: 'financial',
    },
    {
      id: 'manufacturing_enterprise',
      name: 'Manufacturing Enterprise',
      description: 'Large manufacturing companies',
      category: 'manufacturing',
    },
    {
      id: 'manufacturing_automotive',
      name: 'Manufacturing Automotive',
      description: 'Automotive manufacturing',
      category: 'manufacturing',
    },
    {
      id: 'manufacturing_aerospace',
      name: 'Manufacturing Aerospace',
      description: 'Aerospace and defense manufacturing',
      category: 'manufacturing',
    },
    {
      id: 'manufacturing_electronics',
      name: 'Manufacturing Electronics',
      description: 'Electronics manufacturing',
      category: 'manufacturing',
    },
    {
      id: 'manufacturing_chemicals',
      name: 'Manufacturing Chemicals',
      description: 'Chemical manufacturing',
      category: 'manufacturing',
    },
    {
      id: 'retail_chain',
      name: 'Retail Chain',
      description: 'Retail chains and franchises',
      category: 'retail',
    },
    {
      id: 'retail_ecommerce',
      name: 'Retail E-commerce',
      description: 'E-commerce retailers',
      category: 'retail',
    },
    {
      id: 'retail_luxury',
      name: 'Retail Luxury',
      description: 'Luxury retail brands',
      category: 'retail',
    },
    {
      id: 'retail_grocery',
      name: 'Retail Grocery',
      description: 'Grocery and food retail',
      category: 'retail',
    },
    {
      id: 'retail_fashion',
      name: 'Retail Fashion',
      description: 'Fashion and apparel retail',
      category: 'retail',
    },
    {
      id: 'logistics_company',
      name: 'Logistics Company',
      description: 'Logistics and transportation companies',
      category: 'logistics',
    },
    {
      id: 'logistics_supply_chain',
      name: 'Logistics Supply Chain',
      description: 'Supply chain management companies',
      category: 'logistics',
    },
    {
      id: 'logistics_warehousing',
      name: 'Logistics Warehousing',
      description: 'Warehousing and distribution',
      category: 'logistics',
    },
    {
      id: 'logistics_freight',
      name: 'Logistics Freight',
      description: 'Freight and shipping companies',
      category: 'logistics',
    },
    {
      id: 'real_estate_company',
      name: 'Real Estate Company',
      description: 'Real estate and property management',
      category: 'real_estate',
    },
    {
      id: 'real_estate_development',
      name: 'Real Estate Development',
      description: 'Real estate development companies',
      category: 'real_estate',
    },
    {
      id: 'real_estate_investment',
      name: 'Real Estate Investment',
      description: 'Real estate investment firms',
      category: 'real_estate',
    },
    {
      id: 'legal_firm',
      name: 'Legal Firm',
      description: 'Law firms and legal services',
      category: 'legal',
    },
    {
      id: 'legal_corporate',
      name: 'Legal Corporate',
      description: 'Corporate law firms',
      category: 'legal',
    },
    {
      id: 'legal_intellectual_property',
      name: 'Legal IP',
      description: 'Intellectual property law firms',
      category: 'legal',
    },
    {
      id: 'consulting_firm',
      name: 'Consulting Firm',
      description: 'Large consulting firms',
      category: 'consulting',
    },
    {
      id: 'consulting_management',
      name: 'Consulting Management',
      description: 'Management consulting firms',
      category: 'consulting',
    },
    {
      id: 'consulting_technology',
      name: 'Consulting Technology',
      description: 'Technology consulting firms',
      category: 'consulting',
    },
    {
      id: 'consulting_strategy',
      name: 'Consulting Strategy',
      description: 'Strategy consulting firms',
      category: 'consulting',
    },
    {
      id: 'media_company',
      name: 'Media Company',
      description: 'Media and entertainment companies',
      category: 'media',
    },
    {
      id: 'media_digital',
      name: 'Media Digital',
      description: 'Digital media companies',
      category: 'media',
    },
    {
      id: 'media_publishing',
      name: 'Media Publishing',
      description: 'Publishing companies',
      category: 'media',
    },
    {
      id: 'media_broadcasting',
      name: 'Media Broadcasting',
      description: 'Broadcasting companies',
      category: 'media',
    },
    {
      id: 'education_institution',
      name: 'Education Institution',
      description: 'Educational institutions and training providers',
      category: 'education',
    },
    {
      id: 'education_higher',
      name: 'Education Higher',
      description: 'Higher education institutions',
      category: 'education',
    },
    {
      id: 'education_corporate',
      name: 'Education Corporate',
      description: 'Corporate training providers',
      category: 'education',
    },
    {
      id: 'education_online',
      name: 'Education Online',
      description: 'Online education platforms',
      category: 'education',
    },
    {
      id: 'education_k12',
      name: 'Education K-12',
      description: 'K-12 education institutions',
      category: 'education',
    },
  ],

  B2C: [
    // Demographics-based ICPs (15 variations)
    {
      id: 'young_professional',
      name: 'Young Professional',
      description: 'Young professionals aged 25-35',
      category: 'demographics',
    },
    {
      id: 'mid_career_professional',
      name: 'Mid-Career Professional',
      description: 'Established professionals aged 35-50',
      category: 'demographics',
    },
    {
      id: 'senior_professional',
      name: 'Senior Professional',
      description: 'Senior professionals aged 50-65',
      category: 'demographics',
    },
    {
      id: 'college_student',
      name: 'College Student',
      description: 'University students and recent graduates',
      category: 'demographics',
    },
    {
      id: 'young_parent',
      name: 'Young Parent',
      description: 'Parents with young children',
      category: 'demographics',
    },
    {
      id: 'empty_nester',
      name: 'Empty Nester',
      description: 'Parents with grown children',
      category: 'demographics',
    },
    {
      id: 'retiree',
      name: 'Retiree',
      description: 'Retired individuals',
      category: 'demographics',
    },
    {
      id: 'high_income_consumer',
      name: 'High-Income Consumer',
      description: 'High-income individuals',
      category: 'demographics',
    },
    {
      id: 'middle_income_consumer',
      name: 'Middle-Income Consumer',
      description: 'Middle-income individuals',
      category: 'demographics',
    },
    {
      id: 'budget_conscious',
      name: 'Budget-Conscious Consumer',
      description: 'Price-sensitive consumers',
      category: 'demographics',
    },
    {
      id: 'millennial',
      name: 'Millennial',
      description: 'Millennials (born 1981-1996)',
      category: 'demographics',
    },
    {
      id: 'gen_z',
      name: 'Gen Z',
      description: 'Generation Z (born 1997-2012)',
      category: 'demographics',
    },
    {
      id: 'gen_x',
      name: 'Gen X',
      description: 'Generation X (born 1965-1980)',
      category: 'demographics',
    },
    {
      id: 'baby_boomer',
      name: 'Baby Boomer',
      description: 'Baby Boomers (born 1946-1964)',
      category: 'demographics',
    },
    {
      id: 'urban_consumer',
      name: 'Urban Consumer',
      description: 'City-dwelling consumers',
      category: 'demographics',
    },
    {
      id: 'suburban_consumer',
      name: 'Suburban Consumer',
      description: 'Suburban consumers',
      category: 'demographics',
    },

    // Lifestyle-based ICPs (20 variations)
    {
      id: 'tech_enthusiast',
      name: 'Tech Enthusiast',
      description: 'Early adopters of technology',
      category: 'lifestyle',
    },
    {
      id: 'fitness_enthusiast',
      name: 'Fitness Enthusiast',
      description: 'Health and fitness focused individuals',
      category: 'lifestyle',
    },
    {
      id: 'fashion_conscious',
      name: 'Fashion-Conscious',
      description: 'Style and fashion focused individuals',
      category: 'lifestyle',
    },
    {
      id: 'home_improvement',
      name: 'Home Improvement',
      description: 'DIY and home improvement enthusiasts',
      category: 'lifestyle',
    },
    {
      id: 'travel_enthusiast',
      name: 'Travel Enthusiast',
      description: 'Frequent travelers and adventure seekers',
      category: 'lifestyle',
    },
    {
      id: 'food_enthusiast',
      name: 'Food Enthusiast',
      description: 'Food lovers and cooking enthusiasts',
      category: 'lifestyle',
    },
    {
      id: 'gaming_enthusiast',
      name: 'Gaming Enthusiast',
      description: 'Gamers and gaming community',
      category: 'lifestyle',
    },
    {
      id: 'book_lover',
      name: 'Book Lover',
      description: 'Avid readers and literature enthusiasts',
      category: 'lifestyle',
    },
    {
      id: 'music_lover',
      name: 'Music Lover',
      description: 'Music enthusiasts and concert-goers',
      category: 'lifestyle',
    },
    {
      id: 'pet_owner',
      name: 'Pet Owner',
      description: 'Pet owners and animal lovers',
      category: 'lifestyle',
    },
    {
      id: 'outdoor_enthusiast',
      name: 'Outdoor Enthusiast',
      description: 'Outdoor and nature lovers',
      category: 'lifestyle',
    },
    {
      id: 'art_enthusiast',
      name: 'Art Enthusiast',
      description: 'Art and culture lovers',
      category: 'lifestyle',
    },
    {
      id: 'sports_fan',
      name: 'Sports Fan',
      description: 'Sports enthusiasts and fans',
      category: 'lifestyle',
    },
    {
      id: 'car_enthusiast',
      name: 'Car Enthusiast',
      description: 'Automotive enthusiasts',
      category: 'lifestyle',
    },
    {
      id: 'photography_enthusiast',
      name: 'Photography Enthusiast',
      description: 'Photography and visual arts lovers',
      category: 'lifestyle',
    },
    {
      id: 'cooking_enthusiast',
      name: 'Cooking Enthusiast',
      description: 'Cooking and culinary enthusiasts',
      category: 'lifestyle',
    },
    {
      id: 'gardening_enthusiast',
      name: 'Gardening Enthusiast',
      description: 'Gardening and plant lovers',
      category: 'lifestyle',
    },
    {
      id: 'crafting_enthusiast',
      name: 'Crafting Enthusiast',
      description: 'DIY crafting and handmade enthusiasts',
      category: 'lifestyle',
    },
    {
      id: 'wellness_enthusiast',
      name: 'Wellness Enthusiast',
      description: 'Wellness and mindfulness focused',
      category: 'lifestyle',
    },
    {
      id: 'luxury_lifestyle',
      name: 'Luxury Lifestyle',
      description: 'Luxury lifestyle consumers',
      category: 'lifestyle',
    },
    {
      id: 'minimalist_lifestyle',
      name: 'Minimalist Lifestyle',
      description: 'Minimalist and simple living',
      category: 'lifestyle',
    },

    // Behavior-based ICPs (20 variations)
    {
      id: 'online_shopper',
      name: 'Online Shopper',
      description: 'Frequent online shoppers',
      category: 'behavior',
    },
    {
      id: 'social_media_user',
      name: 'Social Media User',
      description: 'Active social media users',
      category: 'behavior',
    },
    {
      id: 'mobile_first',
      name: 'Mobile-First User',
      description: 'Mobile device primary users',
      category: 'behavior',
    },
    {
      id: 'convenience_seeker',
      name: 'Convenience Seeker',
      description: 'Value convenience over price',
      category: 'behavior',
    },
    {
      id: 'quality_seeker',
      name: 'Quality Seeker',
      description: 'Prioritize quality over price',
      category: 'behavior',
    },
    {
      id: 'brand_loyal',
      name: 'Brand Loyal',
      description: 'Loyal to specific brands',
      category: 'behavior',
    },
    {
      id: 'deal_hunter',
      name: 'Deal Hunter',
      description: 'Always looking for deals and discounts',
      category: 'behavior',
    },
    {
      id: 'impulse_buyer',
      name: 'Impulse Buyer',
      description: 'Make spontaneous purchases',
      category: 'behavior',
    },
    {
      id: 'research_intensive',
      name: 'Research-Intensive',
      description: 'Extensive research before buying',
      category: 'behavior',
    },
    {
      id: 'influencer_follower',
      name: 'Influencer Follower',
      description: 'Follow and trust influencers',
      category: 'behavior',
    },
    {
      id: 'early_adopter',
      name: 'Early Adopter',
      description: 'First to try new products and trends',
      category: 'behavior',
    },
    {
      id: 'late_majority',
      name: 'Late Majority',
      description: 'Adopt after majority has tried',
      category: 'behavior',
    },
    {
      id: 'loyalty_program_member',
      name: 'Loyalty Program Member',
      description: 'Active in loyalty programs',
      category: 'behavior',
    },
    {
      id: 'subscription_lover',
      name: 'Subscription Lover',
      description: 'Prefer subscription-based services',
      category: 'behavior',
    },
    {
      id: 'one_time_buyer',
      name: 'One-Time Buyer',
      description: 'Prefer one-time purchases',
      category: 'behavior',
    },
    {
      id: 'bulk_buyer',
      name: 'Bulk Buyer',
      description: 'Prefer buying in bulk',
      category: 'behavior',
    },
    {
      id: 'seasonal_shopper',
      name: 'Seasonal Shopper',
      description: 'Shop primarily during sales seasons',
      category: 'behavior',
    },
    {
      id: 'cross_device_user',
      name: 'Cross-Device User',
      description: 'Use multiple devices for shopping',
      category: 'behavior',
    },
    {
      id: 'voice_shopper',
      name: 'Voice Shopper',
      description: 'Use voice assistants for shopping',
      category: 'behavior',
    },
    {
      id: 'social_shopper',
      name: 'Social Shopper',
      description: 'Shop with friends and family',
      category: 'behavior',
    },
    {
      id: 'solo_shopper',
      name: 'Solo Shopper',
      description: 'Prefer shopping alone',
      category: 'behavior',
    },
    {
      id: 'window_shopper',
      name: 'Window Shopper',
      description: 'Browse without immediate purchase intent',
      category: 'behavior',
    },

    // Specialized ICPs (15 variations)
    {
      id: 'environmental_conscious',
      name: 'Environmentally Conscious',
      description: 'Eco-friendly and sustainable living',
      category: 'specialized',
    },
    {
      id: 'minimalist',
      name: 'Minimalist',
      description: 'Minimalist lifestyle and consumption',
      category: 'specialized',
    },
    {
      id: 'luxury_consumer',
      name: 'Luxury Consumer',
      description: 'High-end and luxury product buyers',
      category: 'specialized',
    },
    {
      id: 'local_supporter',
      name: 'Local Supporter',
      description: 'Support local businesses and communities',
      category: 'specialized',
    },
    {
      id: 'digital_nomad',
      name: 'Digital Nomad',
      description: 'Remote workers and location-independent',
      category: 'specialized',
    },
    {
      id: 'creative_professional',
      name: 'Creative Professional',
      description: 'Creative professionals and artists',
      category: 'specialized',
    },
    {
      id: 'entrepreneur',
      name: 'Entrepreneur',
      description: 'Small business owners and entrepreneurs',
      category: 'specialized',
    },
    {
      id: 'investor',
      name: 'Investor',
      description: 'Investment and financial planning focused',
      category: 'specialized',
    },
    {
      id: 'health_conscious',
      name: 'Health-Conscious',
      description: 'Health and wellness focused',
      category: 'specialized',
    },
    {
      id: 'family_oriented',
      name: 'Family-Oriented',
      description: 'Family-focused decision making',
      category: 'specialized',
    },
    {
      id: 'single_professional',
      name: 'Single Professional',
      description: 'Single professionals without children',
      category: 'specialized',
    },
    {
      id: 'working_parent',
      name: 'Working Parent',
      description: 'Parents balancing work and family',
      category: 'specialized',
    },
    {
      id: 'student',
      name: 'Student',
      description: 'Students of all ages',
      category: 'specialized',
    },
    {
      id: 'senior_citizen',
      name: 'Senior Citizen',
      description: 'Senior citizens and elderly',
      category: 'specialized',
    },
    {
      id: 'disabled_consumer',
      name: 'Disabled Consumer',
      description: 'Consumers with disabilities',
      category: 'specialized',
    },
    {
      id: 'lgbtq_consumer',
      name: 'LGBTQ+ Consumer',
      description: 'LGBTQ+ community members',
      category: 'specialized',
    },
    {
      id: 'immigrant_consumer',
      name: 'Immigrant Consumer',
      description: 'Immigrant and multicultural consumers',
      category: 'specialized',
    },
    {
      id: 'rural_consumer',
      name: 'Rural Consumer',
      description: 'Rural and small-town consumers',
      category: 'specialized',
    },
    {
      id: 'military_consumer',
      name: 'Military Consumer',
      description: 'Military personnel and families',
      category: 'specialized',
    },
  ],

  B2B2C: [
    // Platform ICPs (10 variations)
    {
      id: 'marketplace_seller',
      name: 'Marketplace Seller',
      description: 'Sellers on e-commerce platforms',
      category: 'platform',
    },
    {
      id: 'platform_partner',
      name: 'Platform Partner',
      description: 'Partners in platform ecosystems',
      category: 'platform',
    },
    {
      id: 'franchise_owner',
      name: 'Franchise Owner',
      description: 'Franchise business owners',
      category: 'platform',
    },
    {
      id: 'affiliate_marketer',
      name: 'Affiliate Marketer',
      description: 'Affiliate marketing partners',
      category: 'platform',
    },
    {
      id: 'reseller',
      name: 'Reseller',
      description: 'Product resellers and distributors',
      category: 'platform',
    },
    {
      id: 'service_provider',
      name: 'Service Provider',
      description: 'Service providers on platforms',
      category: 'platform',
    },
    {
      id: 'content_creator',
      name: 'Content Creator',
      description: 'Content creators and influencers',
      category: 'platform',
    },
    {
      id: 'app_developer',
      name: 'App Developer',
      description: 'Mobile app developers',
      category: 'platform',
    },
    {
      id: 'api_partner',
      name: 'API Partner',
      description: 'API integration partners',
      category: 'platform',
    },
    {
      id: 'white_label_partner',
      name: 'White Label Partner',
      description: 'White label solution partners',
      category: 'platform',
    },
    {
      id: 'channel_partner',
      name: 'Channel Partner',
      description: 'Channel and distribution partners',
      category: 'platform',
    },

    // Hybrid ICPs (15 variations)
    {
      id: 'small_retailer',
      name: 'Small Retailer',
      description: 'Small retail businesses serving consumers',
      category: 'hybrid',
    },
    {
      id: 'local_service',
      name: 'Local Service',
      description: 'Local service businesses',
      category: 'hybrid',
    },
    {
      id: 'professional_service',
      name: 'Professional Service',
      description: 'Professional service providers',
      category: 'hybrid',
    },
    {
      id: 'consultant',
      name: 'Consultant',
      description: 'Independent consultants',
      category: 'hybrid',
    },
    {
      id: 'freelancer',
      name: 'Freelancer',
      description: 'Freelance professionals',
      category: 'hybrid',
    },
    {
      id: 'agency_owner',
      name: 'Agency Owner',
      description: 'Marketing and service agency owners',
      category: 'hybrid',
    },
    {
      id: 'coach_trainer',
      name: 'Coach/Trainer',
      description: 'Personal coaches and trainers',
      category: 'hybrid',
    },
    {
      id: 'instructor',
      name: 'Instructor',
      description: 'Educational instructors and teachers',
      category: 'hybrid',
    },
    {
      id: 'therapist',
      name: 'Therapist',
      description: 'Mental health and wellness therapists',
      category: 'hybrid',
    },
    {
      id: 'nutritionist',
      name: 'Nutritionist',
      description: 'Nutrition and health professionals',
      category: 'hybrid',
    },
    {
      id: 'personal_trainer',
      name: 'Personal Trainer',
      description: 'Fitness and personal training professionals',
      category: 'hybrid',
    },
    {
      id: 'photographer',
      name: 'Photographer',
      description: 'Professional photographers',
      category: 'hybrid',
    },
    {
      id: 'designer',
      name: 'Designer',
      description: 'Graphic and web designers',
      category: 'hybrid',
    },
    {
      id: 'writer',
      name: 'Writer',
      description: 'Content writers and copywriters',
      category: 'hybrid',
    },
    {
      id: 'virtual_assistant',
      name: 'Virtual Assistant',
      description: 'Virtual assistants and administrative support',
      category: 'hybrid',
    },
    {
      id: 'online_tutor',
      name: 'Online Tutor',
      description: 'Online tutoring and education services',
      category: 'hybrid',
    },
    {
      id: 'virtual_event_planner',
      name: 'Virtual Event Planner',
      description: 'Virtual event planning and coordination',
      category: 'hybrid',
    },
    {
      id: 'digital_marketer',
      name: 'Digital Marketer',
      description: 'Digital marketing professionals',
      category: 'hybrid',
    },
    {
      id: 'social_media_manager',
      name: 'Social Media Manager',
      description: 'Social media management professionals',
      category: 'hybrid',
    },
    {
      id: 'seo_specialist',
      name: 'SEO Specialist',
      description: 'Search engine optimization specialists',
      category: 'hybrid',
    },
  ],
};

// ICP Generation Rules from agents/icp_rules.md
const ICP_RULES = {
  business_model_logic: {
    B2B: 'If Target Market contains organizations/professional titles',
    B2C: 'If contains consumer groups',
    B2B2C: 'If both',
  },

  b2b_characteristics: [
    'Industry: The specific industry or niche your ideal customer operates in',
    'Company Size: Number of employees, annual revenue, or other relevant size metrics',
    'Location/Geography: Where your ideal customer is based',
    'Budget/Spending Power: Their ability and willingness to spend on your product or service',
    'Pain Points/Challenges: Specific problems your product or service solves',
    'Goals and Objectives: What your ideal customer is trying to achieve',
    'Decision-Maker/Buyer Persona: Identifying the key people involved in the purchase',
    'Buying Process Insights: Understanding how they typically go from problem to purchase',
  ],

  b2c_characteristics: [
    'Demographics: Age, gender, education level, marital status',
    'Income Range: Economic status and purchasing power',
    'Buying Behavior: Loyalty, product usage frequency, and shopping preferences',
    'Geographic Location: Their location and how it might influence their choices',
  ],

  other_considerations: [
    'Company Culture and Values: Does their culture align with your brand?',
    'Technology Stack: What tools are they already using?',
    'Growth Stage: Are they a startup, a scaling company, or established?',
    'Customer Lifetime Value: Consider the long-term value of these customers',
  ],

  fit_scoring_formula: {
    formula:
      'score = 0.35*industry_fit + 0.2*size_fit + 0.15*geo_fit + 0.15*pain_alignment + 0.15*goal_alignment',
    scales: {
      industry_fit: '0–100 (100 = industry matches perfectly)',
      size_fit: '0–100 (100 = company size matches perfectly)',
      geo_fit: '0–100 (100 = geography matches perfectly)',
      pain_alignment:
        '0–100 (100 = solved pains match customer pains perfectly)',
      goal_alignment: '0–100 (100 = strongly support goals)',
    },
    tiers: {
      'Tier 1': 'score >= 80',
      'Tier 2': '60 <= score < 80',
      'Tier 3': '40 <= score < 60',
      'N/A': '< 40',
    },
  },

  buying_triggers: [
    'New regulation or certification requirement',
    'Budget cycle start or cost pressure',
    'Technical migration/legacy system end-of-life',
    'Rapid growth or market expansion',
    'Quality/safety incident or audit',
  ],

  common_objections: [
    'Price/ROI uncertainty',
    'Integration and implementation effort',
    'Security and compliance concerns',
    'Vendor lock-in',
    'Resource shortage for user training',
  ],

  b2b_personas: [
    'Economic Buyer (e.g., CEO/CFO)',
    'Decision Maker (e.g., VP/Director)',
    'Influencer (e.g., Team Lead)',
    'User (daily user)',
    'Gatekeeper (IT/Legal/Procurement)',
  ],

  usage_guidelines: {
    targeting:
      'Focus your marketing and sales efforts on prospects that match your ICP',
    personalization:
      'Tailor your messaging and content to resonate with their specific needs and pain points',
    lead_qualification:
      'Use the ICP to identify leads that are a good fit and those that are not',
    content_creation:
      'Develop content that addresses their specific challenges and goals',
    reporting:
      'Track your results and see how well your marketing and sales efforts are performing with your ideal customers',
  },
};

export class ICPGenerator {
  private ollamaClient: OllamaClient;

  constructor() {
    this.ollamaClient = OllamaClient.getInstance();
  }

  /**
   * Generate comprehensive ICP profiles using company data
   */
  async generateICPs(companyData: any): Promise<ICP[]> {
    console.log('🎯 Starting comprehensive ICP generation...');
    console.log('🎯 Company data received:', {
      name: companyData.name,
      industry: companyData.industry,
      targetMarket: companyData.targetMarket,
      valueProposition: companyData.valueProposition,
    });

    try {
      // Step 1: Determine business model
      const businessModel = this.determineBusinessModel(companyData);
      console.log(`📊 Business Model: ${businessModel}`);

      // Step 2: Select best-fitting ICP templates
      const selectedTemplates = await this.selectBestFittingTemplates(
        companyData,
        businessModel,
      );
      console.log(`🎯 Selected ${selectedTemplates.length} ICP templates`);

      // Step 3: Generate ICP profiles for selected templates
      const icps: ICP[] = [];
      for (const template of selectedTemplates) {
        const icp = await this.generateICPFromTemplate(
          companyData,
          template,
          businessModel,
        );
        icps.push(icp);
      }

      console.log(`✅ Generated ${icps.length} ICP profiles`);
      return icps;
    } catch (error) {
      console.error('❌ ICP generation failed:', error);
      throw error;
    }
  }

  /**
   * Determine business model from company data
   */
  private determineBusinessModel(companyData: any): 'B2B' | 'B2C' | 'B2B2C' {
    const targetMarket = companyData.targetMarket?.toLowerCase() || '';
    const marketSegment = companyData.marketSegment?.toLowerCase() || '';

    const b2bIndicators = [
      'business',
      'company',
      'enterprise',
      'organization',
      'professional',
      'industry',
    ];
    const b2cIndicators = [
      'consumer',
      'individual',
      'personal',
      'customer',
      'user',
    ];

    const hasB2B = b2bIndicators.some(
      (indicator) =>
        targetMarket.includes(indicator) || marketSegment.includes(indicator),
    );
    const hasB2C = b2cIndicators.some(
      (indicator) =>
        targetMarket.includes(indicator) || marketSegment.includes(indicator),
    );

    if (hasB2B && hasB2C) return 'B2B2C';
    if (hasB2B) return 'B2B';
    return 'B2C';
  }

  /**
   * Select the 3 best-fitting ICP templates from dozens of options based on company data
   */
  private async selectBestFittingTemplates(
    companyData: any,
    businessModel: string,
  ): Promise<any[]> {
    const availableTemplates =
      ICP_TEMPLATES[businessModel as keyof typeof ICP_TEMPLATES] || [];

    // Group templates by category for better analysis
    const templatesByCategory = availableTemplates.reduce((acc, template) => {
      if (!acc[template.category]) {
        acc[template.category] = [];
      }
      acc[template.category].push(template);
      return acc;
    }, {} as Record<string, any[]>);

    // Map category names to English
    const categoryLabels: Record<string, string> = {
      startup: 'STARTUP COMPANIES',
      smb: 'SMALL-MEDIUM BUSINESSES',
      mid_market: 'MID-MARKET COMPANIES',
      enterprise: 'ENTERPRISE COMPANIES',
      healthcare: 'HEALTHCARE INDUSTRY',
      financial: 'FINANCIAL SERVICES',
      manufacturing: 'MANUFACTURING',
      retail: 'RETAIL',
      logistics: 'LOGISTICS & TRANSPORTATION',
      real_estate: 'REAL ESTATE',
      legal: 'LEGAL SERVICES',
      consulting: 'CONSULTING',
      media: 'MEDIA & ENTERTAINMENT',
      education: 'EDUCATION',
      demographics: 'DEMOGRAPHIC SEGMENTS',
      lifestyle: 'LIFESTYLE SEGMENTS',
      behavior: 'BEHAVIORAL SEGMENTS',
      specialized: 'SPECIALIZED SEGMENTS',
      platform: 'PLATFORM PARTNERS',
      hybrid: 'HYBRID BUSINESSES',
    };

    const prompt = `Analyze this company data and select the 3 BEST-FITTING ICP templates from ${
      availableTemplates.length
    } available options.

Company Data:
${this.formatCompanyData(companyData)}

Business Model: ${businessModel}

Available ICP Templates (${availableTemplates.length} total):
${Object.entries(templatesByCategory)
  .map(
    ([category, templates]) =>
      `${categoryLabels[category] || category.toUpperCase()} (${
        templates.length
      } options):\n${templates
        .map(
          (t) =>
            `- ID: "${t.id}" | Name: ${t.name} | Description: ${t.description}`,
        )
        .join('\n')}`,
  )
  .join('\n\n')}

Selection Criteria:
1. Industry Alignment: How well does the template match the company's industry?
2. Company Size Fit: Does the template match the company's size (startup/SMB/mid-market/enterprise)?
3. Target Market Match: Does the template align with the company's target market?
4. Value Proposition Alignment: Does the template fit the company's value proposition?
5. Business Model Compatibility: Does the template work with the company's business model?
6. Market Segment Relevance: Does the template match the company's market segment?

Analyze the company data carefully and select exactly 3 templates that would be MOST RELEVANT and ACTIONABLE for this specific company.

IMPORTANT: 
1. Respond with ONLY a JSON array of template IDs, no explanations or additional text
2. Use ONLY the exact template IDs listed above (e.g., "startup_innovator", "smb_optimizer", "tech_startup")
3. Do NOT create new template IDs or use descriptive names

Example: ["startup_innovator", "tech_startup", "saas_startup"]
`;

    const response = await this.ollamaClient.generateResponse(prompt);

    // Extract JSON from response - be more specific to avoid capturing too much
    const jsonMatch = response.match(/\[[\s\S]*?\]/);

    try {
      if (!jsonMatch) {
        throw new Error('No JSON array found in response');
      }

      let jsonStr = jsonMatch[0];

      // Clean up common LLM response artifacts
      jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      jsonStr = jsonStr.replace(/^- /gm, ''); // Remove bullet points
      jsonStr = jsonStr.replace(/^`/g, '').replace(/`$/g, ''); // Remove backticks
      jsonStr = jsonStr.trim();

      const selectedIds = JSON.parse(jsonStr) as string[];

      // Map IDs back to template objects
      const selectedTemplates = selectedIds
        .map((id) => availableTemplates.find((t) => t.id === id))
        .filter(Boolean);

      // Ensure we have exactly 3 templates
      if (selectedTemplates.length < 3) {
        const remaining = availableTemplates.filter(
          (t) => !selectedTemplates.some((st) => st?.id === t.id),
        );
        selectedTemplates.push(
          ...remaining.slice(0, 3 - selectedTemplates.length),
        );
      }

      console.log(
        `🎯 Selected ICP templates: ${selectedTemplates
          .map((t) => t?.name || 'Unknown')
          .join(', ')}`,
      );
      return selectedTemplates.slice(0, 3);
    } catch (error) {
      console.error('Failed to parse template selection:', error);
      console.error('Raw response:', response);
      console.error(
        'Attempted to extract JSON from:',
        jsonMatch ? jsonMatch[0] : 'No match found',
      );
      throw new Error(
        `Failed to parse template selection: ${
          error instanceof Error ? error.message : 'Unknown error'
        }. Raw response: ${response.substring(0, 200)}...`,
      );
    }
  }

  /**
   * Generate ICP profile from selected template using a simpler approach
   */
  private async generateICPFromTemplate(
    companyData: any,
    template: any,
    businessModel: string,
  ): Promise<ICP> {
    // Generate ICP in parts to avoid complex JSON parsing issues
    const icpId = `icp_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Generate segments
    console.log(`🎯 Generating segments for company: ${companyData.name}`);
    const segmentsPrompt = `Based on this company data and template, provide 2-3 relevant customer segments for ${template.name}:

Company: ${companyData.name}
Industry: ${companyData.industry}
Target Market: ${companyData.targetMarket}
Template: ${template.name} - ${template.description}

Respond with ONLY a comma-separated list of segments, no additional text.
Example: "Startup Founders, Tech Entrepreneurs, Small Business Owners"`;

    const segmentsResponse = await this.ollamaClient.generateResponse(
      segmentsPrompt,
    );
    const segments = segmentsResponse
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    // Generate pains
    console.log(`🎯 Generating pains for company: ${companyData.name}`);
    const painsPrompt = `Based on this company data and template, identify 3-4 specific pain points for ${template.name}:

Company: ${companyData.name}
Industry: ${companyData.industry}
Value Proposition: ${companyData.valueProposition}
Template: ${template.name} - ${template.description}

Respond with ONLY a comma-separated list of pain points, no additional text.
Example: "High operational costs, Limited scalability, Complex compliance requirements"`;

    const painsResponse = await this.ollamaClient.generateResponse(painsPrompt);
    const pains = painsResponse
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    // Generate jobs to be done
    const jobsPrompt = `Based on this company data and template, identify 3-4 jobs to be done for ${template.name}:

Company: ${companyData.name}
Industry: ${companyData.industry}
Main Offerings: ${companyData.mainOfferings}
Template: ${template.name} - ${template.description}

Respond with ONLY a comma-separated list of jobs, no additional text.
Example: "Reduce operational costs, Scale business efficiently, Ensure compliance"`;

    const jobsResponse = await this.ollamaClient.generateResponse(jobsPrompt);
    const jobs = jobsResponse
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    // Generate desired outcomes
    const outcomesPrompt = `Based on this company data and template, identify 3-4 desired outcomes for ${template.name}:

Company: ${companyData.name}
Industry: ${companyData.industry}
Customer Goals: ${companyData.customerGoals}
Template: ${template.name} - ${template.description}

Respond with ONLY a comma-separated list of outcomes, no additional text.
Example: "Increased efficiency, Cost savings, Improved compliance"`;

    const outcomesResponse = await this.ollamaClient.generateResponse(
      outcomesPrompt,
    );
    const outcomes = outcomesResponse
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    // Generate buying triggers
    const triggersPrompt = `Based on this company data and template, identify 3-4 buying triggers for ${template.name}:

Company: ${companyData.name}
Industry: ${companyData.industry}
Template: ${template.name} - ${template.description}

Respond with ONLY a comma-separated list of triggers, no additional text.
Example: "New business expansion, Regulatory changes, Technology upgrades"`;

    const triggersResponse = await this.ollamaClient.generateResponse(
      triggersPrompt,
    );
    const triggers = triggersResponse
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    // Generate common objections
    const objectionsPrompt = `Based on this company data and template, identify 3-4 common objections for ${template.name}:

Company: ${companyData.name}
Industry: ${companyData.industry}
Pricing Model: ${companyData.pricingModel}
Template: ${template.name} - ${template.description}

Respond with ONLY a comma-separated list of objections, no additional text.
Example: "High upfront costs, Implementation complexity, ROI uncertainty"`;

    const objectionsResponse = await this.ollamaClient.generateResponse(
      objectionsPrompt,
    );
    const objections = objectionsResponse
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    // Generate value proposition
    const valuePropPrompt = `Based on this company data and template, create a value proposition for ${template.name}:

Company: ${companyData.name}
Industry: ${companyData.industry}
Value Proposition: ${companyData.valueProposition}
Unique Features: ${companyData.uniqueFeatures}
Template: ${template.name} - ${template.description}

Respond with ONLY the value proposition sentence, no additional text.`;

    const valuePropResponse = await this.ollamaClient.generateResponse(
      valuePropPrompt,
    );
    const valueProp = valuePropResponse.trim();

    // Generate unique features
    const featuresPrompt = `Based on this company data and template, identify 3 unique features for ${template.name}:

Company: ${companyData.name}
Industry: ${companyData.industry}
Unique Features: ${companyData.uniqueFeatures}
Template: ${template.name} - ${template.description}

Respond with ONLY a comma-separated list of features, no additional text.
Example: "AI-powered optimization, 24/7 monitoring, Custom integrations"`;

    const featuresResponse = await this.ollamaClient.generateResponse(
      featuresPrompt,
    );
    const features = featuresResponse
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    // Generate competitive advantages
    const advantagesPrompt = `Based on this company data and template, identify 3 competitive advantages for ${template.name}:

Company: ${companyData.name}
Industry: ${companyData.industry}
Competitive Advantages: ${companyData.competitiveAdvantages}
Template: ${template.name} - ${template.description}

Respond with ONLY a comma-separated list of advantages, no additional text.
Example: "Proven ROI, Industry expertise, Comprehensive support"`;

    const advantagesResponse = await this.ollamaClient.generateResponse(
      advantagesPrompt,
    );
    const advantages = advantagesResponse
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    // Generate go-to-market channels
    const channelsPrompt = `Based on this company data and template, identify 3 go-to-market channels for ${template.name}:

Company: ${companyData.name}
Industry: ${companyData.industry}
Current Marketing Channels: ${companyData.currentMarketingChannels}
Template: ${template.name} - ${template.description}

Respond with ONLY a comma-separated list of channels, no additional text.
Example: "LinkedIn advertising, Industry events, Referral programs"`;

    const channelsResponse = await this.ollamaClient.generateResponse(
      channelsPrompt,
    );
    const channels = channelsResponse
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    // Generate messages
    const messagesPrompt = `Based on this company data and template, identify 3 key messages for ${template.name}:

Company: ${companyData.name}
Industry: ${companyData.industry}
Marketing Messaging: ${companyData.marketingMessaging}
Template: ${template.name} - ${template.description}

Respond with ONLY a comma-separated list of messages, no additional text.
Example: "Reduce costs by 30%, Improve efficiency, Scale your business"`;

    const messagesResponse = await this.ollamaClient.generateResponse(
      messagesPrompt,
    );
    const messages = messagesResponse
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    // Generate content ideas
    const contentPrompt = `Based on this company data and template, identify 3 content ideas for ${template.name}:

Company: ${companyData.name}
Industry: ${companyData.industry}
Template: ${template.name} - ${template.description}

Respond with ONLY a comma-separated list of content ideas, no additional text.
Example: "Case studies, Webinars, Industry reports"`;

    const contentResponse = await this.ollamaClient.generateResponse(
      contentPrompt,
    );
    const content = contentResponse
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    // Create the ICP object
    const icp: ICP = {
      icp_id: icpId,
      icp_name: template.name,
      business_model: businessModel as 'B2B' | 'B2C' | 'B2B2C',
      meta: {
        generated_at: new Date().toISOString(),
        source_company: companyData.name,
      },
      segments: segments,
      fit_definition: {
        company_attributes: {
          industries: [companyData.industry || 'Technology'],
          company_sizes: ['Small Business', 'Medium Business'],
          geographies: ['Global'],
          tech_stack_hints: ['Modern SaaS', 'Cloud-based'],
        },
        buyer_personas: [
          {
            role: 'Decision Maker',
            seniority: 'Mid-level',
            dept: 'Operations',
            decision_power: 'decision maker',
          },
        ],
      },
      needs_pain_goals: {
        pains: pains,
        jobs_to_be_done: jobs,
        desired_outcomes: outcomes,
      },
      buying_triggers: triggers,
      common_objections: objections,
      value_prop_alignment: {
        value_prop: valueProp,
        unique_features: features,
        competitive_advantages: advantages,
      },
      offerings_pricing: {
        main_offerings: companyData.mainOfferings
          ? companyData.mainOfferings.split(',').map((s: string) => s.trim())
          : ['Software Solutions'],
        pricing_model: companyData.pricingModel || 'Subscription-based',
        packaging_notes: 'Flexible pricing options, Custom enterprise plans',
      },
      go_to_market: {
        primary_channels: channels,
        messages: messages,
        content_ideas: content,
      },
      fit_scoring: {
        score: 85,
        score_breakdown: {
          industry_fit: 90,
          size_fit: 85,
          geo_fit: 80,
          pain_alignment: 85,
          goal_alignment: 80,
        },
      },
      abm_tier: 'Tier 1',
      confidence: 'high',
    };

    return icp;
  }

  /**
   * Format company data for LLM prompt
   */
  private formatCompanyData(companyData: any): string {
    const fields = [
      'name',
      'website',
      'social',
      'location',
      'industry',
      'companySize',
      'targetMarket',
      'valueProposition',
      'mainOfferings',
      'pricingModel',
      'uniqueFeatures',
      'marketSegment',
      'competitiveAdvantages',
      'currentCustomers',
      'successStories',
      'painPointsSolved',
      'customerGoals',
      'currentMarketingChannels',
      'marketingMessaging',
    ];

    return fields
      .map((field) => {
        const value = companyData[field];
        return value ? `${field}: ${value}` : null;
      })
      .filter(Boolean)
      .join('\n');
  }
}
