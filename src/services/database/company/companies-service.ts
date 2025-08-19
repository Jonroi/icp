import { prisma } from '@/services/database/prisma-service';
import type { OwnCompany } from '@/services/project/management/project-service';
import type { Company, CompanyData } from '@prisma/client';

export interface CompanyWithData extends Company {
  data: OwnCompany;
}

class CompaniesService {
  private TEST_USER_ID = '11111111-1111-1111-1111-111111111111';

  /**
   * Get all companies for the current user
   */
  async getCompanies(): Promise<Company[]> {
    const companies = await prisma.company.findMany({
      where: { userId: this.TEST_USER_ID },
      orderBy: { createdAt: 'desc' },
    });
    return companies;
  }

  /**
   * Get a specific company by ID
   */
  async getCompanyById(companyId: string): Promise<Company | null> {
    const company = await prisma.company.findFirst({
      where: {
        id: parseInt(companyId),
        userId: this.TEST_USER_ID,
      },
    });
    return company;
  }

  /**
   * Get company data (all fields) for a specific company
   */
  async getCompanyData(companyId: string): Promise<OwnCompany | null> {
    const companyData = await prisma.companyData.findMany({
      where: { companyId: parseInt(companyId) },
    });

    if (companyData.length === 0) {
      return null;
    }

    const data = {} as OwnCompany;
    for (const field of companyData) {
      (data as any)[field.fieldName] = field.fieldValue;
    }

    return data;
  }

  /**
   * Get company with all its data
   */
  async getCompanyWithData(companyId: string): Promise<CompanyWithData | null> {
    const company = await this.getCompanyById(companyId);
    if (!company) return null;

    const data = await this.getCompanyData(companyId);
    if (!data) return null;

    return {
      ...company,
      data,
    };
  }

  /**
   * Create a new company
   */
  async createCompany(name: string): Promise<Company> {
    const company = await prisma.company.create({
      data: {
        userId: this.TEST_USER_ID,
        name,
      },
    });
    return company;
  }

  /**
   * Update a company field
   */
  async updateCompanyField(
    companyId: string,
    field: keyof OwnCompany,
    value: string,
  ): Promise<void> {
    await prisma.companyData.upsert({
      where: {
        companyId_fieldName: {
          companyId: parseInt(companyId),
          fieldName: field as string,
        },
      },
      update: {
        fieldValue: value,
        version: { increment: 1 },
      },
      create: {
        companyId: parseInt(companyId),
        fieldName: field as string,
        fieldValue: value,
      },
    });
  }

  /**
   * Delete a company and all its data
   */
  async deleteCompany(companyId: string): Promise<void> {
    await prisma.company.delete({
      where: {
        id: parseInt(companyId),
        userId: this.TEST_USER_ID,
      },
    });
  }

  /**
   * Get all companies with their data
   */
  async getAllCompaniesWithData(): Promise<CompanyWithData[]> {
    const companies = await prisma.company.findMany({
      where: { userId: this.TEST_USER_ID },
      include: {
        companyData: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return companies.map((company) => {
      const data = {} as OwnCompany;
      company.companyData.forEach((field) => {
        (data as any)[field.fieldName] = field.fieldValue;
      });

      return {
        ...company,
        data,
      };
    });
  }
}

export const companiesService = new CompaniesService();
