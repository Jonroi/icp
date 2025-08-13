import type { OwnCompany } from './project-service';

export interface TestCompany {
  id: string;
  name: string;
  location: string;
  website: string;
  social: string;
  industry: string;
  companySize: string;
  targetMarket: string;
  valueProposition: string;
  mainOfferings: string;
  pricingModel: string;
  uniqueFeatures: string;
  marketSegment: string;
  competitiveAdvantages: string;
  currentCustomers: string;
  successStories: string;
  painPointsSolved: string;
  customerGoals: string;
  currentMarketingChannels: string;
  marketingMessaging: string;
}

export interface TestCompaniesData {
  companies: TestCompany[];
}

// Load test companies data
export async function loadTestCompanies(): Promise<TestCompany[]> {
  try {
    const response = await fetch('/test-companies-data.json');
    if (!response.ok) {
      throw new Error(`Failed to load test companies: ${response.status}`);
    }
    const data: TestCompaniesData = await response.json();
    return data.companies;
  } catch (error) {
    console.error('Error loading test companies:', error);
    return [];
  }
}

// Convert TestCompany to OwnCompany format
export function convertTestCompanyToOwnCompany(
  testCompany: TestCompany,
): OwnCompany {
  return {
    name: testCompany.name,
    location: testCompany.location,
    website: testCompany.website,
    social: testCompany.social,
    industry: testCompany.industry,
    companySize: testCompany.companySize,
    targetMarket: testCompany.targetMarket,
    valueProposition: testCompany.valueProposition,
    mainOfferings: testCompany.mainOfferings,
    pricingModel: testCompany.pricingModel,
    uniqueFeatures: testCompany.uniqueFeatures,
    marketSegment: testCompany.marketSegment,
    competitiveAdvantages: testCompany.competitiveAdvantages,
    currentCustomers: testCompany.currentCustomers,
    successStories: testCompany.successStories,
    painPointsSolved: testCompany.painPointsSolved,
    customerGoals: testCompany.customerGoals,
    currentMarketingChannels: testCompany.currentMarketingChannels,
    marketingMessaging: testCompany.marketingMessaging,
  };
}

// Get company by ID
export async function getTestCompanyById(
  id: string,
): Promise<OwnCompany | null> {
  const companies = await loadTestCompanies();
  const company = companies.find((c) => c.id === id);
  return company ? convertTestCompanyToOwnCompany(company) : null;
}

// Get all company names for dropdown
export async function getTestCompanyNames(): Promise<
  { id: string; name: string }[]
> {
  const companies = await loadTestCompanies();
  return companies.map((c) => ({ id: c.id, name: c.name }));
}
