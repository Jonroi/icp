#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

// Load environment variables
config();

const prisma = new PrismaClient();

async function migrateToPrisma() {
  try {
    console.log('🔄 Starting migration to Prisma...');

    // 1. Generate Prisma client
    console.log('📦 Generating Prisma client...');
    const { execSync } = require('child_process');
    execSync('npx prisma generate', { stdio: 'inherit' });

    // 2. Push the schema to the database (this will create tables if they don't exist)
    console.log('🗄️ Pushing schema to database...');
    execSync('npx prisma db push', { stdio: 'inherit' });

    // 3. Verify connection
    console.log('🔍 Verifying database connection...');
    await prisma.$connect();

    // 4. Check if data exists
    const userCount = await prisma.user.count();
    const companyCount = await prisma.company.count();

    console.log(`📊 Found ${userCount} users and ${companyCount} companies`);

    if (userCount === 0) {
      console.log(
        '🌱 No existing data found. You can run the seed script to add sample data.',
      );
    } else {
      console.log('✅ Migration completed successfully!');
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  migrateToPrisma();
}

export { migrateToPrisma };
