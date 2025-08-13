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
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_data_updated_at BEFORE UPDATE ON company_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_icp_profiles_updated_at BEFORE UPDATE ON icp_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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

-- Sample data for testing
INSERT INTO users (id, email, name) VALUES 
    ('test-user-123'::UUID, 'test@example.com', 'Test User')
ON CONFLICT (id) DO NOTHING;

-- Insert sample company data
INSERT INTO company_data (user_id, field_name, field_value) VALUES
    ('test-user-123'::UUID, 'name', 'Test Company'),
    ('test-user-123'::UUID, 'location', 'Test Location'),
    ('test-user-123'::UUID, 'website', 'https://testcompany.com'),
    ('test-user-123'::UUID, 'industry', 'Technology'),
    ('test-user-123'::UUID, 'companySize', '10-50 employees'),
    ('test-user-123'::UUID, 'targetMarket', 'Small businesses'),
    ('test-user-123'::UUID, 'valueProposition', 'Affordable tech solutions'),
    ('test-user-123'::UUID, 'mainOfferings', 'Web development services'),
    ('test-user-123'::UUID, 'pricingModel', 'Subscription-based'),
    ('test-user-123'::UUID, 'uniqueFeatures', '24/7 support'),
    ('test-user-123'::UUID, 'marketSegment', 'SMB market'),
    ('test-user-123'::UUID, 'competitiveAdvantages', 'Lower pricing'),
    ('test-user-123'::UUID, 'currentCustomers', '50+ small businesses'),
    ('test-user-123'::UUID, 'successStories', 'Increased client revenue by 30%'),
    ('test-user-123'::UUID, 'painPointsSolved', 'High development costs'),
    ('test-user-123'::UUID, 'customerGoals', 'Digital transformation'),
    ('test-user-123'::UUID, 'currentMarketingChannels', 'Social media, email'),
    ('test-user-123'::UUID, 'marketingMessaging', 'Affordable tech for small business')
ON CONFLICT (user_id, field_name) DO UPDATE SET
    field_value = EXCLUDED.field_value,
    updated_at = NOW(),
    version = company_data.version + 1;
