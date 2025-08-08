import { useState, useEffect } from 'react';
import { AIService, type ICP } from '@/services/ai';
import { ProjectService } from '@/services/project-service';
import type { Competitor, ProjectData } from '@/services/project-service';
import { CompanySearchService } from '@/services/company-search-service';
import { ReviewsService } from '@/services/reviews-service';

export function useAppState() {
  const [competitors, setCompetitors] = useState<Competitor[]>([
    { name: '', website: '', social: '' },
    { name: '', website: '', social: '' },
    { name: '', website: '', social: '' },
  ]);
  const [additionalContext, setAdditionalContext] = useState<string>('');
  const [isFetchingCompanyInfo, setIsFetchingCompanyInfo] = useState<
    number | null
  >(null);
  const [isFetchingReviews, setIsFetchingReviews] = useState<number | null>(
    null,
  );
  const [companyInfoStatus, setCompanyInfoStatus] = useState<{
    [key: number]: { success: boolean; message: string };
  }>({});
  const [reviewsStatus, setReviewsStatus] = useState<{
    [key: number]: { success: boolean; message: string };
  }>({});
  const [generatedCampaign, setGeneratedCampaign] = useState<{
    adCopy: string;
    image: string;
    imageHint: string;
    cta: string;
    hooks: string;
    landingPageCopy: string;
  } | null>(null);
  const [showICPPopup, setShowICPPopup] = useState(false);
  const [reviews, setReviews] = useState<unknown[]>([]);
  const [demographicsAnalysis, setDemographicsAnalysis] =
    useState<unknown>(null);
  const [competitorAnalysis, setCompetitorAnalysis] = useState<unknown[]>([]);
  const [projectName, setProjectName] = useState<string>('');
  const [savedProjects, setSavedProjects] = useState<string[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [savedCompetitors, setSavedCompetitors] = useState<string[]>([]);
  const [showCompetitorDropdown, setShowCompetitorDropdown] = useState<{
    [key: number]: boolean;
  }>({});

  // AI service
  const aiService = new AIService();
  const [generatedICPs, setGeneratedICPs] = useState<ICP[]>(
    (ProjectService.loadLastICPs() as unknown as ICP[]) || [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load saved projects and competitors list on mount
  useEffect(() => {
    loadSavedProjectsList();
    loadSavedCompetitorsList();
  }, []);

  // Close competitor dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (Object.values(showCompetitorDropdown).some((show) => show)) {
        const target = event.target as Element;
        if (!target.closest('.relative')) {
          setShowCompetitorDropdown({});
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCompetitorDropdown]);

  const loadSavedCompetitorsList = () => {
    const saved = ProjectService.loadSavedCompetitorsList();
    setSavedCompetitors(saved);
  };

  const loadSavedProjectsList = () => {
    const saved = ProjectService.loadSavedProjectsList();
    setSavedProjects(saved);
  };

  const saveProject = () => {
    if (!projectName.trim()) {
      alert('Please provide a project name!');
      return;
    }

    const projectData: ProjectData = {
      projectName,
      competitors,
      additionalContext,
      generatedICPs,
      generatedCampaign,
      reviews,
      demographicsAnalysis,
      competitorAnalysis,
      savedAt: new Date().toISOString(),
    };

    ProjectService.saveProject(projectData);
    loadSavedProjectsList();
    setShowSaveDialog(false);
    alert(`Project "${projectName}" saved successfully!`);
  };

  const loadProject = (name: string) => {
    const parsed = ProjectService.loadProject(name);

    if (parsed) {
      setProjectName(parsed.projectName || '');
      setCompetitors(parsed.competitors || []);
      setAdditionalContext(parsed.additionalContext || '');
      setReviews(parsed.reviews || []);
      setDemographicsAnalysis(parsed.demographicsAnalysis || null);
      setCompetitorAnalysis(parsed.competitorAnalysis || []);
      setGeneratedCampaign(parsed.generatedCampaign || null);

      setShowLoadDialog(false);
      alert(`Project "${name}" loaded successfully!`);
    } else {
      alert('Error loading project.');
    }
  };

  const deleteProject = (name: string) => {
    ProjectService.deleteProject(name);
    loadSavedProjectsList();
    alert(`Project "${name}" deleted!`);
  };

  const loadSavedCompetitor = (competitorName: string, index: number) => {
    const parsed = ProjectService.loadSavedCompetitor(competitorName);

    if (parsed) {
      const newCompetitors = [...competitors];
      newCompetitors[index] = {
        name: parsed.name || '',
        website: parsed.website || '',
        social: parsed.social || '',
      };
      setCompetitors(newCompetitors);

      setShowCompetitorDropdown({
        ...showCompetitorDropdown,
        [index]: false,
      });
      alert(`Competitor "${competitorName}" loaded!`);
    } else {
      alert('Error loading competitor.');
    }
  };

  const addCompetitor = () => {
    if (competitors.length < 6) {
      setCompetitors([...competitors, { name: '', website: '', social: '' }]);
    }
  };

  const handleCompetitorChange = (
    index: number,
    field: keyof Competitor,
    value: string,
  ) => {
    const newCompetitors = [...competitors];
    newCompetitors[index][field] = value;
    setCompetitors(newCompetitors);
  };

  const removeCompetitor = (index: number) => {
    const newCompetitors = competitors.filter((_, i) => i !== index);
    setCompetitors(newCompetitors);
  };

  const handleGenerateCampaign = () => {
    setGeneratedCampaign({
      adCopy:
        "Get 50% off all summer wear! Don't miss out on our biggest sale of the season. Perfect for your vacation.",
      image: 'https://placehold.co/600x400.png',
      imageHint: 'summer clothing sale',
      cta: 'Shop Now & Save Big',
      hooks: 'Your summer style upgrade is here.',
      landingPageCopy:
        'The sun is shining, and so are our prices! Dive into summer with 50% off everything. From swimwear to sunglasses, get everything you need for your sunny getaway.',
    });
  };

  const fetchCompanyInfo = async (index: number, companyName: string) => {
    if (!companyName.trim()) return;

    setIsFetchingCompanyInfo(index);

    try {
      const companyInfo = await CompanySearchService.searchCompanyOnline(
        companyName,
      );

      if (companyInfo && companyInfo.name) {
        const newCompetitors = [...competitors];
        newCompetitors[index] = {
          ...newCompetitors[index],
          name: companyInfo.name || newCompetitors[index].name,
          website: companyInfo.website || newCompetitors[index].website,
          social: companyInfo.social || newCompetitors[index].social,
          facebook: companyInfo.facebook || newCompetitors[index].facebook,
          twitter: companyInfo.twitter || newCompetitors[index].twitter,
          instagram: companyInfo.instagram || newCompetitors[index].instagram,
        };
        setCompetitors(newCompetitors);

        // Count filled fields
        const filledFields = [];
        if (companyInfo.website) filledFields.push('Website');
        if (companyInfo.social) filledFields.push('LinkedIn');

        const confidenceEmoji =
          companyInfo.confidence === 'high'
            ? '🎯'
            : companyInfo.confidence === 'medium'
            ? '⚡'
            : '❓';

        setCompanyInfoStatus({
          ...companyInfoStatus,
          [index]: {
            success: true,
            message: `${confidenceEmoji} Found ${filledFields.length} fields (${companyInfo.confidence} confidence)`,
          },
        });
      } else {
        setCompanyInfoStatus({
          ...companyInfoStatus,
          [index]: {
            success: false,
            message: `No info found for ${companyName}`,
          },
        });
      }
    } catch (error) {
      console.error('Failed to fetch company info:', error);
      let errorMessage = `Failed to fetch info for ${companyName}`;

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = `Research timeout for ${companyName} (30s limit)`;
        } else if (error.message?.includes('Failed to fetch')) {
          errorMessage = `Ollama not running. Please start Ollama first.`;
        }
      }

      setCompanyInfoStatus({
        ...companyInfoStatus,
        [index]: {
          success: false,
          message: errorMessage,
        },
      });
    } finally {
      setIsFetchingCompanyInfo(null);
    }
  };

  const fetchCustomerReviews = async (index: number, companyName: string) => {
    if (!companyName.trim()) return;

    setIsFetchingReviews(index);

    try {
      const reviewsText = await ReviewsService.fetchCustomerReviews(
        companyName,
        competitors[index]?.website,
      );

      // Count the number of reviews (lines)
      const reviewCount = reviewsText
        .split('\n')
        .filter((line: string) => line.trim()).length;

      const newCompetitors = [...competitors];
      newCompetitors[index] = {
        ...newCompetitors[index],
        reviews: reviewsText,
      };
      setCompetitors(newCompetitors);

      setReviewsStatus({
        ...reviewsStatus,
        [index]: {
          success: true,
          message: `✅ Fetched ${reviewCount} lines of review data for ${companyName}, You can now generate ICPs`,
        },
      });
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      let errorMessage = `Failed to fetch reviews for ${companyName}`;

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = `Reviews timeout for ${companyName} (25s limit)`;
        } else if (error.message?.includes('Failed to fetch')) {
          errorMessage = `Ollama not running. Please start Ollama first.`;
        }
      }

      setReviewsStatus({
        ...reviewsStatus,
        [index]: {
          success: false,
          message: errorMessage,
        },
      });
    } finally {
      setIsFetchingReviews(null);
    }
  };

  const saveCompetitor = (competitor: Competitor) => {
    ProjectService.saveCompetitor(competitor);
    loadSavedCompetitorsList();
    alert(`Competitor basics for "${competitor.name}" saved!`);
  };

  const toggleCompetitorDropdown = (index: number) => {
    setShowCompetitorDropdown({
      ...showCompetitorDropdown,
      [index]: !showCompetitorDropdown[index],
    });
  };

  const handleGenerateICPs = async () => {
    // Convert competitor data to the format expected by AI service
    const competitorData = competitors
      .filter((c) => c.name && c.website)
      .map((c) => ({
        name: c.name,
        website: c.website,
        social: c.social || '',
      }));

    // Convert reviews to the format expected by AI service
    const reviewData = competitors
      .filter((c) => c.reviews)
      .map((c) => ({
        text: c.reviews || '',
        source: c.name,
      }));

    // Check if we have enough data to generate ICPs
    if (competitorData.length === 0) {
      alert(
        'Please add at least one competitor with name and website to generate ICPs.',
      );
      return;
    }

    try {
      // Show loading state
      setIsLoading(true);
      setError(null);
      console.log('Generating ICPs with competitor data:', competitorData);
      console.log('Review data:', reviewData);
      console.log('Additional context:', additionalContext);

      // Use AI to generate ICPs
      const icps = await aiService.generateICPs(
        competitorData,
        reviewData,
        additionalContext,
      );
      setGeneratedICPs(icps);
      ProjectService.saveLastICPs(icps as unknown as any);

      console.log('ICPs generated successfully');
    } catch (error) {
      console.error('Error generating ICPs:', error);
      setError(
        'Failed to generate ICPs. Please make sure Ollama is running and the llama3.2:3b model is installed. You can install it with: ollama pull llama3.2:3b',
      );
      alert(
        'Failed to generate ICPs. Please make sure Ollama is running and the llama3.2:3b model is installed. You can install it with: ollama pull llama3.2:3b',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // State
    competitors,
    additionalContext,
    isFetchingCompanyInfo,
    isFetchingReviews,
    companyInfoStatus,
    reviewsStatus,
    generatedCampaign,
    showICPPopup,
    reviews,
    demographicsAnalysis,
    competitorAnalysis,
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
    generateICPs: handleGenerateICPs,
    saveProject,
    loadProject,
    deleteProject,
  };
}
