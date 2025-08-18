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

  return (
    <div className='min-h-screen bg-background'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='space-y-6 py-6 md:py-8 lg:py-10'>
          <Header />

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
              <TabsTrigger value='campaign-library'>Campaign Ideas</TabsTrigger>
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
              />
            </TabsContent>

            <TabsContent value='campaign-library' className='mt-6'>
              <CampaignLibrary />
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
