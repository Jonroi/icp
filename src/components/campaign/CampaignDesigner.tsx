import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Bot } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import {
  CampaignForm,
  type CampaignFormData,
} from '@/components/campaign/CampaignForm';
import { CampaignDisplay } from '@/components/campaign/CampaignDisplay';
import type { StoredCampaign } from '@/services/database';

interface CampaignDesignerProps {
  activeCompanyId?: string;
  onCompanyIdChange?: (id: string) => void;
  onSwitchToLibrary?: () => void;
}

export function CampaignDesigner({
  activeCompanyId,
  onCompanyIdChange,
  onSwitchToLibrary,
}: CampaignDesignerProps) {
  const [generatedCampaign, setGeneratedCampaign] =
    useState<StoredCampaign | null>(null);
  const [showForm, setShowForm] = useState(true);
  const [companyId, setCompanyId] = useState<string>(activeCompanyId || '');
  const [companyName, setCompanyName] = useState<string>('');

  // tRPC queries and mutations
  const companyListQuery = trpc.company.list.useQuery();
  const icpListQuery = trpc.icp.getByCompany.useQuery(
    { companyId },
    { enabled: !!companyId },
  );

  const generateCampaignMutation = trpc.campaign.generate.useMutation();
  const updateCampaignMutation = trpc.campaign.update.useMutation();
  const deleteCampaignMutation = trpc.campaign.delete.useMutation();

  // Update company state when activeCompanyId changes
  useEffect(() => {
    if (activeCompanyId) {
      setCompanyId(activeCompanyId);
      // Find the company name for the active company
      const activeCompany = companyListQuery.data?.list?.find(
        (company) => company.id.toString() === activeCompanyId,
      );
      if (activeCompany) {
        setCompanyName(activeCompany.name || '');
      }
    } else {
      // Reset to empty state when no company is selected
      setCompanyId('');
      setCompanyName('');
    }
  }, [activeCompanyId, companyListQuery.data]);

  const handleGenerateCampaign = async (formData: CampaignFormData) => {
    try {
      const campaign = await generateCampaignMutation.mutateAsync(formData);

      // Only proceed if campaign was successfully generated
      if (campaign && campaign.id) {
        setGeneratedCampaign(campaign);
        setShowForm(false);
        // Switch to campaign library only after successful generation
        onSwitchToLibrary?.();
      } else {
        throw new Error('Campaign generation failed - no campaign returned');
      }
    } catch (error) {
      console.error('Error generating campaign:', error);
      alert('Failed to generate campaign. Please try again.');
      // Keep user on the form page when generation fails
      setShowForm(true);
      setGeneratedCampaign(null);
    }
  };

  const handleEditCampaign = (campaign: StoredCampaign) => {
    setGeneratedCampaign(campaign);
    setShowForm(false);
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    if (confirm('Are you sure you want to delete this campaign?')) {
      try {
        await deleteCampaignMutation.mutateAsync({ id: campaignId });

        if (generatedCampaign?.id === campaignId) {
          setGeneratedCampaign(null);
          setShowForm(true);
        }
      } catch (error) {
        console.error('Error deleting campaign:', error);
        alert('Failed to delete campaign. Please try again.');
      }
    }
  };

  const handleSaveCampaign = async (campaign: StoredCampaign) => {
    try {
      await updateCampaignMutation.mutateAsync({
        id: campaign.id,
        updates: { name: campaign.name },
      });
      alert('Campaign saved successfully!');
    } catch (error) {
      console.error('Error saving campaign:', error);
      alert('Failed to save campaign. Please try again.');
    }
  };

  const isLoading =
    generateCampaignMutation.isPending ||
    updateCampaignMutation.isPending ||
    deleteCampaignMutation.isPending;

  const icpOptions =
    icpListQuery.data?.map((icp) => ({
      id: icp.id,
      name: icp.name,
    })) || [];

  return (
    <div className='space-y-6'>
      {/* Header */}
      <Card className='max-w-4xl mx-auto mb-6'>
        <CardHeader className='flex-col space-y-4 sm:flex-row sm:items-start sm:justify-between'>
          <div>
            <CardTitle className='flex items-center gap-2'>
              <Bot className='h-5 w-5 text-primary' />
              Campaign Designer
            </CardTitle>
            <CardDescription>
              Generate a full campaign based on your ICP.
            </CardDescription>
          </div>
        </CardHeader>
      </Card>

      {/* Campaign Form */}
      {showForm && companyId && (
        <Card className='max-w-4xl mx-auto'>
          <CardHeader>
            <CardTitle>Generate New Campaign</CardTitle>
            <CardDescription>
              {isLoading
                ? 'Generating your campaign... This may take a few moments.'
                : `Fill in the details below to generate a new campaign for ${companyName}.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CampaignForm
              icpOptions={icpOptions}
              onSubmit={handleGenerateCampaign}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      )}

      {/* No Company Selected Message */}
      {showForm && !companyId && (
        <Card className='max-w-4xl mx-auto'>
          <CardHeader>
            <CardTitle>Select a Company</CardTitle>
            <CardDescription>
              Please select a company from the header above to start generating
              campaigns.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Generated Campaign Display */}
      {generatedCampaign && !showForm && (
        <div className='max-w-4xl mx-auto'>
          <CampaignDisplay
            campaign={generatedCampaign}
            onEdit={handleEditCampaign}
            onDelete={handleDeleteCampaign}
            onSave={handleSaveCampaign}
          />
        </div>
      )}
    </div>
  );
}
