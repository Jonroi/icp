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

  // Load saved data on mount
  useEffect(() => {
    const savedOwn = ProjectService.loadOwnCompany();
    if (savedOwn) setOwnCompany(savedOwn);

    const savedICPs = ProjectService.loadLastICPs();
    if (savedICPs) setGeneratedICPs(savedICPs as unknown as ICP[]);
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

  const saveOwnCompany = (company: OwnCompany) => {
    if (!company.name.trim()) {
      alert('Company name is required to save!');
      return;
    }
    ProjectService.saveOwnCompany(company);
    alert(`Your company "${company.name}" saved!`);
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
      const combinedContext = [ownCompanyContext, additionalContext]
        .filter((v) => Boolean(v && v.trim()))
        .join('\n\n');

      console.log('Generating ICPs with own company data');
      console.log('Additional context:', combinedContext);

      // Generate ICPs based on own company data and additional context
      const icps = await aiService.generateICPs([], [], combinedContext);
      setGeneratedICPs(icps);
      ProjectService.saveLastICPs(icps as unknown as ICP[]);

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
    onOwnCompanyChange: handleOwnCompanyChange,
    setAdditionalContext,
    generateICPs: handleGenerateICPs,
  };
}
