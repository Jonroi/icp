export interface ICPTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
}

export const B2B_TEMPLATES: ICPTemplate[] = [
  // Startup/SMB ICPs (20 variations)
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
    description: 'Software-as-a-Service companies building scalable solutions',
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
    id: 'enterprise_technology',
    name: 'Enterprise Technology',
    description: 'Large companies modernizing technology',
    category: 'enterprise',
  },
  {
    id: 'enterprise_data',
    name: 'Enterprise Data',
    description: 'Large companies managing data',
    category: 'enterprise',
  },
  {
    id: 'enterprise_cloud',
    name: 'Enterprise Cloud',
    description: 'Large companies migrating to cloud',
    category: 'enterprise',
  },
  {
    id: 'enterprise_mobile',
    name: 'Enterprise Mobile',
    description: 'Large companies going mobile',
    category: 'enterprise',
  },
];
