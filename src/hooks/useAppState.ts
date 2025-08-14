import { useState, useEffect, useMemo } from 'react';
import { AIService, type ICP } from '@/services/ai';
import type { StoredICPProfile } from '@/services';
import { ProjectService, type OwnCompany } from '@/services/project-service';

export function useAppState() {
  // Basic state for ICP generation
  // Removed additionalContext
  const [ownCompany, setOwnCompany] = useState<OwnCompany>({
    name: '',
    website: '',
    social: '',
    location: '',
  });
  const [generatedICPs, setGeneratedICPs] = useState<ICP[]>([]);
  const [activeCompanyId, setActiveCompanyId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // AI service
  const aiService = useMemo(() => new AIService(), []);

  // On mount: start with a clean UI state (no local or server preload)
  useEffect(() => {
    setOwnCompany({ name: '', website: '', social: '', location: '' });
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
      ] as const;

      // Save each field to the API
      for (const field of fieldsToSave) {
        const v = company[field] as string | undefined;
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
            setActiveCompanyId(activeId);
            // Sync to active company record
            for (const field of fieldsToSave) {
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
            });
          }
        }
      } catch (_) {}

      alert(`Your company "${company.name}" saved successfully!`);
    } catch (error) {
      console.error('Error saving company data:', error);
      alert('Error saving company data. Please try again.');
    }
  };

  // Persist current ownCompany fields to the server without UI alerts
  const persistOwnCompanyToServer = async (company: OwnCompany) => {
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
    ] as const;

    // Save each field to the API
    for (const field of fieldsToSave) {
      const v = company[field] as string | undefined;
      if (v && v.trim() !== '') {
        await fetch('/api/company-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ field, value: v }),
        });
      }
    }

    // Sync to active company record if present
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
          setActiveCompanyId(activeId);
          for (const field of fieldsToSave) {
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
    } catch (_) {}
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

      const combinedContext = buildOwnCompanyContext(ownCompany);

      console.log('Generating ICPs with own company data');
      console.log('Additional context:', combinedContext);

      // Generate ICPs based on own company data and additional context
      // Persist current form values to server before generation
      await persistOwnCompanyToServer(ownCompany);

      // Use server to generate and persist under active company
      // Ensure we have a company id
      let companyId = activeCompanyId;
      if (!companyId) {
        try {
          const resp = await fetch('/api/company', { cache: 'no-store' });
          if (resp.ok) {
            const data = await resp.json();
            companyId = data?.active?.id || '';
            if (companyId) setActiveCompanyId(companyId);
          }
        } catch (_) {}
      }

      const resp = await fetch('/api/icp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId }),
      });
      const out = (await resp.json().catch(() => ({}))) as {
        success: boolean;
        profiles: StoredICPProfile[];
        error?: string;
      };
      if (!resp.ok || out?.success === false) {
        throw new Error(
          out?.error || `ICP generation failed (HTTP ${resp.status})`,
        );
      }
      const icps: ICP[] = (out.profiles || []).map((p) => p.profileData);
      setGeneratedICPs(icps);

      console.log('ICPs generated successfully');
    } catch (error) {
      console.error('Error generating ICPs:', error);
      const message =
        error instanceof Error && error.message
          ? error.message
          : 'ICP generation failed';
      setError(message);
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // State
    ownCompany,
    generatedICPs,
    activeCompanyId,
    isLoading,
    error,

    // Actions
    saveOwnCompany,
    resetOwnCompany,
    onOwnCompanyChange: handleOwnCompanyChange,
    generateICPs: handleGenerateICPs,
    setActiveCompanyId,
  };
}
