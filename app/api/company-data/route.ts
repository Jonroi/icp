import { NextRequest, NextResponse } from 'next/server';
import { companyDataService } from '@/services/company-data-service';

export async function GET(_request: NextRequest) {
  try {
    console.log('[API] GET /api/company-data → Fetching company data from Postgres');
    const state = await companyDataService.getCurrentData();
    const progress = await companyDataService.getCompletionProgress();

    console.log(
      `[API] /api/company-data fetched: filled=${progress.filled}/${progress.total} (${progress.percentage}%)`,
    );
    return NextResponse.json({
      success: true,
      data: {
        currentData: state.currentData,
        filledFields: state.filledFields,
        nextField: state.nextField,
        isComplete: state.isComplete,
        progress,
      },
      message: state.isComplete
        ? `Profile complete: ${progress.filled}/${progress.total} fields filled`
        : `Profile in progress: ${progress.filled}/${progress.total} fields filled`,
    });
  } catch (error) {
    console.error('Error reading company data (DB):', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to read company data',
        data: {
          currentData: {},
          filledFields: [],
          nextField: 'name',
          isComplete: false,
          progress: { filled: 0, total: 18, percentage: 0 },
        },
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { field, value } = body as { field?: string; value?: string };

    if (!field || typeof value !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Field and value are required' },
        { status: 400 },
      );
    }

    console.log(`[API] POST /api/company-data → Update field in Postgres: ${field}`);
    const update = await companyDataService.updateField(field as never, value);

    return NextResponse.json({
      success: true,
      field: update.field,
      value: update.value,
      message: `Updated ${update.field} to ${update.value}`,
      timestamp: update.timestamp,
    });
  } catch (error) {
    console.error('Error updating company data (DB):', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update company data' },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: NextRequest) {
  try {
    console.log('[API] DELETE /api/company-data → Reset company data in Postgres');
    await companyDataService.resetData();
    return NextResponse.json({
      success: true,
      message: 'All company data has been reset successfully',
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Error resetting company data (DB):', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reset company data' },
      { status: 500 },
    );
  }
}
