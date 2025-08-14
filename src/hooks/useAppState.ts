import { useState, useEffect, useMemo } from 'react';
import { AIService, type ICP } from '@/services/ai';
import { ProjectService, type OwnCompany } from '@/services/project-service';

export function useAppState() {
  // Basic state for ICP generation
  const [additionalContext, setAdditionalContext] = useState<string>('');
  const [ownCompany, setOwnCompany] = useState<OwnCompany>({
    name: '',
    website: '',
    social: '',
    location: '',
  });
  const [generatedICPs, setGeneratedICPs] = useState<ICP[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // AI service
  const aiService = useMemo(() => new AIService(), []);

  // On mount: start with a clean UI state (no local or server preload)
  useEffect(() => {
    setOwnCompany({ name: '', website: '', social: '', location: '' });
    setAdditionalContext('');
  }, []);

  // Helper function to build own company context
  const buildOwnCompanyContext = (company: OwnCompany): string => {
    if (!company.name && !company.website && !company.social) {
      return '';
    }

    const sections: string[] = [];

    // Basic Information
    const basicInfo = [
      `Name: ${company.name || 'N/A'}`,
      `Website: ${company.website || 'N/A'}`,
      `LinkedIn: ${company.social || 'N/A'}`,
      `Location: ${company.location || 'N/A'}`,
    ].join('\n');
    sections.push(`Basic Information:\n${basicInfo}`);

    // Business Information
    const businessInfo = [
      company.industry && `Industry: ${company.industry}`,
      company.companySize && `Company Size: ${company.companySize}`,
      company.targetMarket && `Target Market: ${company.targetMarket}`,
      company.valueProposition &&
        `Value Proposition: ${company.valueProposition}`,
      company.mainOfferings && `Main Offerings: ${company.mainOfferings}`,
      company.pricingModel && `Pricing Model: ${company.pricingModel}`,
      company.uniqueFeatures && `Unique Features: ${company.uniqueFeatures}`,
      company.marketSegment && `Market Segment: ${company.marketSegment}`,
      company.competitiveAdvantages &&
        `Competitive Advantages: ${company.competitiveAdvantages}`,
    ]
      .filter(Boolean)
      .join('\n');

    if (businessInfo) {
      sections.push(`Business Information:\n${businessInfo}`);
    }

    // Customer Insights
    const customerInfo = [
      company.currentCustomers &&
        `Current Customers: ${company.currentCustomers}`,
      company.successStories && `Success Stories: ${company.successStories}`,
      company.painPointsSolved &&
        `Pain Points Solved: ${company.painPointsSolved}`,
      company.customerGoals && `Customer Goals: ${company.customerGoals}`,
    ]
      .filter(Boolean)
      .join('\n');

    if (customerInfo) {
      sections.push(`Customer Insights:\n${customerInfo}`);
    }

    // Marketing Context
    const marketingInfo = [
      company.currentMarketingChannels &&
        `Current Marketing Channels: ${company.currentMarketingChannels}`,
      company.marketingMessaging &&
        `Marketing Messaging: ${company.marketingMessaging}`,
    ]
      .filter(Boolean)
      .join('\n');

    if (marketingInfo) {
      sections.push(`Marketing Context:\n${marketingInfo}`);
    }

    return sections.join('\n\n');
  };

  // Own company management
  const handleOwnCompanyChange = (field: keyof OwnCompany, value: string) => {
    setOwnCompany((prev) => ({ ...prev, [field]: value }));
  };

  const saveOwnCompany = async (company: OwnCompany) => {
    if (!company.name.trim()) {
      alert('Company name is required to save!');
      return;
    }

    try {
      // Save to API endpoint (DB)
      const fieldsToSave = [
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
        'additionalContext',
      ] as const;

      // Save each field to the API
      for (const field of fieldsToSave) {
        const v =
          field === 'additionalContext'
            ? company.additionalContext || additionalContext
            : (company[field] as string | undefined);
        if (v && v.trim() !== '') {
          await fetch('/api/company-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ field, value: v }),
          });
        }
      }

      // Additionally, sync fields to the active company record if present
      try {
        const resp = await fetch('/api/company', { cache: 'no-store' });
        if (resp.ok) {
          const json = (await resp.json()) as {
            success: boolean;
            active?: { id?: string } | null;
          };
          const activeId = (json as unknown as { active?: { id?: string } })
            .active?.id;
          if (activeId) {
            // Sync to active company record (exclude additionalContext)
            for (const field of fieldsToSave.filter(
              (f) => f !== 'additionalContext',
            )) {
              const value = company[field as keyof OwnCompany] as
                | string
                | undefined;
              if (value && value.trim() !== '') {
                await fetch('/api/company', {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ id: activeId, field, value }),
                });
              }
            }
          }
        }
      } catch (e) {
        console.warn('Failed to sync to active company record:', e);
      }

      // Refresh UI state from server (no local caching) so that Additional Context appears immediately
      try {
        const refresh = await fetch('/api/company-data', { cache: 'no-store' });
        if (refresh.ok) {
          const json = await refresh.json();
          const current = json?.data?.currentData as OwnCompany | undefined;
          if (current) {
            setOwnCompany({
              name: current.name || '',
              website: current.website || '',
              social: current.social || '',
              location: current.location || '',
              industry: current.industry || '',
              companySize: current.companySize || '',
              targetMarket: current.targetMarket || '',
              valueProposition: current.valueProposition || '',
              mainOfferings: current.mainOfferings || '',
              pricingModel: current.pricingModel || '',
              uniqueFeatures: current.uniqueFeatures || '',
              marketSegment: current.marketSegment || '',
              competitiveAdvantages: current.competitiveAdvantages || '',
              currentCustomers: current.currentCustomers || '',
              successStories: current.successStories || '',
              painPointsSolved: current.painPointsSolved || '',
              customerGoals: current.customerGoals || '',
              currentMarketingChannels: current.currentMarketingChannels || '',
              marketingMessaging: current.marketingMessaging || '',
              additionalContext: current.additionalContext || '',
            });
            setAdditionalContext(current.additionalContext || '');
          }
        }
      } catch (_) {}

      alert(`Your company "${company.name}" saved successfully!`);
    } catch (error) {
      console.error('Error saving company data:', error);
      alert('Error saving company data. Please try again.');
    }
  };

  const resetOwnCompany = async () => {
    const emptyCompany: OwnCompany = {
      name: '',
      location: '',
      website: '',
      social: '',
      industry: '',
      companySize: '',
      targetMarket: '',
      valueProposition: '',
      mainOfferings: '',
      pricingModel: '',
      uniqueFeatures: '',
      marketSegment: '',
      competitiveAdvantages: '',
      currentCustomers: '',
      successStories: '',
      painPointsSolved: '',
      customerGoals: '',
      currentMarketingChannels: '',
      marketingMessaging: '',
    };

    try {
      // Clear API storage
      await fetch('/api/company-data', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      setOwnCompany(emptyCompany);
      setAdditionalContext('');
      alert('Form has been reset. All fields have been cleared.');
    } catch (error) {
      console.error('Error resetting company data:', error);
      // Still clear the form even if API call fails
      setOwnCompany(emptyCompany);
      setAdditionalContext('');
      alert('Form has been reset. All fields have been cleared.');
    }
  };

  // ICP generation
  const handleGenerateICPs = async () => {
    if (!ownCompany.name.trim()) {
      alert('Please provide your company name to generate ICPs.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const ownCompanyContext = buildOwnCompanyContext(ownCompany);
      const combinedContext = [
        ownCompanyContext,
        ownCompany.additionalContext || additionalContext,
      ]
        .filter((v) => Boolean(v && v.trim()))
        .join('\n\n');

      console.log('Generating ICPs with own company data');
      console.log('Additional context:', combinedContext);

      // Generate ICPs based on own company data and additional context
      const icps = await aiService.generateICPs([], [], combinedContext);
      setGeneratedICPs(icps);

      console.log('ICPs generated successfully');
    } catch (error) {
      console.error('Error generating ICPs:', error);
      let errorMessage =
        'Failed to generate ICPs. Please make sure Ollama is running and the llama3.2:3b model is installed.';

      if (error instanceof Error && 'code' in error) {
        const customError = error as { code: string; message: string };
        switch (customError.code) {
          case 'LLM_UNAVAILABLE':
            errorMessage =
              'Ollama LLM is not available. Please make sure Ollama is running and the llama3.2:3b model is installed.';
            break;
          default:
            errorMessage = `Error: ${customError.message}`;
        }
      }

      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // State
    ownCompany,
    additionalContext,
    generatedICPs,
    isLoading,
    error,

    // Actions
    saveOwnCompany,
    resetOwnCompany,
    onOwnCompanyChange: handleOwnCompanyChange,
    setAdditionalContext,
    generateICPs: handleGenerateICPs,
  };
}
