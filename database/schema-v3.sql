-- PostgreSQL Schema v3 for ICP Builder
-- Support for multiple companies per user

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

-- Companies table (one row per company)
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Company data table (stores individual field values per company)
CREATE TABLE IF NOT EXISTS company_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    field_name VARCHAR(100) NOT NULL,
    field_value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    version INTEGER DEFAULT 1,
    
    -- Ensure one value per field per company
    UNIQUE(company_id, field_name)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_companies_user_id ON companies(user_id);
CREATE INDEX IF NOT EXISTS idx_company_data_company_id ON company_data(company_id);
CREATE INDEX IF NOT EXISTS idx_company_data_field_name ON company_data(field_name);
CREATE INDEX IF NOT EXISTS idx_company_data_updated_at ON company_data(updated_at);

-- ICP profiles table (generated from company data)
CREATE TABLE IF NOT EXISTS icp_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    profile_data JSONB NOT NULL,
    confidence_level VARCHAR(20) DEFAULT 'medium',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for ICP profiles
CREATE INDEX IF NOT EXISTS idx_icp_profiles_company_id ON icp_profiles(company_id);
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

DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_company_data_updated_at ON company_data;
CREATE TRIGGER update_company_data_updated_at BEFORE UPDATE ON company_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_icp_profiles_updated_at ON icp_profiles;
CREATE TRIGGER update_icp_profiles_updated_at BEFORE UPDATE ON icp_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get company data as JSON
CREATE OR REPLACE FUNCTION get_company_data_json(p_company_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_object_agg(field_name, field_value)
    INTO result
    FROM company_data
    WHERE company_id = p_company_id AND field_value != '';
    
    RETURN COALESCE(result, '{}'::json);
END;
$$ LANGUAGE plpgsql;

-- Function to check if company can generate ICPs (needs at least 5 fields)
CREATE OR REPLACE FUNCTION can_generate_icps(p_company_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    filled_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO filled_count
    FROM company_data
    WHERE company_id = p_company_id AND field_value != '';
    
    RETURN filled_count >= 5;
END;
$$ LANGUAGE plpgsql;

-- Create test user
INSERT INTO users (id, email, name) VALUES 
    ('11111111-1111-1111-1111-111111111111'::UUID, 'test@example.com', 'Test User')
ON CONFLICT (id) DO NOTHING;

-- Create 5 companies
INSERT INTO companies (id, user_id, name) VALUES 
    ('22222222-2222-2222-2222-222222222222'::UUID, '11111111-1111-1111-1111-111111111111'::UUID, 'TechFlow Solutions'),
    ('33333333-3333-3333-3333-333333333333'::UUID, '11111111-1111-1111-1111-111111111111'::UUID, 'HealthTech Innovations'),
    ('44444444-4444-4444-4444-444444444444'::UUID, '11111111-1111-1111-1111-111111111111'::UUID, 'StyleHub Fashion'),
    ('55555555-5555-5555-5555-555555555555'::UUID, '11111111-1111-1111-1111-111111111111'::UUID, 'Precision Manufacturing Co.'),
    ('66666666-6666-6666-6666-666666666666'::UUID, '11111111-1111-1111-1111-111111111111'::UUID, 'SmartFinance Solutions')
ON CONFLICT (id) DO NOTHING;

-- Company 1: TechFlow Solutions (SaaS)
INSERT INTO company_data (company_id, field_name, field_value) VALUES 
    ('22222222-2222-2222-2222-222222222222'::UUID, 'name', 'TechFlow Solutions'),
    ('22222222-2222-2222-2222-222222222222'::UUID, 'location', 'San Francisco, CA'),
    ('22222222-2222-2222-2222-222222222222'::UUID, 'website', 'https://techflow.com'),
    ('22222222-2222-2222-2222-222222222222'::UUID, 'social', '@techflow_solutions'),
    ('22222222-2222-2222-2222-222222222222'::UUID, 'industry', 'SaaS / Technology'),
    ('22222222-2222-2222-2222-222222222222'::UUID, 'companySize', '10-50 employees'),
    ('22222222-2222-2222-2222-222222222222'::UUID, 'targetMarket', 'Small to medium businesses'),
    ('22222222-2222-2222-2222-222222222222'::UUID, 'valueProposition', 'Streamlined workflow automation'),
    ('22222222-2222-2222-2222-222222222222'::UUID, 'mainOfferings', 'Project management SaaS platform'),
    ('22222222-2222-2222-2222-222222222222'::UUID, 'pricingModel', 'Subscription-based'),
    ('22222222-2222-2222-2222-222222222222'::UUID, 'uniqueFeatures', 'AI-powered task prioritization'),
    ('22222222-2222-2222-2222-222222222222'::UUID, 'marketSegment', 'B2B SaaS'),
    ('22222222-2222-2222-2222-222222222222'::UUID, 'competitiveAdvantages', 'Advanced analytics and reporting'),
    ('22222222-2222-2222-2222-222222222222'::UUID, 'currentCustomers', '500+ active users'),
    ('22222222-2222-2222-2222-222222222222'::UUID, 'successStories', 'Increased productivity by 40%'),
    ('22222222-2222-2222-2222-222222222222'::UUID, 'painPointsSolved', 'Project delays and communication gaps'),
    ('22222222-2222-2222-2222-222222222222'::UUID, 'customerGoals', 'Improve team collaboration and efficiency'),
    ('22222222-2222-2222-2222-222222222222'::UUID, 'currentMarketingChannels', 'Digital marketing, content marketing'),
    ('22222222-2222-2222-2222-222222222222'::UUID, 'marketingMessaging', 'Transform your workflow with AI-powered insights')
ON CONFLICT (company_id, field_name) DO UPDATE SET 
    field_value = EXCLUDED.field_value,
    updated_at = NOW(),
    version = company_data.version + 1;

-- Company 2: HealthTech Innovations (Healthcare)
INSERT INTO company_data (company_id, field_name, field_value) VALUES 
    ('33333333-3333-3333-3333-333333333333'::UUID, 'name', 'HealthTech Innovations'),
    ('33333333-3333-3333-3333-333333333333'::UUID, 'location', 'Boston, MA'),
    ('33333333-3333-3333-3333-333333333333'::UUID, 'website', 'https://healthtechinnovations.com'),
    ('33333333-3333-3333-3333-333333333333'::UUID, 'social', '@healthtech_innovations'),
    ('33333333-3333-3333-3333-333333333333'::UUID, 'industry', 'Digital Health / Healthcare'),
    ('33333333-3333-3333-3333-333333333333'::UUID, 'companySize', '50-200 employees'),
    ('33333333-3333-3333-3333-333333333333'::UUID, 'targetMarket', 'Healthcare providers and patients'),
    ('33333333-3333-3333-3333-333333333333'::UUID, 'valueProposition', 'Revolutionary patient monitoring solutions'),
    ('33333333-3333-3333-3333-333333333333'::UUID, 'mainOfferings', 'Remote patient monitoring devices and software'),
    ('33333333-3333-3333-3333-333333333333'::UUID, 'pricingModel', 'Device sales + subscription'),
    ('33333333-3333-3333-3333-333333333333'::UUID, 'uniqueFeatures', 'Real-time health data analytics'),
    ('33333333-3333-3333-3333-333333333333'::UUID, 'marketSegment', 'B2B2C Healthcare'),
    ('33333333-3333-3333-3333-333333333333'::UUID, 'competitiveAdvantages', 'FDA-approved technology'),
    ('33333333-3333-3333-3333-333333333333'::UUID, 'currentCustomers', '200+ healthcare facilities'),
    ('33333333-3333-3333-3333-333333333333'::UUID, 'successStories', 'Reduced hospital readmissions by 30%'),
    ('33333333-3333-3333-3333-333333333333'::UUID, 'painPointsSolved', 'Patient monitoring and early intervention'),
    ('33333333-3333-3333-3333-333333333333'::UUID, 'customerGoals', 'Improve patient outcomes and reduce costs'),
    ('33333333-3333-3333-3333-333333333333'::UUID, 'currentMarketingChannels', 'Medical conferences, direct sales'),
    ('33333333-3333-3333-3333-333333333333'::UUID, 'marketingMessaging', 'Empowering healthcare with smart monitoring')
ON CONFLICT (company_id, field_name) DO UPDATE SET 
    field_value = EXCLUDED.field_value,
    updated_at = NOW(),
    version = company_data.version + 1;

-- Company 3: StyleHub Fashion (E-commerce)
INSERT INTO company_data (company_id, field_name, field_value) VALUES 
    ('44444444-4444-4444-4444-444444444444'::UUID, 'name', 'StyleHub Fashion'),
    ('44444444-4444-4444-4444-444444444444'::UUID, 'location', 'New York, NY'),
    ('44444444-4444-4444-4444-444444444444'::UUID, 'website', 'https://stylehub.com'),
    ('44444444-4444-4444-4444-444444444444'::UUID, 'social', '@stylehub_fashion'),
    ('44444444-4444-4444-4444-444444444444'::UUID, 'industry', 'E-commerce / Fashion'),
    ('44444444-4444-4444-4444-444444444444'::UUID, 'companySize', '100-500 employees'),
    ('44444444-4444-4444-4444-444444444444'::UUID, 'targetMarket', 'Fashion-conscious consumers'),
    ('44444444-4444-4444-4444-444444444444'::UUID, 'valueProposition', 'Curated sustainable fashion marketplace'),
    ('44444444-4444-4444-4444-444444444444'::UUID, 'mainOfferings', 'Online fashion retail platform'),
    ('44444444-4444-4444-4444-444444444444'::UUID, 'pricingModel', 'Commission-based marketplace'),
    ('44444444-4444-4444-4444-444444444444'::UUID, 'uniqueFeatures', 'AI-powered style recommendations'),
    ('44444444-4444-4444-4444-444444444444'::UUID, 'marketSegment', 'B2C E-commerce'),
    ('44444444-4444-4444-4444-444444444444'::UUID, 'competitiveAdvantages', 'Sustainable fashion focus'),
    ('44444444-4444-4444-4444-444444444444'::UUID, 'currentCustomers', '50,000+ active shoppers'),
    ('44444444-4444-4444-4444-444444444444'::UUID, 'successStories', 'Increased customer retention by 60%'),
    ('44444444-4444-4444-4444-444444444444'::UUID, 'painPointsSolved', 'Finding sustainable fashion options'),
    ('44444444-4444-4444-4444-444444444444'::UUID, 'customerGoals', 'Discover unique, sustainable fashion'),
    ('44444444-4444-4444-4444-444444444444'::UUID, 'currentMarketingChannels', 'Social media, influencer partnerships'),
    ('44444444-4444-4444-4444-444444444444'::UUID, 'marketingMessaging', 'Fashion that feels good and does good')
ON CONFLICT (company_id, field_name) DO UPDATE SET 
    field_value = EXCLUDED.field_value,
    updated_at = NOW(),
    version = company_data.version + 1;

-- Company 4: Precision Manufacturing Co. (Manufacturing)
INSERT INTO company_data (company_id, field_name, field_value) VALUES 
    ('55555555-5555-5555-5555-555555555555'::UUID, 'name', 'Precision Manufacturing Co.'),
    ('55555555-5555-5555-5555-555555555555'::UUID, 'location', 'Detroit, MI'),
    ('55555555-5555-5555-5555-555555555555'::UUID, 'website', 'https://precisionmanufacturing.com'),
    ('55555555-5555-5555-5555-555555555555'::UUID, 'social', '@precision_mfg'),
    ('55555555-5555-5555-5555-555555555555'::UUID, 'industry', 'Manufacturing / Industrial'),
    ('55555555-5555-5555-5555-555555555555'::UUID, 'companySize', '500-1000 employees'),
    ('55555555-5555-5555-5555-555555555555'::UUID, 'targetMarket', 'Automotive and aerospace industries'),
    ('55555555-5555-5555-5555-555555555555'::UUID, 'valueProposition', 'High-precision manufacturing solutions'),
    ('55555555-5555-5555-5555-555555555555'::UUID, 'mainOfferings', 'Custom metal fabrication and assembly'),
    ('55555555-5555-5555-5555-555555555555'::UUID, 'pricingModel', 'Project-based pricing'),
    ('55555555-5555-5555-5555-555555555555'::UUID, 'uniqueFeatures', 'Advanced robotics and automation'),
    ('55555555-5555-5555-5555-555555555555'::UUID, 'marketSegment', 'B2B Manufacturing'),
    ('55555555-5555-5555-5555-555555555555'::UUID, 'competitiveAdvantages', 'ISO 9001 certified, 40 years experience'),
    ('55555555-5555-5555-5555-555555555555'::UUID, 'currentCustomers', 'Major automotive OEMs'),
    ('55555555-5555-5555-5555-555555555555'::UUID, 'successStories', 'Reduced production time by 25%'),
    ('55555555-5555-5555-5555-555555555555'::UUID, 'painPointsSolved', 'Complex manufacturing requirements'),
    ('55555555-5555-5555-5555-555555555555'::UUID, 'customerGoals', 'High-quality, cost-effective manufacturing'),
    ('55555555-5555-5555-5555-555555555555'::UUID, 'currentMarketingChannels', 'Trade shows, direct sales'),
    ('55555555-5555-5555-5555-555555555555'::UUID, 'marketingMessaging', 'Precision engineering for tomorrow''s challenges')
ON CONFLICT (company_id, field_name) DO UPDATE SET 
    field_value = EXCLUDED.field_value,
    updated_at = NOW(),
    version = company_data.version + 1;

-- Company 5: SmartFinance Solutions (FinTech)
INSERT INTO company_data (company_id, field_name, field_value) VALUES 
    ('66666666-6666-6666-6666-666666666666'::UUID, 'name', 'SmartFinance Solutions'),
    ('66666666-6666-6666-6666-666666666666'::UUID, 'location', 'Austin, TX'),
    ('66666666-6666-6666-6666-666666666666'::UUID, 'website', 'https://smartfinance.com'),
    ('66666666-6666-6666-6666-666666666666'::UUID, 'social', '@smartfinance_solutions'),
    ('66666666-6666-6666-6666-666666666666'::UUID, 'industry', 'Financial Services / FinTech'),
    ('66666666-6666-6666-6666-666666666666'::UUID, 'companySize', '200-500 employees'),
    ('66666666-6666-6666-6666-666666666666'::UUID, 'targetMarket', 'Small businesses and startups'),
    ('66666666-6666-6666-6666-666666666666'::UUID, 'valueProposition', 'AI-powered financial management platform'),
    ('66666666-6666-6666-6666-666666666666'::UUID, 'mainOfferings', 'Business banking and financial analytics'),
    ('66666666-6666-6666-6666-666666666666'::UUID, 'pricingModel', 'Transaction fees + subscription'),
    ('66666666-6666-6666-6666-666666666666'::UUID, 'uniqueFeatures', 'Real-time cash flow predictions'),
    ('66666666-6666-6666-6666-666666666666'::UUID, 'marketSegment', 'B2B FinTech'),
    ('66666666-6666-6666-6666-666666666666'::UUID, 'competitiveAdvantages', 'Advanced AI algorithms'),
    ('66666666-6666-6666-6666-666666666666'::UUID, 'currentCustomers', '10,000+ business accounts'),
    ('66666666-6666-6666-6666-666666666666'::UUID, 'successStories', 'Helped businesses save 15% on expenses'),
    ('66666666-6666-6666-6666-666666666666'::UUID, 'painPointsSolved', 'Complex financial management'),
    ('66666666-6666-6666-6666-666666666666'::UUID, 'customerGoals', 'Simplify business finances'),
    ('66666666-6666-6666-6666-666666666666'::UUID, 'currentMarketingChannels', 'Digital marketing, partnerships'),
    ('66666666-6666-6666-6666-666666666666'::UUID, 'marketingMessaging', 'Smart finance for smart businesses')
ON CONFLICT (company_id, field_name) DO UPDATE SET 
    field_value = EXCLUDED.field_value,
    updated_at = NOW(),
    version = company_data.version + 1;
