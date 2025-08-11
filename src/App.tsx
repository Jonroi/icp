import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Header } from '@/components/layout/Header';
import { ICPGenerator } from '@/components/icp/ICPGenerator';
import { ICPProfiles } from '@/components/icp/ICPProfiles';
import { CampaignDesigner } from '@/components/campaign/CampaignDesigner';
import { CampaignLibrary } from '@/components/campaign/CampaignLibrary';
import { ICPPopup } from '@/components/dialogs/ICPPopup';

import { useAppState } from '@/hooks/useAppState';
import { FloatingChat } from '@/components';

export default function App() {
  const {
    // State
    ownCompany,
    ownCompanyStatus,
    isFetchingOwnCompany,
    competitors,
    additionalContext,
    isFetchingCompanyInfo,
    isFetchingReviews,
    companyInfoStatus,
    reviewsStatus,
    generatedCampaign,
    showICPPopup,
    // Unused in UI but available via dialogs
    // projectName,
    // savedProjects,
    savedCompetitors,
    showCompetitorDropdown,
    generatedICPs,
    isLoading,
    error,

    // Actions
    onOwnCompanyChange,
    saveOwnCompany,
    onFetchOwnCompanyInfo,
    hasSavedOwnCompany,
    showOwnCompanyDropdown,
    toggleOwnCompanyDropdown,
    loadSavedOwnCompany,
    setAdditionalContext,
    // setProjectName,
    setShowICPPopup,
    handleCompetitorChange,
    addCompetitor,
    removeCompetitor,
    handleGenerateCampaign,
    fetchCompanyInfo,
    fetchCustomerReviews,
    saveCompetitor,
    loadSavedCompetitor,
    toggleCompetitorDropdown,
    generateICPs,
    // saveProject,
    // loadProject,
    // deleteProject,
  } = useAppState();

  const [activeTab, setActiveTab] = useState<string>('icp-generator');

  return (
    <div className='space-y-6 pt-6 md:pt-8 lg:pt-10'>
      <Header />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className='grid w-full grid-cols-4'>
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
            ownCompanyStatus={ownCompanyStatus}
            isFetchingOwnCompany={isFetchingOwnCompany}
            competitors={competitors}
            additionalContext={additionalContext}
            savedCompetitors={savedCompetitors}
            showCompetitorDropdown={showCompetitorDropdown}
            isFetchingCompanyInfo={isFetchingCompanyInfo}
            isFetchingReviews={isFetchingReviews}
            companyInfoStatus={companyInfoStatus}
            reviewsStatus={reviewsStatus}
            isLoading={isLoading}
            error={error}
            onCompetitorChange={handleCompetitorChange}
            onAddCompetitor={addCompetitor}
            onRemoveCompetitor={removeCompetitor}
            onAdditionalContextChange={setAdditionalContext}
            onOwnCompanyChange={onOwnCompanyChange}
            onSaveOwnCompany={saveOwnCompany}
            onFetchOwnCompanyInfo={onFetchOwnCompanyInfo}
            hasSavedOwnCompany={hasSavedOwnCompany}
            showOwnCompanyDropdown={showOwnCompanyDropdown}
            onToggleOwnCompanyDropdown={toggleOwnCompanyDropdown}
            onLoadSavedOwnCompany={loadSavedOwnCompany}
            onFetchCompanyInfo={fetchCompanyInfo}
            onFetchCustomerReviews={fetchCustomerReviews}
            onSaveCompetitor={saveCompetitor}
            onLoadSavedCompetitor={loadSavedCompetitor}
            onToggleCompetitorDropdown={toggleCompetitorDropdown}
            onGenerateICPs={async () => {
              await generateICPs();
              alert('ICPs generated successfully!');
              setActiveTab('demographics');
            }}
          />
        </TabsContent>

        <TabsContent value='demographics'>
          <ICPProfiles generatedICPs={generatedICPs} />
        </TabsContent>

        <TabsContent value='campaign-designer'>
          <CampaignDesigner
            generatedCampaign={generatedCampaign}
            onGenerateCampaign={handleGenerateCampaign}
          />
        </TabsContent>

        <TabsContent value='campaign-library'>
          <CampaignLibrary />
        </TabsContent>
      </Tabs>

      <ICPPopup isOpen={showICPPopup} onClose={() => setShowICPPopup(false)} />
      <FloatingChat />
    </div>
  );
}
