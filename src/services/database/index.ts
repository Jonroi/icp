// Export Prisma service and types
export { prismaService, prisma } from './prisma-service';
export type {
  User,
  Company,
  CompanyData,
  ICPProfile,
  Campaign,
} from './prisma-service';

// Export existing services for backward compatibility during migration
export * from './company';
export * from './icp';
export * from './campaign';
