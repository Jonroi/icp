import { useState, useEffect, useMemo } from 'react';
import { AIService, type ICP } from '@/services/ai';
import { ProjectService, type OwnCompany } from '@/services/project-service';
import type { Competitor, ProjectData } from '@/services/project-service';
import { CompanySearchService } from '@/services/company-search-service';
import { ReviewsService } from '@/services/reviews-service';

export function useAppState() {
  const [competitors, setCompetitors] = useState<Competitor[]>([
    { name: '', website: '', social: '', location: '' },
    { name: '', website: '', social: '', location: '' },
    { name: '', website: '', social: '', location: '' },
  ]);
  const [additionalContext, setAdditionalContext] = useState<string>('');
  const [ownCompany, setOwnCompany] = useState<OwnCompany>({
    name: '',
    website: '',
    social: '',
    location: '',
  });
  const [ownCompanyStatus, setOwnCompanyStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [isFetchingOwnCompany, setIsFetchingOwnCompany] =
    useState<boolean>(false);
  const [isFetchingCompanyInfo, setIsFetchingCompanyInfo] = useState<
    number | null
  >(null);
  const [isFetchingData, setIsFetchingData] = useState<number | null>(null);
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
  const [showOwnCompanyDropdown, setShowOwnCompanyDropdown] =
    useState<boolean>(false);

  // AI service - use useMemo to prevent recreation on every render
  const aiService = useMemo(() => new AIService(), []);
  const [generatedICPs, setGeneratedICPs] = useState<ICP[]>(
    (ProjectService.loadLastICPs() as unknown as ICP[]) || [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load saved projects and competitors list on mount
  useEffect(() => {
    loadSavedProjectsList();
    loadSavedCompetitorsList();
    const savedOwn = ProjectService.loadOwnCompany();
    if (savedOwn) setOwnCompany(savedOwn);
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
  const hasSavedOwnCompany = () => Boolean(ProjectService.loadOwnCompany());

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
      ownCompany,
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
      if (parsed.ownCompany) {
        setOwnCompany(parsed.ownCompany as OwnCompany);
      }
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
        location: parsed.location || '',
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
      setCompetitors([
        ...competitors,
        { name: '', website: '', social: '', location: '' },
      ]);
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

  const handleOwnCompanyChange = (field: keyof OwnCompany, value: string) => {
    setOwnCompany((prev) => ({ ...prev, [field]: value }));
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

      // Handle custom error types
      if (error instanceof Error && 'code' in error) {
        const customError = error as any;
        switch (customError.code) {
          case 'INVALID_COMPANY_NAME':
            errorMessage = `Invalid company name: ${customError.message}`;
            break;
          case 'COMPANY_NOT_FOUND':
            errorMessage = `No information found for "${companyName}". The company may not exist online.`;
            break;
          case 'LLM_SEARCH_FAILED':
            errorMessage =
              'AI search service is not available. Please check that Ollama is running.';
            break;
          default:
            errorMessage = `Error: ${customError.message}`;
        }
      } else if (error instanceof Error) {
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

    setIsFetchingData(index);

    try {
      const reviewsText = await ReviewsService.fetchCustomerReviews(
        companyName,
        competitors[index]?.website,
        {
          location: competitors[index]?.location, // Pass the location from competitor data
        },
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
          message: `✅ Fetched ${reviewCount} lines of data for ${companyName}, You can now generate ICPs`,
        },
      });
    } catch (error) {
      console.error('Failed to fetch data:', error);
      let errorMessage = `Failed to fetch data for ${companyName}`;

      // Handle custom error types
      if (error instanceof Error && 'code' in error) {
        const customError = error as any;
        switch (customError.code) {
          case 'INVALID_COMPANY_NAME':
            errorMessage = `Invalid company name: ${customError.message}`;
            break;
          case 'INVALID_WEBSITE':
            errorMessage = `Invalid website URL: ${customError.message}`;
            break;
          case 'NO_REVIEWS_FOUND':
            errorMessage = `No reviews found for ${companyName}. The company may not have public reviews on supported platforms.`;
            break;
          case 'VALIDATION_FAILED':
            errorMessage = `Found text but it doesn't appear to be customer reviews for ${companyName}`;
            break;
          case 'NETWORK_ERROR':
            errorMessage = `Network error while fetching data for ${companyName}`;
            break;
          default:
            errorMessage = `Error fetching data: ${customError.message}`;
        }
      } else if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = `Data fetch timeout for ${companyName} (25s limit)`;
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
      setIsFetchingData(null);
    }
  };

  const fetchOwnCompanyInfo = async (companyName: string) => {
    if (!companyName.trim()) return;
    setIsFetchingOwnCompany(true);
    try {
      const info = await CompanySearchService.searchCompanyOnline(companyName);
      if (info && info.name) {
        setOwnCompany((prev) => ({
          name: info.name || prev.name,
          website: info.website || prev.website,
          social: info.social || prev.social,
        }));
        const fields: string[] = [];
        if (info.website) fields.push('Website');
        if (info.social) fields.push('LinkedIn');
        const emoji =
          info.confidence === 'high'
            ? '🎯'
            : info.confidence === 'medium'
            ? '⚡'
            : '❓';
        setOwnCompanyStatus({
          success: true,
          message: `${emoji} Found ${fields.length} fields (${info.confidence} confidence)`,
        });
      } else {
        setOwnCompanyStatus({
          success: false,
          message: `No info found for ${companyName}`,
        });
      }
    } catch (error) {
      console.error('Failed to fetch own company info:', error);
      let errorMessage = 'Failed to fetch company info';

      // Handle custom error types
      if (error instanceof Error && 'code' in error) {
        const customError = error as any;
        switch (customError.code) {
          case 'INVALID_COMPANY_NAME':
            errorMessage = `Invalid company name: ${customError.message}`;
            break;
          case 'COMPANY_NOT_FOUND':
            errorMessage = `No information found for "${companyName}". The company may not exist online.`;
            break;
          case 'LLM_SEARCH_FAILED':
            errorMessage =
              'AI search service is not available. Please check that Ollama is running.';
            break;
          default:
            errorMessage = `Error: ${customError.message}`;
        }
      }

      setOwnCompanyStatus({
        success: false,
        message: errorMessage,
      });
    } finally {
      setIsFetchingOwnCompany(false);
    }
  };

  const saveCompetitor = (competitor: Competitor) => {
    ProjectService.saveCompetitor(competitor);
    loadSavedCompetitorsList();
    alert(`Competitor basics for "${competitor.name}" saved!`);
  };

  const saveOwnCompany = (company: OwnCompany) => {
    if (!company.name.trim()) {
      alert('Company name is required to save!');
      return;
    }
    ProjectService.saveOwnCompany(company);
    alert(`Your company "${company.name}" saved!`);
  };

  const toggleOwnCompanyDropdown = () => {
    setShowOwnCompanyDropdown((v) => !v);
  };

  const loadSavedOwnCompany = () => {
    const saved = ProjectService.loadOwnCompany();
    if (saved) {
      setOwnCompany(saved);
      setShowOwnCompanyDropdown(false);
      alert(`Loaded saved company: ${saved.name || 'Your Company'}`);
    } else {
      alert('No saved company found');
    }
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
      // Merge own company info into additional context so ICP generation is aware of it
      const ownCompanyContext =
        ownCompany.name || ownCompany.website || ownCompany.social
          ? `Own Company Information:\nName: ${
              ownCompany.name || 'N/A'
            }\nWebsite: ${ownCompany.website || 'N/A'}\nLinkedIn: ${
              ownCompany.social || 'N/A'
            }`
          : '';
      const combinedContext = [ownCompanyContext, additionalContext]
        .filter((v) => Boolean(v && v.trim()))
        .join('\n\n');

      console.log('Generating ICPs with competitor data:', competitorData);
      console.log('Review data:', reviewData);
      console.log(
        'Additional context (merged with own company):',
        combinedContext,
      );

      // Use AI to generate ICPs
      const icps = await aiService.generateICPs(
        competitorData,
        reviewData,
        combinedContext,
      );
      setGeneratedICPs(icps);
      ProjectService.saveLastICPs(icps as unknown as ICP[]);

      console.log('ICPs generated successfully');
    } catch (error) {
      console.error('Error generating ICPs:', error);

      // Handle custom error types
      let errorMessage =
        'Failed to generate ICPs. Please make sure Ollama is running and the llama3.2:3b model is installed. You can install it with: ollama pull llama3.2:3b';

      if (error instanceof Error && 'code' in error) {
        const customError = error as any;
        switch (customError.code) {
          case 'INVALID_INPUT_DATA':
            errorMessage = `Input validation failed: ${customError.message}`;
            break;
          case 'LLM_UNAVAILABLE':
            errorMessage =
              'Ollama LLM is not available. Please make sure Ollama is running and the llama3.2:3b model is installed. You can install it with: ollama pull llama3.2:3b';
            break;
          case 'PARSING_FAILED':
            errorMessage =
              'Failed to parse AI response. The AI may have returned unexpected format. Please try again.';
            break;
          case 'ICP_GENERATION_FAILED':
            errorMessage = `ICP generation failed: ${customError.message}`;
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
    ownCompanyStatus,
    isFetchingOwnCompany,
    showOwnCompanyDropdown,
    competitors,
    additionalContext,
    isFetchingCompanyInfo,
    isFetchingData,
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
    hasSavedOwnCompany,
    generatedICPs,
    isLoading,
    error,

    // Actions
    saveOwnCompany,
    onOwnCompanyChange: handleOwnCompanyChange,
    onFetchOwnCompanyInfo: fetchOwnCompanyInfo,
    toggleOwnCompanyDropdown,
    loadSavedOwnCompany,
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
