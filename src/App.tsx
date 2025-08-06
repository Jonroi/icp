import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Header } from '@/components/layout/Header';
import { SaveProjectDialog } from '@/components/dialogs/SaveProjectDialog';
import { LoadProjectDialog } from '@/components/dialogs/LoadProjectDialog';
import { ICPGenerator } from '@/components/icp/ICPGenerator';
import { ICPProfiles } from '@/components/icp/ICPProfiles';
import { CampaignDesigner } from '@/components/campaign/CampaignDesigner';
import { CampaignLibrary } from '@/components/campaign/CampaignLibrary';
import { ICPPopup } from '@/components/dialogs/ICPPopup';
import { TestICPGeneration } from '@/components/TestICPGeneration';
import { useAppState } from '@/hooks/useAppState';

export default function App() {
  const {
    // State
    competitors,
    additionalContext,
    isFetchingCompanyInfo,
    isFetchingReviews,
    companyInfoStatus,
    reviewsStatus,
    generatedCampaign,
    showICPPopup,
    projectName,
    savedProjects,
    showSaveDialog,
    showLoadDialog,
    savedCompetitors,
    showCompetitorDropdown,
    generatedICPs,
    isLoading,
    error,

    // Actions
    setAdditionalContext,
    setProjectName,
    setShowSaveDialog,
    setShowLoadDialog,
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
    saveProject,
    loadProject,
    deleteProject,
  } = useAppState();

  return (
    <div className='space-y-6'>
      <Header
        savedProjectsCount={savedProjects.length}
        onSaveProject={() => setShowSaveDialog(true)}
        onLoadProject={() => setShowLoadDialog(true)}
      />

      <SaveProjectDialog
        isOpen={showSaveDialog}
        projectName={projectName}
        onProjectNameChange={setProjectName}
        onSave={saveProject}
        onCancel={() => setShowSaveDialog(false)}
      />

      <LoadProjectDialog
        isOpen={showLoadDialog}
        savedProjects={savedProjects}
        onLoadProject={loadProject}
        onDeleteProject={deleteProject}
        onCancel={() => setShowLoadDialog(false)}
      />

      <Tabs defaultValue='icp-generator'>
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
            onFetchCompanyInfo={fetchCompanyInfo}
            onFetchCustomerReviews={fetchCustomerReviews}
            onSaveCompetitor={saveCompetitor}
            onLoadSavedCompetitor={loadSavedCompetitor}
            onToggleCompetitorDropdown={toggleCompetitorDropdown}
            onGenerateICPs={generateICPs}
          />
        </TabsContent>

        <TabsContent value='demographics'>
          <ICPProfiles generatedICPs={generatedICPs} />
          <TestICPGeneration />
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
    </div>
  );
}
