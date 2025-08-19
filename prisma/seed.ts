import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create test user
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      id: '11111111-1111-1111-1111-111111111111',
      email: 'test@example.com',
      name: 'Test User',
    },
  });

  console.log('✅ Created test user:', user.email);

  // Create sample companies
  const companies = await Promise.all([
    prisma.company.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        userId: user.id,
        name: 'TechFlow Solutions',
      },
    }),
    prisma.company.upsert({
      where: { id: 2 },
      update: {},
      create: {
        id: 2,
        userId: user.id,
        name: 'HealthTech Innovations',
      },
    }),
    prisma.company.upsert({
      where: { id: 3 },
      update: {},
      create: {
        id: 3,
        userId: user.id,
        name: 'StyleHub Fashion',
      },
    }),
    prisma.company.upsert({
      where: { id: 4 },
      update: {},
      create: {
        id: 4,
        userId: user.id,
        name: 'Precision Manufacturing Co.',
      },
    }),
    prisma.company.upsert({
      where: { id: 5 },
      update: {},
      create: {
        id: 5,
        userId: user.id,
        name: 'SmartFinance Solutions',
      },
    }),
  ]);

  console.log(
    '✅ Created companies:',
    companies.map((c) => c.name),
  );

  // Sample company data for TechFlow Solutions
  const techFlowData = [
    { fieldName: 'location', fieldValue: 'San Francisco, CA' },
    { fieldName: 'website', fieldValue: 'https://techflow.com' },
    { fieldName: 'social', fieldValue: '@techflow_solutions' },
    { fieldName: 'industry', fieldValue: 'SaaS / Technology' },
    { fieldName: 'companySize', fieldValue: '10-50 employees' },
    { fieldName: 'targetMarket', fieldValue: 'Small to medium businesses' },
    {
      fieldName: 'valueProposition',
      fieldValue: 'Streamlined workflow automation',
    },
    {
      fieldName: 'mainOfferings',
      fieldValue: 'Project management SaaS platform',
    },
    { fieldName: 'pricingModel', fieldValue: 'Subscription-based' },
    {
      fieldName: 'uniqueFeatures',
      fieldValue: 'AI-powered task prioritization',
    },
    { fieldName: 'marketSegment', fieldValue: 'B2B SaaS' },
    {
      fieldName: 'competitiveAdvantages',
      fieldValue: 'Advanced analytics and reporting',
    },
    { fieldName: 'currentCustomers', fieldValue: '500+ active users' },
    {
      fieldName: 'successStories',
      fieldValue: 'Increased productivity by 40%',
    },
    {
      fieldName: 'painPointsSolved',
      fieldValue: 'Project delays and communication gaps',
    },
    {
      fieldName: 'customerGoals',
      fieldValue: 'Improve team collaboration and efficiency',
    },
    {
      fieldName: 'currentMarketingChannels',
      fieldValue: 'Digital marketing, content marketing',
    },
    {
      fieldName: 'marketingMessaging',
      fieldValue: 'Transform your workflow with AI-powered insights',
    },
  ];

  // Insert company data
  for (const data of techFlowData) {
    await prisma.companyData.upsert({
      where: {
        companyId_fieldName: {
          companyId: 1,
          fieldName: data.fieldName,
        },
      },
      update: { fieldValue: data.fieldValue },
      create: {
        companyId: 1,
        fieldName: data.fieldName,
        fieldValue: data.fieldValue,
      },
    });
  }

  console.log('✅ Seeded company data for TechFlow Solutions');

  // Create sample ICP profile
  const icpProfile = await prisma.iCPProfile.create({
    data: {
      companyId: 1,
      name: 'TechFlow ICP',
      description: 'Ideal Customer Profile for TechFlow Solutions',
      profileData: {
        industry: 'SaaS / Technology',
        companySize: '10-50 employees',
        targetMarket: 'Small to medium businesses',
        painPoints: ['Project delays', 'Communication gaps'],
        goals: ['Improve team collaboration', 'Increase efficiency'],
      },
      confidenceLevel: 'high',
    },
  });

  console.log('✅ Created ICP profile:', icpProfile.name);

  // Create sample campaign
  const campaign = await prisma.campaign.create({
    data: {
      name: 'TechFlow Launch Campaign',
      icpId: icpProfile.id,
      copyStyle: 'professional',
      mediaType: 'linkedin',
      adCopy:
        'Transform your workflow with AI-powered insights. Streamline project management and boost team productivity by 40%.',
      imagePrompt:
        'Modern office with team collaboration, digital screens showing project management interface',
      cta: 'Start Free Trial',
      hooks:
        'Stop losing time on project delays. Our AI-powered platform helps teams collaborate better.',
      landingPageCopy:
        'Join 500+ companies that have transformed their workflow with TechFlow Solutions.',
    },
  });

  console.log('✅ Created campaign:', campaign.name);

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
