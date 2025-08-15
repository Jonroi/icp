-- PostgreSQL Schema v2 for ICP Builder
-- Clean, simplified schema for company data management

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (for authentication)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Company data table (stores individual field values)
CREATE TABLE IF NOT EXISTS company_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    field_name VARCHAR(100) NOT NULL,
    field_value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    version INTEGER DEFAULT 1,
    
    -- Ensure one value per field per user
    UNIQUE(user_id, field_name)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_company_data_user_id ON company_data(user_id);
CREATE INDEX IF NOT EXISTS idx_company_data_field_name ON company_data(field_name);
CREATE INDEX IF NOT EXISTS idx_company_data_updated_at ON company_data(updated_at);

-- ICP profiles table (generated from company data)
CREATE TABLE IF NOT EXISTS icp_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    profile_data JSONB NOT NULL,
    confidence_level VARCHAR(20) DEFAULT 'medium',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for ICP profiles
CREATE INDEX IF NOT EXISTS idx_icp_profiles_user_id ON icp_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_icp_profiles_created_at ON icp_profiles(created_at);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_company_data_updated_at ON company_data;
CREATE TRIGGER update_company_data_updated_at BEFORE UPDATE ON company_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_icp_profiles_updated_at ON icp_profiles;
CREATE TRIGGER update_icp_profiles_updated_at BEFORE UPDATE ON icp_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get company data as JSON
CREATE OR REPLACE FUNCTION get_company_data_json(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_object_agg(field_name, field_value)
    INTO result
    FROM company_data
    WHERE user_id = p_user_id AND field_value != '';
    
    RETURN COALESCE(result, '{}'::json);
END;
$$ LANGUAGE plpgsql;

-- Function to check if user can generate ICPs (needs at least 5 fields)
CREATE OR REPLACE FUNCTION can_generate_icps(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    filled_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO filled_count
    FROM company_data
    WHERE user_id = p_user_id AND field_value != '';
    
    RETURN filled_count >= 5;
END;
$$ LANGUAGE plpgsql;

-- Create test user
INSERT INTO users (id, email, name) VALUES 
    ('11111111-1111-1111-1111-111111111111'::UUID, 'test@example.com', 'Test User')
ON CONFLICT (id) DO NOTHING;

-- Insert 5 different companies from different industries
-- Company 1: Tech Startup (SaaS)
INSERT INTO company_data (user_id, field_name, field_value) VALUES 
    ('11111111-1111-1111-1111-111111111111'::UUID, 'name', 'TechFlow Solutions'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'location', 'San Francisco, CA'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'website', 'https://techflow.com'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'social', '@techflow_solutions'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'industry', 'SaaS / Technology'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'companySize', '10-50 employees'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'targetMarket', 'Small to medium businesses'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'valueProposition', 'Streamlined workflow automation'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'mainOfferings', 'Project management SaaS platform'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'pricingModel', 'Subscription-based'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'uniqueFeatures', 'AI-powered task prioritization'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'marketSegment', 'B2B SaaS'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'competitiveAdvantages', 'Advanced analytics and reporting'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'currentCustomers', '500+ active users'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'successStories', 'Increased productivity by 40%'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'painPointsSolved', 'Project delays and communication gaps'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'customerGoals', 'Improve team collaboration and efficiency'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'currentMarketingChannels', 'Digital marketing, content marketing'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'marketingMessaging', 'Transform your workflow with AI-powered insights')
ON CONFLICT (user_id, field_name) DO UPDATE SET 
    field_value = EXCLUDED.field_value,
    updated_at = NOW(),
    version = company_data.version + 1;

-- Company 2: Healthcare (Digital Health)
INSERT INTO company_data (user_id, field_name, field_value) VALUES 
    ('11111111-1111-1111-1111-111111111111'::UUID, 'name', 'HealthTech Innovations'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'location', 'Boston, MA'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'website', 'https://healthtechinnovations.com'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'social', '@healthtech_innovations'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'industry', 'Digital Health / Healthcare'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'companySize', '50-200 employees'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'targetMarket', 'Healthcare providers and patients'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'valueProposition', 'Revolutionary patient monitoring solutions'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'mainOfferings', 'Remote patient monitoring devices and software'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'pricingModel', 'Device sales + subscription'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'uniqueFeatures', 'Real-time health data analytics'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'marketSegment', 'B2B2C Healthcare'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'competitiveAdvantages', 'FDA-approved technology'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'currentCustomers', '200+ healthcare facilities'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'successStories', 'Reduced hospital readmissions by 30%'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'painPointsSolved', 'Patient monitoring and early intervention'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'customerGoals', 'Improve patient outcomes and reduce costs'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'currentMarketingChannels', 'Medical conferences, direct sales'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'marketingMessaging', 'Empowering healthcare with smart monitoring')
ON CONFLICT (user_id, field_name) DO UPDATE SET 
    field_value = EXCLUDED.field_value,
    updated_at = NOW(),
    version = company_data.version + 1;

-- Company 3: E-commerce (Fashion)
INSERT INTO company_data (user_id, field_name, field_value) VALUES 
    ('11111111-1111-1111-1111-111111111111'::UUID, 'name', 'StyleHub Fashion'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'location', 'New York, NY'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'website', 'https://stylehub.com'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'social', '@stylehub_fashion'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'industry', 'E-commerce / Fashion'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'companySize', '100-500 employees'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'targetMarket', 'Fashion-conscious consumers'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'valueProposition', 'Curated sustainable fashion marketplace'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'mainOfferings', 'Online fashion retail platform'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'pricingModel', 'Commission-based marketplace'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'uniqueFeatures', 'AI-powered style recommendations'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'marketSegment', 'B2C E-commerce'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'competitiveAdvantages', 'Sustainable fashion focus'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'currentCustomers', '50,000+ active shoppers'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'successStories', 'Increased customer retention by 60%'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'painPointsSolved', 'Finding sustainable fashion options'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'customerGoals', 'Discover unique, sustainable fashion'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'currentMarketingChannels', 'Social media, influencer partnerships'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'marketingMessaging', 'Fashion that feels good and does good')
ON CONFLICT (user_id, field_name) DO UPDATE SET 
    field_value = EXCLUDED.field_value,
    updated_at = NOW(),
    version = company_data.version + 1;

-- Company 4: Manufacturing (Industrial)
INSERT INTO company_data (user_id, field_name, field_value) VALUES 
    ('11111111-1111-1111-1111-111111111111'::UUID, 'name', 'Precision Manufacturing Co.'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'location', 'Detroit, MI'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'website', 'https://precisionmanufacturing.com'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'social', '@precision_mfg'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'industry', 'Manufacturing / Industrial'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'companySize', '500-1000 employees'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'targetMarket', 'Automotive and aerospace industries'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'valueProposition', 'High-precision manufacturing solutions'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'mainOfferings', 'Custom metal fabrication and assembly'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'pricingModel', 'Project-based pricing'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'uniqueFeatures', 'Advanced robotics and automation'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'marketSegment', 'B2B Manufacturing'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'competitiveAdvantages', 'ISO 9001 certified, 40 years experience'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'currentCustomers', 'Major automotive OEMs'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'successStories', 'Reduced production time by 25%'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'painPointsSolved', 'Complex manufacturing requirements'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'customerGoals', 'High-quality, cost-effective manufacturing'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'currentMarketingChannels', 'Trade shows, direct sales'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'marketingMessaging', 'Precision engineering for tomorrow''s challenges')
ON CONFLICT (user_id, field_name) DO UPDATE SET 
    field_value = EXCLUDED.field_value,
    updated_at = NOW(),
    version = company_data.version + 1;

-- Company 5: Financial Services (FinTech)
INSERT INTO company_data (user_id, field_name, field_value) VALUES 
    ('11111111-1111-1111-1111-111111111111'::UUID, 'name', 'SmartFinance Solutions'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'location', 'Austin, TX'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'website', 'https://smartfinance.com'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'social', '@smartfinance_solutions'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'industry', 'Financial Services / FinTech'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'companySize', '200-500 employees'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'targetMarket', 'Small businesses and startups'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'valueProposition', 'AI-powered financial management platform'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'mainOfferings', 'Business banking and financial analytics'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'pricingModel', 'Transaction fees + subscription'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'uniqueFeatures', 'Real-time cash flow predictions'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'marketSegment', 'B2B FinTech'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'competitiveAdvantages', 'Advanced AI algorithms'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'currentCustomers', '10,000+ business accounts'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'successStories', 'Helped businesses save 15% on expenses'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'painPointsSolved', 'Complex financial management'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'customerGoals', 'Simplify business finances'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'currentMarketingChannels', 'Digital marketing, partnerships'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'marketingMessaging', 'Smart finance for smart businesses')
ON CONFLICT (user_id, field_name) DO UPDATE SET 
    field_value = EXCLUDED.field_value,
    updated_at = NOW(),
    version = company_data.version + 1;
