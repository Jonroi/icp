import Redis from 'ioredis';
import { z } from 'zod';

// Redis configuration
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Cache schemas
const CompanyCacheSchema = z.object({
  id: z.string(),
  name: z.string(),
  data: z.record(z.string(), z.any()),
  updatedAt: z.string(),
});

const ICPCacheSchema = z.object({
  id: z.string(),
  companyId: z.string(),
  data: z.record(z.string(), z.any()),
  generatedAt: z.string(),
});

const StateCacheSchema = z.object({
  activeCompanyId: z.string().optional(),
  lastUpdated: z.string(),
});

export class RedisService {
  private redis: Redis;
  private static instance: RedisService;

  private constructor() {
    this.redis = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    this.redis.on('error', (error) => {
      console.error('Redis connection error:', error);
    });

    this.redis.on('connect', () => {
      console.log('✅ Connected to Redis');
    });
  }

  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  // Company cache methods
  async cacheCompany(
    companyId: string,
    companyData: any,
    ttl: number = 3600,
  ): Promise<void> {
    const cacheData = {
      id: companyId,
      name: companyData.name,
      data: companyData,
      updatedAt: new Date().toISOString(),
    };

    await this.redis.setex(
      `company:${companyId}`,
      ttl,
      JSON.stringify(cacheData),
    );
  }

  async getCachedCompany(companyId: string): Promise<any | null> {
    const cached = await this.redis.get(`company:${companyId}`);
    if (!cached) return null;

    try {
      const parsed = JSON.parse(cached);
      return CompanyCacheSchema.parse(parsed);
    } catch (error) {
      console.error('Failed to parse cached company:', error);
      await this.redis.del(`company:${companyId}`);
      return null;
    }
  }

  async invalidateCompanyCache(companyId: string): Promise<void> {
    await this.redis.del(`company:${companyId}`);
  }

  // ICP cache methods
  async cacheICP(
    icpId: string,
    companyId: string,
    icpData: any,
    ttl: number = 7200,
  ): Promise<void> {
    const cacheData = {
      id: icpId,
      companyId,
      data: icpData,
      generatedAt: new Date().toISOString(),
    };

    await this.redis.setex(`icp:${icpId}`, ttl, JSON.stringify(cacheData));

    // Also store in company's ICP list
    await this.redis.sadd(`company:${companyId}:icps`, icpId);
  }

  async getCachedICP(icpId: string): Promise<any | null> {
    const cached = await this.redis.get(`icp:${icpId}`);
    if (!cached) return null;

    try {
      const parsed = JSON.parse(cached);
      return ICPCacheSchema.parse(parsed);
    } catch (error) {
      console.error('Failed to parse cached ICP:', error);
      await this.redis.del(`icp:${icpId}`);
      return null;
    }
  }

  async getCompanyICPs(companyId: string): Promise<string[]> {
    return await this.redis.smembers(`company:${companyId}:icps`);
  }

  async setCompanyICPs(companyId: string, icpNames: string[]): Promise<void> {
    if (icpNames.length > 0) {
      await this.redis.sadd(`company:${companyId}:icps`, ...icpNames);
    }
  }

  async invalidateICPCache(icpId: string): Promise<void> {
    await this.redis.del(`icp:${icpId}`);
  }

  // State management
  async setActiveCompany(companyId: string): Promise<void> {
    const state = {
      activeCompanyId: companyId,
      lastUpdated: new Date().toISOString(),
    };

    await this.redis.setex(
      'app:state',
      86400, // 24 hours
      JSON.stringify(state),
    );
  }

  async getActiveCompany(): Promise<string | null> {
    const cached = await this.redis.get('app:state');
    if (!cached) return null;

    try {
      const parsed = JSON.parse(cached);
      const state = StateCacheSchema.parse(parsed);
      return state.activeCompanyId || null;
    } catch (error) {
      console.error('Failed to parse app state:', error);
      return null;
    }
  }

  // Session management
  async setSessionData(
    sessionId: string,
    data: any,
    ttl: number = 1800,
  ): Promise<void> {
    await this.redis.setex(`session:${sessionId}`, ttl, JSON.stringify(data));
  }

  async getSessionData(sessionId: string): Promise<any | null> {
    const cached = await this.redis.get(`session:${sessionId}`);
    if (!cached) return null;

    try {
      return JSON.parse(cached);
    } catch (error) {
      console.error('Failed to parse session data:', error);
      return null;
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.redis.del(`session:${sessionId}`);
  }

  // Cache invalidation patterns
  async invalidateCompanyData(companyId: string): Promise<void> {
    const pipeline = this.redis.pipeline();

    // Delete company cache
    pipeline.del(`company:${companyId}`);

    // Delete all ICPs for this company
    const icpIds = await this.getCompanyICPs(companyId);
    icpIds.forEach((icpId) => {
      pipeline.del(`icp:${icpId}`);
    });

    // Delete company ICP list
    pipeline.del(`company:${companyId}:icps`);

    await pipeline.exec();
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.redis.ping();
      return true;
    } catch (error) {
      console.error('Redis health check failed:', error);
      return false;
    }
  }

  // Cleanup
  async disconnect(): Promise<void> {
    await this.redis.quit();
  }
}

// Export singleton instance
export const redisService = RedisService.getInstance();
