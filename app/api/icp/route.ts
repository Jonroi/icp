import { NextRequest, NextResponse } from 'next/server';
import { AIService } from '@/services/ai/ai-service';
import { companiesService } from '@/services/companies-service';
import { icpProfilesService } from '@/services/icp-profiles-service';
import { companyDataService } from '@/services/company-data-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const requestedCompanyId: string | undefined = body?.companyId;

    // Resolve active company if not provided
    let companyId = requestedCompanyId;
    if (!companyId) {
      const active = await companiesService.getActiveCompany();
      if (!active?.id) {
        return NextResponse.json(
          { success: false, error: 'No active company selected' },
          { status: 400 },
        );
      }
      companyId = active.id;
    }

    // Generate ICPs using current stored company-data context
    const state = await companyDataService.getCurrentData();
    const currentData = state.currentData || {};
    const ai = new AIService();
    const icps = await ai.generateICPs(currentData);

    // Persist profiles under company
    const saved = await icpProfilesService.saveProfilesForCompany(
      companyId!,
      icps,
    );

    return NextResponse.json({ success: true, companyId, profiles: saved });
  } catch (error) {
    console.error('[API] /api/icp POST failed:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const companyId = req.nextUrl.searchParams.get('companyId');
    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'companyId is required' },
        { status: 400 },
      );
    }
    const profiles = await icpProfilesService.listProfilesByCompany(companyId);
    return NextResponse.json({ success: true, companyId, profiles });
  } catch (error) {
    console.error('[API] /api/icp GET failed:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const companyId = req.nextUrl.searchParams.get('companyId');
    const id = req.nextUrl.searchParams.get('id');
    if (!companyId && !id) {
      return NextResponse.json(
        { success: false, error: 'Provide companyId or id' },
        { status: 400 },
      );
    }
    if (id) {
      await icpProfilesService.deleteProfileById(id);
      return NextResponse.json({ success: true, deleted: 1 });
    }
    const deleted = await icpProfilesService.deleteProfilesByCompany(
      companyId!,
    );
    return NextResponse.json({ success: true, deleted });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 },
    );
  }
}
