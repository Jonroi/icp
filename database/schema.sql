-- PostgreSQL Schema for ICP Builder Company Data
-- Run this to set up your database tables

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

-- Campaign data table (for future campaign features)
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    target_icp_id UUID REFERENCES icp_profiles(id) ON DELETE SET NULL,
    campaign_data JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for campaigns
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);

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

DROP TRIGGER IF EXISTS update_campaigns_updated_at ON campaigns;
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- View to get complete company data for a user
CREATE OR REPLACE VIEW user_company_data AS
SELECT 
    u.id as user_id,
    u.email,
    u.name as user_name,
    cd.field_name,
    cd.field_value,
    cd.updated_at as field_updated_at,
    COUNT(*) OVER (PARTITION BY u.id) as total_fields,
    COUNT(CASE WHEN cd.field_value != '' THEN 1 END) OVER (PARTITION BY u.id) as filled_fields
FROM users u
LEFT JOIN company_data cd ON u.id = cd.user_id
ORDER BY u.id, cd.field_name;

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

-- Sample data for testing (fixed UUID for test user)
INSERT INTO users (id, email, name) VALUES 
    ('11111111-1111-1111-1111-111111111111'::UUID, 'test@example.com', 'Test User')
ON CONFLICT (id) DO NOTHING;

-- Insert sample company data
INSERT INTO company_data (user_id, field_name, field_value) VALUES
    ('11111111-1111-1111-1111-111111111111'::UUID, 'name', 'Test Company'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'location', 'Test Location'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'website', 'https://testcompany.com'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'industry', 'Technology'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'companySize', '10-50 employees'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'targetMarket', 'Small businesses'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'valueProposition', 'Affordable tech solutions'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'mainOfferings', 'Web development services'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'pricingModel', 'Subscription-based'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'uniqueFeatures', '24/7 support'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'marketSegment', 'SMB market'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'competitiveAdvantages', 'Lower pricing'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'currentCustomers', '50+ small businesses'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'successStories', 'Increased client revenue by 30%'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'painPointsSolved', 'High development costs'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'customerGoals', 'Digital transformation'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'currentMarketingChannels', 'Social media, email'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'marketingMessaging', 'Affordable tech for small business'),
    ('11111111-1111-1111-1111-111111111111'::UUID, 'additionalContext', 'Extra context for ICP generation')
ON CONFLICT (user_id, field_name) DO UPDATE SET
    field_value = EXCLUDED.field_value,
    updated_at = NOW(),
    version = company_data.version + 1;

-- Companies table to store selectable companies (seeded + user-created)
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    location VARCHAR(255),
    website TEXT,
    social TEXT,
    industry VARCHAR(255),
    company_size VARCHAR(255),
    target_market TEXT,
    value_proposition TEXT,
    main_offerings TEXT,
    pricing_model VARCHAR(255),
    unique_features TEXT,
    market_segment VARCHAR(255),
    competitive_advantages TEXT,
    current_customers TEXT,
    success_stories TEXT,
    pain_points_solved TEXT,
    customer_goals TEXT,
    current_marketing_channels TEXT,
    marketing_messaging TEXT,
    reviews TEXT,
    linkedin_data TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for companies
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);
CREATE INDEX IF NOT EXISTS idx_companies_updated_at ON companies(updated_at);

-- Trigger to update companies.updated_at
DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Active company per user
CREATE TABLE IF NOT EXISTS user_active_company (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed two example companies (id auto-generated, avoid duplicates by name)
INSERT INTO companies (name, location, website, social, industry, company_size, target_market, value_proposition, main_offerings, pricing_model, unique_features, market_segment, competitive_advantages, current_customers, success_stories, pain_points_solved, customer_goals, current_marketing_channels, marketing_messaging)
VALUES
    ('TechFlow Solutions', 'North America', 'https://techflowsolutions.com', 'https://linkedin.com/company/techflow-solutions', 'SaaS/Software', 'Small Business (11-50 employees)', 'Small to medium businesses', 'Affordable custom software solutions with rapid delivery', 'Custom web applications, mobile apps, and business automation tools', 'Project-based pricing with flexible payment plans', '2-week MVP delivery, ongoing support, and agile development process', 'B2B', 'Lower costs than enterprise solutions, faster delivery, personalized service', '15+ small businesses, 3 healthcare clinics, 2 retail chains', 'Helped a retail chain increase online sales by 40% with custom e-commerce platform', 'High software development costs, long development cycles, lack of customization', 'Digital transformation, operational efficiency, competitive advantage', 'LinkedIn, Google Ads, referrals, industry conferences', 'Transform your business with custom software solutions that fit your budget and timeline'),
    ('Green Energy Innovations', 'Europe', 'https://greenenergyinnovations.com', 'https://linkedin.com/company/green-energy-innovations', 'Energy', 'Medium Business (51-200 employees)', 'Large corporations and government entities', 'Sustainable energy solutions that reduce costs and environmental impact', 'Solar panel installations, energy storage systems, and smart grid solutions', 'Tiered pricing', 'AI-powered energy optimization, 24/7 monitoring, carbon footprint tracking', 'B2B', 'Proven ROI, government incentives expertise, comprehensive warranty', '25+ Fortune 500 companies, 10 government agencies, 50+ commercial buildings', 'Reduced energy costs by 60% for a manufacturing facility while achieving carbon neutrality', 'High energy costs, regulatory compliance, sustainability goals', 'Cost reduction, sustainability compliance, energy independence', 'Trade shows, industry publications, government contracts, referrals', 'Power your future with sustainable energy solutions that pay for themselves')
ON CONFLICT (name) DO NOTHING;