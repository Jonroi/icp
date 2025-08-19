import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Header } from '@/components/layout/Header';
import { ICPGenerator } from '@/components/icp/ICPGenerator';
import { ICPProfiles } from '@/components/icp/ICPProfiles';
import { CampaignDesigner } from '@/components/campaign/CampaignDesigner';
import { CampaignLibrary } from '@/components/campaign/CampaignLibrary';
import { TRPCProvider } from '@/components/providers/TRPCProvider';

import { useAppState } from '@/hooks/useAppState';

function AppContent() {
  const {
    // State
    ownCompany,
    generatedICPs,
    isLoading,
    error,
    activeCompanyId,
    companies,
    activeCompany,

    // Actions
    onOwnCompanyChange,
    saveOwnCompany,
    resetOwnCompany,
    generateICPs,
    generateMoreICPs,
    setActiveCompanyId,
    onCompanyDeleted,
  } = useAppState();

  const [activeTab, setActiveTab] = useState<string>('icp-generator');

  // Find the active company from the companies array
  const activeCompanyData = companies.find(
    (company) => company.id?.toString() === activeCompanyId,
  );

  // Campaign Library handlers
  const handleEditCampaign = (campaign: any) => {
    // Switch to campaign designer and edit the campaign
    setActiveTab('campaign-designer');
    // You might want to pass the campaign data to the designer
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    if (confirm('Are you sure you want to delete this campaign?')) {
      // Handle campaign deletion
      console.log('Deleting campaign:', campaignId);
    }
  };

  const handleViewCampaign = (campaign: any) => {
    // Switch to campaign designer and view the campaign
    setActiveTab('campaign-designer');
    // You might want to pass the campaign data to the designer
  };

  return (
    <div className='min-h-screen bg-background'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='space-y-6 py-6 md:py-8 lg:py-10'>
          <Header
            activeCompanyId={activeCompanyId}
            companies={companies}
            onCompanyIdChange={setActiveCompanyId}
            isLoading={isLoading}
          />

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className='w-full'>
            <TabsList className='w-full'>
              <TabsTrigger value='icp-generator'>ICP Generator</TabsTrigger>
              <TabsTrigger value='demographics'>ICP Overview</TabsTrigger>
              <TabsTrigger value='campaign-designer'>
                Campaign Designer
              </TabsTrigger>
              <TabsTrigger value='campaign-library'>
                Campaign Library
              </TabsTrigger>
            </TabsList>

            <TabsContent value='icp-generator' className='mt-6'>
              <ICPGenerator
                ownCompany={ownCompany}
                isLoading={isLoading}
                error={error || null}
                activeCompanyId={activeCompanyId}
                companies={companies}
                activeCompany={activeCompany}
                onOwnCompanyChange={onOwnCompanyChange}
                onSaveOwnCompany={saveOwnCompany}
                onResetOwnCompany={resetOwnCompany}
                onGenerateICPs={async () => {
                  await generateICPs();
                  alert('ICPs generated successfully!');
                  setActiveTab('demographics');
                }}
                onCompanyDeleted={onCompanyDeleted}
                onCompanyIdChange={setActiveCompanyId}
              />
            </TabsContent>

            <TabsContent value='demographics' className='mt-6'>
              <ICPProfiles
                generatedICPs={generatedICPs}
                activeCompanyId={activeCompanyId}
                onCompanyIdChange={setActiveCompanyId}
                onGenerateMore={generateMoreICPs}
              />
            </TabsContent>

            <TabsContent value='campaign-designer' className='mt-6'>
              <CampaignDesigner
                activeCompanyId={activeCompanyId}
                onCompanyIdChange={setActiveCompanyId}
                onSwitchToLibrary={() => setActiveTab('campaign-library')}
              />
            </TabsContent>

            <TabsContent value='campaign-library' className='mt-6'>
              <CampaignLibrary
                companyId={activeCompanyId || ''}
                companyName={activeCompanyData?.name || ''}
                onEditCampaign={handleEditCampaign}
                onDeleteCampaign={handleDeleteCampaign}
                onViewCampaign={handleViewCampaign}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <TRPCProvider>
      <AppContent />
    </TRPCProvider>
  );
}
