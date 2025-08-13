import { promises as fs } from 'fs';
import path from 'path';
import type { OwnCompany } from '@/services/project-service';

export interface StoredCompany extends OwnCompany {
  id: string;
  updatedAt: string;
}

interface CompaniesFile {
  activeCompanyId: string | null;
  companies: StoredCompany[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const COMPANIES_FILE = path.join(DATA_DIR, 'companies.json');

async function readCompaniesFile(): Promise<CompaniesFile> {
  try {
    const raw = await fs.readFile(COMPANIES_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.companies)) {
      return await seedIfEmpty();
    }
    return {
      activeCompanyId: parsed.activeCompanyId ?? null,
      companies: parsed.companies as StoredCompany[],
    };
  } catch (_) {
    return await seedIfEmpty();
  }
}

async function writeCompaniesFile(data: CompaniesFile): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (_) {}
  await fs.writeFile(COMPANIES_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

async function seedIfEmpty(): Promise<CompaniesFile> {
  const seeded: CompaniesFile = {
    activeCompanyId: null,
    companies: [
      {
        id: 'techflow-solutions',
        name: 'TechFlow Solutions',
        location: 'North America',
        website: 'https://techflowsolutions.com',
        social: 'https://linkedin.com/company/techflow-solutions',
        industry: 'SaaS/Software',
        companySize: 'Small Business (11-50 employees)',
        targetMarket: 'Small to medium businesses',
        valueProposition:
          'Affordable custom software solutions with rapid delivery',
        mainOfferings:
          'Custom web applications, mobile apps, and business automation tools',
        pricingModel: 'Project-based pricing with flexible payment plans',
        uniqueFeatures:
          '2-week MVP delivery, ongoing support, and agile development process',
        marketSegment: 'B2B',
        competitiveAdvantages:
          'Lower costs than enterprise solutions, faster delivery, personalized service',
        currentCustomers:
          '15+ small businesses, 3 healthcare clinics, 2 retail chains',
        successStories:
          'Helped a retail chain increase online sales by 40% with custom e-commerce platform',
        painPointsSolved:
          'High software development costs, long development cycles, lack of customization',
        customerGoals:
          'Digital transformation, operational efficiency, competitive advantage',
        currentMarketingChannels:
          'LinkedIn, Google Ads, referrals, industry conferences',
        marketingMessaging:
          'Transform your business with custom software solutions that fit your budget and timeline',
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'green-energy-innovations',
        name: 'Green Energy Innovations',
        location: 'Europe',
        website: 'https://greenenergyinnovations.com',
        social: 'https://linkedin.com/company/green-energy-innovations',
        industry: 'Energy',
        companySize: 'Medium Business (51-200 employees)',
        targetMarket: 'Large corporations and government entities',
        valueProposition:
          'Sustainable energy solutions that reduce costs and environmental impact',
        mainOfferings:
          'Solar panel installations, energy storage systems, and smart grid solutions',
        pricingModel: 'Tiered pricing',
        uniqueFeatures:
          'AI-powered energy optimization, 24/7 monitoring, carbon footprint tracking',
        marketSegment: 'B2B',
        competitiveAdvantages:
          'Proven ROI, government incentives expertise, comprehensive warranty',
        currentCustomers:
          '25+ Fortune 500 companies, 10 government agencies, 50+ commercial buildings',
        successStories:
          'Reduced energy costs by 60% for a manufacturing facility while achieving carbon neutrality',
        painPointsSolved:
          'High energy costs, regulatory compliance, sustainability goals',
        customerGoals:
          'Cost reduction, sustainability compliance, energy independence',
        currentMarketingChannels:
          'Trade shows, industry publications, government contracts, referrals',
        marketingMessaging:
          'Power your future with sustainable energy solutions that pay for themselves',
        updatedAt: new Date().toISOString(),
      },
    ],
  };

  try {
    // Create file only if it does not exist or is invalid
    await writeCompaniesFile(seeded);
  } catch (_) {}
  return seeded;
}

export const companiesService = {
  async listCompanies(): Promise<Pick<StoredCompany, 'id' | 'name'>[]> {
    const file = await readCompaniesFile();
    return file.companies.map((c) => ({ id: c.id, name: c.name }));
  },

  async getActiveCompany(): Promise<StoredCompany | null> {
    const file = await readCompaniesFile();
    if (!file.activeCompanyId) return null;
    return file.companies.find((c) => c.id === file.activeCompanyId) || null;
  },

  async selectCompany(id: string): Promise<StoredCompany | null> {
    const file = await readCompaniesFile();
    const found = file.companies.find((c) => c.id === id) || null;
    file.activeCompanyId = found ? id : null;
    await writeCompaniesFile(file);
    return found;
  },

  async createCompany(
    partial: Partial<OwnCompany> & { name: string },
  ): Promise<StoredCompany> {
    const file = await readCompaniesFile();
    const id = `company-${Date.now()}`;
    const newCompany: StoredCompany = {
      id,
      name: partial.name,
      website: partial.website || '',
      social: partial.social || '',
      location: partial.location || '',
      industry: partial.industry || '',
      companySize: partial.companySize || '',
      targetMarket: partial.targetMarket || '',
      valueProposition: partial.valueProposition || '',
      mainOfferings: partial.mainOfferings || '',
      pricingModel: partial.pricingModel || '',
      uniqueFeatures: partial.uniqueFeatures || '',
      marketSegment: partial.marketSegment || '',
      competitiveAdvantages: partial.competitiveAdvantages || '',
      currentCustomers: partial.currentCustomers || '',
      successStories: partial.successStories || '',
      painPointsSolved: partial.painPointsSolved || '',
      customerGoals: partial.customerGoals || '',
      currentMarketingChannels: partial.currentMarketingChannels || '',
      marketingMessaging: partial.marketingMessaging || '',
      updatedAt: new Date().toISOString(),
    };
    file.companies.push(newCompany);
    file.activeCompanyId = id;
    await writeCompaniesFile(file);
    return newCompany;
  },

  async updateCompanyField(
    id: string,
    field: keyof OwnCompany,
    value: string,
  ): Promise<StoredCompany> {
    const file = await readCompaniesFile();
    const idx = file.companies.findIndex((c) => c.id === id);
    if (idx === -1) {
      throw new Error('Company not found');
    }
    (file.companies[idx] as unknown as Record<string, unknown>)[field] = value;
    file.companies[idx].updatedAt = new Date().toISOString();
    await writeCompaniesFile(file);
    return file.companies[idx];
  },
};
