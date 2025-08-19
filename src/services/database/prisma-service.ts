import { PrismaClient } from '@prisma/client';

declare global {
  var __prisma: PrismaClient | undefined;
}

class PrismaService {
  private static instance: PrismaService;
  private client: PrismaClient;

  private constructor() {
    this.client =
      global.__prisma ||
      new PrismaClient({
        log:
          process.env.NODE_ENV === 'development'
            ? ['query', 'error', 'warn']
            : ['error'],
      });

    if (process.env.NODE_ENV === 'development') {
      global.__prisma = this.client;
    }
  }

  static getInstance(): PrismaService {
    if (!PrismaService.instance) {
      PrismaService.instance = new PrismaService();
    }
    return PrismaService.instance;
  }

  getClient(): PrismaClient {
    return this.client;
  }

  async connect(): Promise<void> {
    try {
      await this.client.$connect();
      console.log('✅ Prisma connected to database');
    } catch (error) {
      console.error('❌ Failed to connect to database:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.$disconnect();
      console.log('✅ Prisma disconnected from database');
    } catch (error) {
      console.error('❌ Failed to disconnect from database:', error);
      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.client.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const prismaService = PrismaService.getInstance();

// Export Prisma client for direct use
export const prisma = prismaService.getClient();

// Export types for use in other parts of the application
export type {
  User,
  Company,
  CompanyData,
  ICPProfile,
  Campaign,
} from '@prisma/client';
