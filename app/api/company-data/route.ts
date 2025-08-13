import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

interface DataRow {
  id: string;
  user_id: string;
  field_name: string;
  field_value: string;
  created_at: Date;
  updated_at: Date;
  version: number;
}

interface CompanyData {
  user_id?: string;
  data_rows: DataRow[];
  legacy_data: Record<string, string>;
  lastUpdated?: string;
  version?: string;
}

export async function GET(request: NextRequest) {
  try {
    const filePath = path.join(process.cwd(), 'data', 'company-data.json');

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      // Ensure data directory exists
      try {
        await fs.mkdir(path.join(process.cwd(), 'data'), { recursive: true });
      } catch (_) {}
      // File doesn't exist, return empty data
      return NextResponse.json({
        success: true,
        data: {
          currentData: {},
          filledFields: [],
          nextField: 'name',
          isComplete: false,
          progress: { filled: 0, total: 18, percentage: 0 },
        },
        message: 'No company data found, starting fresh',
      });
    }

    // Read the file
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const parsed = JSON.parse(fileContent);

    // Process the data
    let companyData: Record<string, string> = {};
    let filledFields: string[] = [];
    let nextField: string | null = 'name';
    let isComplete = false;

    if (parsed.data_rows && Array.isArray(parsed.data_rows)) {
      // PostgreSQL format
      companyData = {};
      for (const row of parsed.data_rows) {
        companyData[row.field_name] = row.field_value;
      }
    } else if (parsed.legacy_data) {
      // Legacy format
      companyData = parsed.legacy_data;
    } else if (parsed.data) {
      // Direct data format
      companyData = parsed.data;
    }

    // Calculate filled fields and progress
    const fieldOrder = [
      'name',
      'location',
      'website',
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
    ];

    filledFields = fieldOrder.filter(
      (field) => companyData[field] && companyData[field].trim() !== '',
    );

    nextField =
      fieldOrder.find(
        (field) => !companyData[field] || companyData[field].trim() === '',
      ) || null;

    isComplete = filledFields.length === fieldOrder.length;

    const progress = {
      filled: filledFields.length,
      total: fieldOrder.length,
      percentage: Math.round((filledFields.length / fieldOrder.length) * 100),
    };

    return NextResponse.json({
      success: true,
      data: {
        currentData: companyData,
        filledFields,
        nextField,
        isComplete,
        progress,
      },
      message: isComplete
        ? `Profile complete: ${filledFields.length}/${fieldOrder.length} fields filled`
        : `Profile in progress: ${filledFields.length}/${fieldOrder.length} fields filled`,
    });
  } catch (error) {
    console.error('Error reading company data:', error);
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
    const { field, value } = body;

    if (!field || !value) {
      return NextResponse.json(
        { success: false, error: 'Field and value are required' },
        { status: 400 },
      );
    }

    const filePath = path.join(process.cwd(), 'data', 'company-data.json');

    // Read existing data
    let existingData: CompanyData = { data_rows: [], legacy_data: {} };
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      existingData = JSON.parse(fileContent);
    } catch (error) {
      // File doesn't exist, start fresh
      existingData = {
        user_id: 'test-user-123',
        data_rows: [],
        legacy_data: {},
        lastUpdated: new Date().toISOString(),
        version: '1.0',
      };
    }

    // Update the field
    if (existingData.legacy_data) {
      existingData.legacy_data[field] = value;
    }

    // Update data_rows if it exists
    if (existingData.data_rows && Array.isArray(existingData.data_rows)) {
      const existingRowIndex = existingData.data_rows.findIndex(
        (row: DataRow) => row.field_name === field,
      );

      if (existingRowIndex >= 0) {
        existingData.data_rows[existingRowIndex].field_value = value;
        existingData.data_rows[existingRowIndex].updated_at = new Date();
      } else {
        existingData.data_rows.push({
          id: `test-user-123-${field}`,
          user_id: 'test-user-123',
          field_name: field,
          field_value: value,
          created_at: new Date(),
          updated_at: new Date(),
          version: 1,
        });
      }
    }

    existingData.lastUpdated = new Date().toISOString();

    // Save back to file
    await fs.writeFile(filePath, JSON.stringify(existingData, null, 2));

    return NextResponse.json({
      success: true,
      field,
      value,
      message: `Updated ${field} to ${value}`,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Error updating company data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update company data' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const filePath = path.join(process.cwd(), 'data', 'company-data.json');

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      // File doesn't exist, return success (already reset)
      return NextResponse.json({
        success: true,
        message: 'Company data already reset',
        timestamp: new Date(),
      });
    }

    // Delete the file
    await fs.unlink(filePath);

    return NextResponse.json({
      success: true,
      message: 'All company data has been reset successfully',
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Error resetting company data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reset company data' },
      { status: 500 },
    );
  }
}
