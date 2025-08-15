-- PostgreSQL Schema v4 for ICP Builder
-- Support for multiple companies per user with auto-incrementing company IDs

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

-- Companies table (one row per company) - Using auto-incrementing IDs
CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Company data table (stores individual field values per company)
CREATE TABLE IF NOT EXISTS company_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
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
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
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
CREATE OR REPLACE FUNCTION get_company_data_json(p_company_id INTEGER)
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

-- Insert test user first
INSERT INTO users (id, email, name) VALUES 
('11111111-1111-1111-1111-111111111111'::uuid, 'test@example.com', 'Test User')
ON CONFLICT (id) DO NOTHING;

-- Insert sample companies with auto-incrementing IDs
INSERT INTO companies (id, user_id, name) VALUES 
(1, '11111111-1111-1111-1111-111111111111'::uuid, 'TechFlow Solutions'),
(2, '11111111-1111-1111-1111-111111111111'::uuid, 'HealthTech Innovations'),
(3, '11111111-1111-1111-1111-111111111111'::uuid, 'StyleHub Fashion'),
(4, '11111111-1111-1111-1111-111111111111'::uuid, 'Precision Manufacturing Co.'),
(5, '11111111-1111-1111-1111-111111111111'::uuid, 'SmartFinance Solutions')
ON CONFLICT (id) DO NOTHING;

-- Insert sample company data for TechFlow Solutions (ID: 1)
INSERT INTO company_data (company_id, field_name, field_value) VALUES 
(1, 'location', 'San Francisco, CA'),
(1, 'website', 'https://techflow.com'),
(1, 'social', '@techflow_solutions'),
(1, 'industry', 'SaaS / Technology'),
(1, 'companySize', '10-50 employees'),
(1, 'targetMarket', 'Small to medium businesses'),
(1, 'valueProposition', 'Streamlined workflow automation'),
(1, 'mainOfferings', 'Project management SaaS platform'),
(1, 'pricingModel', 'Subscription-based'),
(1, 'uniqueFeatures', 'AI-powered task prioritization'),
(1, 'marketSegment', 'B2B SaaS'),
(1, 'competitiveAdvantages', 'Advanced analytics and reporting'),
(1, 'currentCustomers', '500+ active users'),
(1, 'successStories', 'Increased productivity by 40%'),
(1, 'painPointsSolved', 'Project delays and communication gaps'),
(1, 'customerGoals', 'Improve team collaboration and efficiency'),
(1, 'currentMarketingChannels', 'Digital marketing, content marketing'),
(1, 'marketingMessaging', 'Transform your workflow with AI-powered insights')
ON CONFLICT (company_id, field_name) DO UPDATE SET field_value = EXCLUDED.field_value;

-- Insert sample company data for HealthTech Innovations (ID: 2)
INSERT INTO company_data (company_id, field_name, field_value) VALUES 
(2, 'location', 'Global'),
(2, 'website', 'https://healthtechinnovations.com'),
(2, 'social', '@healthtech_innovations'),
(2, 'industry', 'Digital Health / Healthcare'),
(2, 'companySize', '50-200 employees'),
(2, 'targetMarket', 'Healthcare providers and patients'),
(2, 'valueProposition', 'Revolutionary patient monitoring solutions'),
(2, 'mainOfferings', 'Remote patient monitoring devices and software'),
(2, 'pricingModel', 'Device sales + subscription'),
(2, 'uniqueFeatures', 'Real-time health data analytics'),
(2, 'marketSegment', 'B2B2C Healthcare'),
(2, 'competitiveAdvantages', 'FDA-approved technology'),
(2, 'currentCustomers', '200+ healthcare facilities'),
(2, 'successStories', 'Reduced hospital readmissions by 30%'),
(2, 'painPointsSolved', 'Patient monitoring and early intervention'),
(2, 'customerGoals', 'Improve patient outcomes and reduce costs'),
(2, 'currentMarketingChannels', 'Medical conferences, direct sales'),
(2, 'marketingMessaging', 'Empowering healthcare with smart monitoring')
ON CONFLICT (company_id, field_name) DO UPDATE SET field_value = EXCLUDED.field_value;

-- Insert sample company data for StyleHub Fashion (ID: 3)
INSERT INTO company_data (company_id, field_name, field_value) VALUES 
(3, 'location', 'New York, NY'),
(3, 'website', 'https://stylehub.com'),
(3, 'social', '@stylehub_fashion'),
(3, 'industry', 'E-commerce / Fashion'),
(3, 'companySize', '100-500 employees'),
(3, 'targetMarket', 'Fashion-conscious consumers'),
(3, 'valueProposition', 'Curated sustainable fashion marketplace'),
(3, 'mainOfferings', 'Online fashion retail platform'),
(3, 'pricingModel', 'Commission-based marketplace'),
(3, 'uniqueFeatures', 'AI-powered style recommendations'),
(3, 'marketSegment', 'B2C E-commerce'),
(3, 'competitiveAdvantages', 'Sustainable fashion focus'),
(3, 'currentCustomers', '50,000+ active shoppers'),
(3, 'successStories', 'Increased customer retention by 60%'),
(3, 'painPointsSolved', 'Finding sustainable fashion options'),
(3, 'customerGoals', 'Discover unique, sustainable fashion'),
(3, 'currentMarketingChannels', 'Social media, influencer partnerships'),
(3, 'marketingMessaging', 'Fashion that feels good and does good')
ON CONFLICT (company_id, field_name) DO UPDATE SET field_value = EXCLUDED.field_value;

-- Insert sample company data for Precision Manufacturing Co. (ID: 4)
INSERT INTO company_data (company_id, field_name, field_value) VALUES 
(4, 'location', 'Detroit, MI'),
(4, 'website', 'https://precisionmanufacturing.com'),
(4, 'social', '@precision_mfg'),
(4, 'industry', 'Manufacturing / Industrial'),
(4, 'companySize', '500-1000 employees'),
(4, 'targetMarket', 'Automotive and aerospace industries'),
(4, 'valueProposition', 'High-precision manufacturing solutions'),
(4, 'mainOfferings', 'Custom metal fabrication and assembly'),
(4, 'pricingModel', 'Project-based pricing'),
(4, 'uniqueFeatures', 'Advanced robotics and automation'),
(4, 'marketSegment', 'B2B Manufacturing'),
(4, 'competitiveAdvantages', 'ISO 9001 certified, 40 years experience'),
(4, 'currentCustomers', 'Major automotive OEMs'),
(4, 'successStories', 'Reduced production time by 25%'),
(4, 'painPointsSolved', 'Complex manufacturing requirements'),
(4, 'customerGoals', 'High-quality, cost-effective manufacturing'),
(4, 'currentMarketingChannels', 'Trade shows, direct sales'),
(4, 'marketingMessaging', 'Precision engineering for tomorrow''s challenges')
ON CONFLICT (company_id, field_name) DO UPDATE SET field_value = EXCLUDED.field_value;

-- Insert sample company data for SmartFinance Solutions (ID: 5)
INSERT INTO company_data (company_id, field_name, field_value) VALUES 
(5, 'location', 'Austin, TX'),
(5, 'website', 'https://smartfinance.com'),
(5, 'social', '@smartfinance_solutions'),
(5, 'industry', 'Financial Services / FinTech'),
(5, 'companySize', '200-500 employees'),
(5, 'targetMarket', 'Small businesses and startups'),
(5, 'valueProposition', 'AI-powered financial management platform'),
(5, 'mainOfferings', 'Business banking and financial analytics'),
(5, 'pricingModel', 'Transaction fees + subscription'),
(5, 'uniqueFeatures', 'Real-time cash flow predictions'),
(5, 'marketSegment', 'B2B FinTech'),
(5, 'competitiveAdvantages', 'Advanced AI algorithms'),
(5, 'currentCustomers', '10,000+ business accounts'),
(5, 'successStories', 'Helped businesses save 15% on expenses'),
(5, 'painPointsSolved', 'Complex financial management'),
(5, 'customerGoals', 'Simplify business finances'),
(5, 'currentMarketingChannels', 'Digital marketing, partnerships'),
(5, 'marketingMessaging', 'Smart finance for smart businesses')
ON CONFLICT (company_id, field_name) DO UPDATE SET field_value = EXCLUDED.field_value;
