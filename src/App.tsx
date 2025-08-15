import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Header } from '@/components/layout/Header';
import { ICPGenerator } from '@/components/icp/ICPGenerator';
import { ICPProfiles } from '@/components/icp/ICPProfiles';
import { CampaignDesigner } from '@/components/campaign/CampaignDesigner';
import { CampaignLibrary } from '@/components/campaign/CampaignLibrary';

import { useAppState } from '@/hooks/useAppState';

export default function App() {
  const {
    // State
    ownCompany,
    generatedICPs,
    isLoading,
    error,
    activeCompanyId,

    // Actions
    onOwnCompanyChange,
    saveOwnCompany,
    resetOwnCompany,
    generateICPs,
    setActiveCompanyId,
    onCompanyDeleted,
  } = useAppState();

  const [activeTab, setActiveTab] = useState<string>('icp-generator');

  return (
    <div className='space-y-6 pt-6 md:pt-8 lg:pt-10'>
      <Header />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className='w-full'>
          <TabsTrigger value='icp-generator'>ICP Generator</TabsTrigger>
          <TabsTrigger value='demographics'>ICP Profiles</TabsTrigger>
          <TabsTrigger value='campaign-designer'>Campaign Designer</TabsTrigger>
          <TabsTrigger value='campaign-library'>
            Campaign Idea Library
          </TabsTrigger>
        </TabsList>

        <TabsContent value='icp-generator'>
          <ICPGenerator
            ownCompany={ownCompany}
            isLoading={isLoading}
            error={error}
            onOwnCompanyChange={onOwnCompanyChange}
            onSaveOwnCompany={saveOwnCompany}
            onResetOwnCompany={resetOwnCompany}
            onGenerateICPs={async () => {
              await generateICPs();
              alert('ICPs generated successfully!');
              setActiveTab('demographics');
            }}
            onCompanyDeleted={onCompanyDeleted}
          />
        </TabsContent>

        <TabsContent value='demographics'>
          <ICPProfiles
            generatedICPs={generatedICPs}
            activeCompanyId={activeCompanyId}
            onCompanyIdChange={setActiveCompanyId}
          />
        </TabsContent>

        <TabsContent value='campaign-designer'>
          <CampaignDesigner />
        </TabsContent>

        <TabsContent value='campaign-library'>
          <CampaignLibrary />
        </TabsContent>
      </Tabs>
    </div>
  );
}
