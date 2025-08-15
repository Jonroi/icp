/**
 * Determine business model from company data
 */
export function determineBusinessModel(companyData: any): 'B2B' | 'B2C' | 'B2B2C' {
  const targetMarket = companyData.targetMarket?.toLowerCase() || '';
  const marketSegment = companyData.marketSegment?.toLowerCase() || '';
  const industry = companyData.industry?.toLowerCase() || '';

  // Check for manufacturing/industrial indicators
  const manufacturingIndicators = [
    'manufacturing',
    'industrial',
    'automotive',
    'aerospace',
    'defense',
    'heavy industry',
    'factory',
    'production',
    'machinery',
    'equipment',
  ];

  // If it's manufacturing/industrial, it's almost always B2B
  if (
    manufacturingIndicators.some(
      (indicator) =>
        industry.includes(indicator) ||
        targetMarket.includes(indicator) ||
        marketSegment.includes(indicator),
    )
  ) {
    return 'B2B';
  }

  const b2bIndicators = [
    'business',
    'company',
    'enterprise',
    'organization',
    'professional',
    'industry',
    'corporate',
    'commercial',
    'b2b',
    'business-to-business',
  ];

  const b2cIndicators = [
    'consumer',
    'individual',
    'personal',
    'customer',
    'user',
    'retail',
    'end-user',
    'b2c',
    'business-to-consumer',
  ];

  const hasB2B = b2bIndicators.some(
    (indicator) =>
      targetMarket.includes(indicator) ||
      marketSegment.includes(indicator) ||
      industry.includes(indicator),
  );
  const hasB2C = b2cIndicators.some(
    (indicator) =>
      targetMarket.includes(indicator) ||
      marketSegment.includes(indicator) ||
      industry.includes(indicator),
  );

  if (hasB2B && hasB2C) return 'B2B2C';
  if (hasB2B) return 'B2B';
  return 'B2C';
}
