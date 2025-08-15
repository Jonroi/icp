import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import type { ICP } from '@/services/ai/types';
import type { OwnCompany } from '@/services/project';

export function useAppState() {
  // Basic state
  const [ownCompany, setOwnCompany] = useState<OwnCompany>({
    name: '',
    website: '',
    social: '',
    location: '',
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
  });
  const [generatedICPs, setGeneratedICPs] = useState<ICP[]>([]);
  const [activeCompanyId, setActiveCompanyId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // tRPC queries and mutations
  const companyListQuery = trpc.company.list.useQuery();
  const icpListQuery = trpc.icp.getAll.useQuery();

  const createCompanyMutation = trpc.company.create.useMutation();
  const updateCompanyFieldMutation = trpc.company.updateField.useMutation();
  const deleteCompanyMutation = trpc.company.delete.useMutation();
  const setActiveCompanyMutation = trpc.company.setActive.useMutation();

  const generateICPsMutation = trpc.icp.generate.useMutation();
  const generateMoreICPsMutation = trpc.icp.generateMore.useMutation();

  // Initialize state from tRPC data
  // Note: We don't auto-populate the form on page load anymore
  // The form will start empty and only populate when user selects a company

  // Load company data when activeCompanyId changes
  useEffect(() => {
    if (activeCompanyId) {
      // Find the selected company in the companies list
      const selectedCompany = companyListQuery.data?.list?.find(
        (company) => company.id.toString() === activeCompanyId,
      );

      if (selectedCompany) {
        // Update the form with the selected company's data
        setOwnCompany(selectedCompany);
      }
    }
  }, [activeCompanyId, companyListQuery.data]);

  useEffect(() => {
    if (icpListQuery.data) {
      // Convert StoredICPProfile[] to ICP[] format
      const convertedICPs =
        icpListQuery.data?.map((profile) => ({
          ...profile.profileData,
          icp_id: profile.id,
          icp_name: profile.name,
          confidence: profile.confidenceLevel,
        })) || [];
      setGeneratedICPs(convertedICPs);
    }
  }, [icpListQuery.data]);

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
      setIsLoading(true);
      setError(null);

      // Create or update company
      if (activeCompanyId) {
        // Update existing company
        const fieldsToUpdate = [
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

        for (const field of fieldsToUpdate) {
          const value = company[field];
          if (value && value.trim() !== '') {
            await updateCompanyFieldMutation.mutateAsync({
              id: activeCompanyId,
              field,
              value,
            });
          }
        }
      } else {
        // Create new company
        const newCompany = await createCompanyMutation.mutateAsync(company);
        setActiveCompanyId(newCompany.id.toString());
        await setActiveCompanyMutation.mutateAsync({
          id: newCompany.id.toString(),
        });
      }

      // Refresh queries
      await companyListQuery.refetch();

      alert(`Your company "${company.name}" saved successfully!`);
    } catch (error) {
      console.error('Error saving company data:', error);
      const message =
        error instanceof Error ? error.message : 'Error saving company data';
      setError(message);
      alert(message);
    } finally {
      setIsLoading(false);
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
      setActiveCompanyId('');
      setOwnCompany(emptyCompany);
      alert('Form has been reset. All fields have been cleared.');
    } catch (error) {
      console.error('Error resetting company data:', error);
      setActiveCompanyId('');
      setOwnCompany(emptyCompany);
      alert('Form has been reset. All fields have been cleared.');
    }
  };

  // ICP generation
  const handleGenerateICPs = async () => {
    if (!ownCompany.name.trim()) {
      alert('Please provide your company name to generate ICPs.');
      return;
    }

    if (!activeCompanyId) {
      alert('Please save your company first before generating ICPs.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log('Generating ICPs for company:', activeCompanyId);

      const icps = await generateICPsMutation.mutateAsync({
        companyId: activeCompanyId,
      });
      setGeneratedICPs(icps);

      // Refresh ICP list
      await icpListQuery.refetch();

      console.log('ICPs generated successfully');
    } catch (error) {
      console.error('Error generating ICPs:', error);
      const message =
        error instanceof Error ? error.message : 'ICP generation failed';
      setError(message);
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateMoreICPs = async () => {
    if (!activeCompanyId) {
      alert('No active company selected.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const newIcps = await generateMoreICPsMutation.mutateAsync({
        companyId: activeCompanyId,
      });
      setGeneratedICPs((prev) => [...prev, ...newIcps]);

      // Refresh ICP list
      await icpListQuery.refetch();

      alert('Additional ICPs generated successfully!');
    } catch (error) {
      console.error('Error generating more ICPs:', error);
      const message =
        error instanceof Error ? error.message : 'Failed to generate more ICPs';
      setError(message);
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle company deletion
  const handleCompanyDeleted = async (companyId: string) => {
    try {
      await deleteCompanyMutation.mutateAsync({ id: companyId });

      // Clear generated ICPs when company is deleted
      setGeneratedICPs([]);

      // Clear active company ID if it was the deleted one
      if (activeCompanyId === companyId) {
        setActiveCompanyId('');
        setOwnCompany({ name: '', website: '', social: '', location: '' });
      }

      // Refresh queries
      await companyListQuery.refetch();
      await icpListQuery.refetch();
    } catch (error) {
      console.error('Error deleting company:', error);
      const message =
        error instanceof Error ? error.message : 'Failed to delete company';
      setError(message);
      alert(message);
    }
  };

  return {
    // State
    ownCompany,
    generatedICPs,
    activeCompanyId,
    isLoading:
      isLoading || companyListQuery.isLoading || icpListQuery.isLoading,
    error:
      error || companyListQuery.error?.message || icpListQuery.error?.message,

    // Company data
    companies: companyListQuery.data?.list || [],
    activeCompany: null, // No auto-selection on page load

    // Actions
    saveOwnCompany,
    resetOwnCompany,
    onOwnCompanyChange: handleOwnCompanyChange,
    generateICPs: handleGenerateICPs,
    generateMoreICPs: handleGenerateMoreICPs,
    setActiveCompanyId,
    onCompanyDeleted: handleCompanyDeleted,
  };
}
