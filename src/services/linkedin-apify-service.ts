import { AIServiceErrorFactory, InputValidator } from './ai/error-types';
import { ApifyClient } from './ai/apify-client';

export interface LinkedInApifyResult {
  companyName: string;
  description: string;
  industry: string;
  companySize: string;
  founded: string;
  specialties: string[];
  followers: string;
  posts: LinkedInPost[];
  employees: LinkedInEmployee[];
  insights: string;
  // Apify-specific fields
  profileUrl?: string;
  website?: string;
  location?: string;
  employeeCount?: number;
  foundedYear?: number;
  specialtiesList?: string[];
  recentPosts?: Array<{
    content: string;
    date: string;
    likes: number;
    comments: number;
  }>;
  topEmployees?: Array<{
    name: string;
    title: string;
    department: string;
    location: string;
  }>;
}

export interface LinkedInRawData {
  companyName?: string;
  name?: string;
  description?: string;
  about?: string;
  industry?: string;
  sector?: string;
  companySize?: string;
  size?: string;
  employeeCount?: string | number;
  founded?: string;
  foundedYear?: string | number;
  establishmentDate?: string;
  establishmentYear?: string | number;
  specialties?: string[];
  skills?: string[];
  followers?: string;
  followerCount?: string | number;
  posts?: LinkedInPost[];
  recentPosts?: LinkedInPost[];
  employees?: LinkedInEmployee[];
  topEmployees?: LinkedInEmployee[];
  insights?: string;
  profileUrl?: string;
  url?: string;
  linkedinUrl?: string;
  website?: string;
  websiteUrl?: string;
  location?: string;
  headquarters?: string;
  address?: string;
}

export interface LinkedInPost {
  content: string;
  engagement: string;
  date: string;
}

export interface LinkedInEmployee {
  title: string;
  department: string;
  location: string;
}

export class LinkedInApifyService {
  static async fetchLinkedInDataWithApify(
    companyName: string,
  ): Promise<LinkedInApifyResult> {
    console.log(`🔗 [LINKEDIN APIFY] ===== STARTING LINKEDIN DATA FETCH =====`);
    console.log(`🔗 [LINKEDIN APIFY] Company: ${companyName}`);
    console.log(`🔗 [LINKEDIN APIFY] Timestamp: ${new Date().toISOString()}`);

    // Validate input
    console.log(`🔗 [LINKEDIN APIFY] Validating company name...`);
    const validation = InputValidator.validateCompanyName(companyName);
    if (!validation.isValid) {
      console.error(
        `❌ [LINKEDIN APIFY] Validation failed:`,
        validation.errors,
      );
      throw AIServiceErrorFactory.createCompanySearchError(
        'INVALID_COMPANY_NAME',
        `Invalid company name: ${validation.errors
          .map((e) => e.message)
          .join(', ')}`,
        [companyName],
      );
    }
    console.log(`✅ [LINKEDIN APIFY] Company name validation passed`);

    console.log(`🔗 [LINKEDIN APIFY] Starting Apify scraping process...`);

    // Use Apify for real LinkedIn data
    const apifyData = await LinkedInApifyService.scrapeWithApify(companyName);

    if (!apifyData || !apifyData.companyName) {
      console.error(`❌ [LINKEDIN APIFY] No data returned from Apify scraping`);
      throw AIServiceErrorFactory.createCompanySearchError(
        'LINKEDIN_FETCH_FAILED',
        `No LinkedIn data found for ${companyName}`,
        [companyName],
      );
    }

    console.log(`✅ [LINKEDIN APIFY] Successfully scraped LinkedIn data`);
    console.log(`🔗 [LINKEDIN APIFY] Company: ${apifyData.companyName}`);
    console.log(`🔗 [LINKEDIN APIFY] Industry: ${apifyData.industry}`);
    console.log(`🔗 [LINKEDIN APIFY] Company Size: ${apifyData.companySize}`);
    console.log(`🔗 [LINKEDIN APIFY] Followers: ${apifyData.followers}`);
    console.log(`🔗 [LINKEDIN APIFY] Posts Count: ${apifyData.posts.length}`);
    console.log(
      `🔗 [LINKEDIN APIFY] Employees Count: ${apifyData.employees.length}`,
    );
    console.log(`🔗 [LINKEDIN APIFY] ===== LINKEDIN DATA FETCH COMPLETE =====`);

    return apifyData;
  }

  private static async scrapeWithApify(
    companyName: string,
  ): Promise<LinkedInApifyResult | null> {
    console.log(
      `🔗 [LINKEDIN APIFY] ===== STARTING LINKEDIN COMPANY SCRAPING =====`,
    );
    console.log(`🔗 [LINKEDIN APIFY] Company: ${companyName}`);

    const apifyClient = new ApifyClient();
    console.log(`🔗 [LINKEDIN APIFY] ApifyClient initialized`);

    try {
      console.log(
        `🔗 [LINKEDIN APIFY] Using LinkedIn Company Scraper actor: ipHw77V2NMJPy8sbS`,
      );

      // Use the LinkedIn Company Scraper actor to get real LinkedIn company data
      const linkedInData = await apifyClient.runLinkedInCompanyScraper(
        companyName,
      );

      console.log(`🔗 [LINKEDIN APIFY] LinkedIn scraper response received`);
      console.log(
        `🔗 [LINKEDIN APIFY] Company data found: ${
          linkedInData ? 'Yes' : 'No'
        }`,
      );

      if (!linkedInData) {
        console.warn(
          `⚠️ [LINKEDIN APIFY] No LinkedIn company data found for: ${companyName}`,
        );
        console.log(
          `🔗 [LINKEDIN APIFY] ===== LINKEDIN SCRAPING FAILED - NO DATA =====`,
        );
        return null;
      }

      console.log(
        `✅ [LINKEDIN APIFY] LinkedIn company data found, parsing...`,
      );

      // Parse the LinkedIn data into our standard format
      const parsedData = LinkedInApifyService.parseLinkedInCompanyData(
        linkedInData,
        companyName,
      );

      console.log(
        `🔗 [LINKEDIN APIFY] ===== LINKEDIN SCRAPING SUCCESSFUL =====`,
      );

      return parsedData;
    } catch (error) {
      console.error(
        `❌ [LINKEDIN APIFY] LinkedIn scraping failed for ${companyName}:`,
        error,
      );
      console.log(
        `🔗 [LINKEDIN APIFY] ===== LINKEDIN SCRAPING FAILED - ERROR =====`,
      );
      throw error;
    }
  }

  private static parseLinkedInCompanyData(
    linkedInData: LinkedInRawData,
    companyName: string,
  ): LinkedInApifyResult {
    console.log(
      `🔗 [LINKEDIN APIFY] ===== STARTING LINKEDIN DATA PARSING =====`,
    );
    console.log(`🔗 [LINKEDIN APIFY] Raw LinkedIn data:`, linkedInData);

    // Parse real LinkedIn company data from the scraper
    const result: LinkedInApifyResult = {
      companyName: linkedInData.companyName || linkedInData.name || companyName,
      description:
        linkedInData.description ||
        linkedInData.about ||
        `${companyName} company information from LinkedIn`,
      industry:
        linkedInData.industry || linkedInData.sector || 'General Business',
      companySize: String(
        linkedInData.companySize ||
          linkedInData.size ||
          linkedInData.employeeCount ||
          'Unknown',
      ),
      founded: String(
        linkedInData.founded ||
          linkedInData.foundedYear ||
          linkedInData.establishmentDate ||
          'Unknown',
      ),
      specialties: linkedInData.specialties ||
        linkedInData.skills || ['Business Operations'],
      followers: String(
        linkedInData.followers || linkedInData.followerCount || 'Unknown',
      ),
      posts: linkedInData.posts || linkedInData.recentPosts || [],
      employees: linkedInData.employees || linkedInData.topEmployees || [],
      insights:
        linkedInData.insights || `${companyName} LinkedIn company profile data`,

      // Apify-specific fields
      profileUrl:
        linkedInData.profileUrl || linkedInData.url || linkedInData.linkedinUrl,
      website: linkedInData.website || linkedInData.websiteUrl,
      location:
        linkedInData.location ||
        linkedInData.headquarters ||
        linkedInData.address,
      employeeCount:
        typeof linkedInData.employeeCount === 'number'
          ? linkedInData.employeeCount
          : typeof linkedInData.size === 'number'
          ? linkedInData.size
          : undefined,
      foundedYear:
        typeof linkedInData.foundedYear === 'number'
          ? linkedInData.foundedYear
          : typeof linkedInData.establishmentYear === 'number'
          ? linkedInData.establishmentYear
          : undefined,
      specialtiesList: linkedInData.specialties ||
        linkedInData.skills || ['Business Operations'],
      recentPosts: (linkedInData.recentPosts || linkedInData.posts || []).map(
        (post) => ({
          content: post.content,
          date: post.date,
          likes: 0, // Default value since LinkedInPost doesn't have likes
          comments: 0, // Default value since LinkedInPost doesn't have comments
        }),
      ),
      topEmployees: (
        linkedInData.topEmployees ||
        linkedInData.employees ||
        []
      ).map((emp) => ({
        name: emp.title || 'Unknown', // Use title as name since LinkedInEmployee doesn't have name
        title: emp.title,
        department: emp.department,
        location: emp.location,
      })),
    };

    console.log(`🔗 [LINKEDIN APIFY] Parsed LinkedIn data:`, {
      companyName: result.companyName,
      industry: result.industry,
      companySize: result.companySize,
      followers: result.followers,
      postsCount: result.posts.length,
      employeesCount: result.employees.length,
    });

    console.log(
      `🔗 [LINKEDIN APIFY] ===== LINKEDIN DATA PARSING COMPLETE =====`,
    );

    return result;
  }
}
