import { NextRequest, NextResponse } from 'next/server';
import { companiesService } from '@/services/companies-service';
import { companyDataService } from '@/services/company-data-service';
import type { OwnCompany } from '@/services/project-service';

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (id) {
    console.log(
      `[API] GET /api/company?id=${id} → Select active company in Postgres`,
    );
    const active = await companiesService.selectCompany(id);
    if (active) {
      // Mirror the selected company's fields into the working form storage (DB)
      try {
        console.log(
          '[API] /api/company → Mirroring selected company fields to company_data',
        );
        await companyDataService.resetData();
        const keys: (keyof OwnCompany)[] = [
          'name',
          'location',
          'website',
          'social',
          'industry',
          'companySize',
          'targetMarket',
          'valueProposition',
          'mainOfferings',
          'pricingModel',
          'uniqueFeatures',
          'marketSegment',
          'competitiveAdvantages',
          'currentCustomers',
          'successStories',
          'painPointsSolved',
          'customerGoals',
          'currentMarketingChannels',
          'marketingMessaging',
          'reviews',
          'linkedInData',
        ];
        for (const k of keys) {
          const v = (active as unknown as Record<string, unknown>)[k];
          if (typeof v === 'string' && v.trim() !== '') {
            await companyDataService.updateField(k, v);
          }
        }
      } catch (e) {
        // Best-effort sync; don't block selection on failure
        console.error('Failed to sync selected company into form data:', e);
      }
    }
    return NextResponse.json({ success: true, company: active });
  }
  console.log('[API] GET /api/company → Listing companies from Postgres');
  const list = await companiesService.listCompanies();
  const active = await companiesService.getActiveCompany();
  return NextResponse.json({ success: true, list, active });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, ...rest } = body || {};
  if (!name || typeof name !== 'string') {
    return NextResponse.json(
      { success: false, error: 'name is required' },
      { status: 400 },
    );
  }
  console.log(
    `[API] POST /api/company → Creating company in Postgres: ${name}`,
  );
  const created = await companiesService.createCompany({ name, ...rest });
  return NextResponse.json({ success: true, company: created });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, field, value, action } = body || {};

  try {
    if (action === 'select') {
      if (!id) {
        return NextResponse.json(
          { success: false, error: 'id is required for select' },
          { status: 400 },
        );
      }
      console.log(
        `[API] PATCH /api/company → Set active company in Postgres: ${id}`,
      );
      const selected = await companiesService.selectCompany(id);
      return NextResponse.json({ success: true, company: selected });
    }

    if (!id || !field) {
      return NextResponse.json(
        { success: false, error: 'id and field are required' },
        { status: 400 },
      );
    }
    console.log(
      `[API] PATCH /api/company → Update company field in Postgres: id=${id}, field=${field}`,
    );
    const updated = await companiesService.updateCompanyField(id, field, value);
    return NextResponse.json({ success: true, company: updated });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: (e as Error).message },
      { status: 404 },
    );
  }
}
