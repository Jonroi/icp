import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { CardToolbar } from '@/components/ui/card-toolbar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Bot,
  Plus,
  Download,
  Copy,
  Sparkles,
  Wand2,
  Save,
  Trash2,
  Image as ImageIcon,
  HelpCircle,
  X,
  Search,
  RefreshCw,
  ExternalLink,
  Upload,
  ChevronDown,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAI } from '@/hooks/useAI';
// import type { CompetitorData, CustomerReview } from '@/services/ai';

type Competitor = {
  name: string;
  website: string;
  social: string;
  reddit?: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  reviews?: string;
};

const campaignIdeas = [
  {
    title: 'SaaS Free Trial Campaign',
    adCopy:
      'Stop guessing. Start converting. SuperSite AI gives you the data to make decisions that drive revenue. Start your free 14-day trial today.',
    hook: 'Unlock the power of your data.',
    imageSuggestion:
      'A clean, modern dashboard showing positive growth charts and key metrics. The style should be professional yet approachable.',
    imageHint: 'data analytics dashboard',
  },
  {
    title: 'E-commerce Flash Sale',
    adCopy:
      "⚡ 48-Hour Flash Sale! ⚡ Get 25% off our entire collection. Limited stock available. Don't miss out on these amazing deals!",
    hook: 'Your next favorite outfit is on sale.',
    imageSuggestion:
      'A dynamic, eye-catching graphic with bold text announcing the flash sale. Use vibrant colors to create a sense of urgency.',
    imageHint: 'flash sale announcement',
  },
  {
    title: 'B2B Lead Generation (Ebook)',
    adCopy:
      'Ready to double your conversion rate? Download our free ebook, "The Ultimate Guide to Website Personalization" and learn the strategies top marketers use.',
    hook: 'Get the secrets to higher conversions.',
    imageSuggestion:
      'A professional-looking mockup of the ebook cover, perhaps on a tablet or a desk with other business-related items.',
    imageHint: 'ebook cover mockup',
  },
];

export default function WizardPage() {
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
  // const [demographicsAnalysis, setDemographicsAnalysis] =
  //   useState<unknown>(null);
  // const [competitorAnalysis, setCompetitorAnalysis] = useState<unknown[]>([]);

  // AI hook - for now without API key (uses mock data)
  const { generateICPs, generateICPsWithAI, generatedICPs, isLoading, error } =
    useAI();
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
    const saved = Object.keys(localStorage)
      .filter((key) => key.startsWith('competitor-'))
      .map((key) => key.replace('competitor-', ''));
    setSavedCompetitors(saved);
  };

  const loadSavedProjectsList = () => {
    const saved = Object.keys(localStorage)
      .filter((key) => key.startsWith('project-'))
      .map((key) => key.replace('project-', ''));
    setSavedProjects(saved);
  };

  const saveProject = () => {
    if (!projectName.trim()) {
      alert('Anna projektille nimi!');
      return;
    }

    const projectData = {
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

    const key = `project-${projectName}`;
    localStorage.setItem(key, JSON.stringify(projectData));
    loadSavedProjectsList();
    setShowSaveDialog(false);
    alert(`Projekti "${projectName}" tallennettu onnistuneesti!`);
  };

  const loadProject = (name: string) => {
    const key = `project-${name}`;
    const savedData = localStorage.getItem(key);

    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);

        setProjectName(parsed.projectName || '');
        setCompetitors(parsed.competitors || []);
        setAdditionalContext(parsed.additionalContext || '');
        setReviews(parsed.reviews || []);
        setDemographicsAnalysis(parsed.demographicsAnalysis || null);
        setCompetitorAnalysis(parsed.competitorAnalysis || []);
        setGeneratedCampaign(parsed.generatedCampaign || null);

        setShowLoadDialog(false);
        alert(`Projekti "${name}" ladattu onnistuneesti!`);
      } catch (error) {
        console.error('Error loading project:', error);
        alert('Virhe ladattaessa projektia.');
      }
    }
  };

  const deleteProject = (name: string) => {
    const key = `project-${name}`;
    localStorage.removeItem(key);
    loadSavedProjectsList();
    alert(`Projekti "${name}" poistettu!`);
  };

  const loadSavedCompetitor = (competitorName: string, index: number) => {
    const key = `competitor-${competitorName}`;
    const savedData = localStorage.getItem(key);

    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);

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
        alert(`Kilpailijan "${competitorName}" tiedot ladattu!`);
      } catch (error) {
        console.error('Error loading competitor:', error);
        alert('Virhe ladattaessa kilpailijaa.');
      }
    }
  };

  const addCompetitor = () => {
    if (competitors.length < 6) {
      setCompetitors([...competitors, { name: '', website: '', social: '' }]);
    }
  };

  // Automaattinen review-haku kun kilpailija lisätään
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

  // LLM-powered company information search
  const searchCompanyWithLLM = async (companyName: string) => {
    console.log(`🤖 LLM search for: ${companyName}`);

    try {
      const prompt = `You are a business directory assistant. Find the official website and LinkedIn page for "${companyName}".

INSTRUCTIONS:
1. First check if you know this company from any industry or country
2. If you know it, provide exact URLs
3. If you don't know it exactly, make educated guesses based on the company name
4. Companies often use patterns like: https://www.companyname.com or .fi (for Finnish companies)
5. LinkedIn often uses: https://www.linkedin.com/company/companyname

FORMAT (return exactly these two lines):
Website: [URL]
LinkedIn: [URL]

EXAMPLES:
Nokia:
Website: https://www.nokia.com
LinkedIn: https://www.linkedin.com/company/nokia

McDonald's:
Website: https://www.mcdonalds.com
LinkedIn: https://www.linkedin.com/company/mcdonalds-corporation

FOR "${companyName}" - provide your best guess even if not 100% certain:`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama2:7b',
          prompt: prompt,
          stream: false,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await response.json();
      const llmResponse = data.response.trim();

      console.log('LLM response:', llmResponse);

      // Parse the response
      const lines = llmResponse.split('\n');
      let website = '';
      let linkedin = '';

      for (const line of lines) {
        if (line.toLowerCase().includes('website:')) {
          const url = line.split(':')[1]?.trim();
          if (url && url !== 'unknown' && url.startsWith('http')) {
            website = url;
          }
        }
        if (line.toLowerCase().includes('linkedin:')) {
          const url = line.split(':')[1]?.trim();
          if (url && url !== 'unknown' && url.startsWith('http')) {
            linkedin = url;
          }
        }
      }

            // Fallback: Generate likely URLs if LLM didn't find anything
      if (!website && !linkedin) {
        console.log('🔄 LLM found nothing, generating fallback URLs...');
        const cleanName = companyName.toLowerCase().replace(/[^a-z]/g, '');
        
        // Generate likely website URLs (try common patterns)
        const possibleWebsites = [
          `https://www.${cleanName}.com`,
          `https://www.${cleanName}.fi`,
          `https://www.${cleanName}.net`,
        ];
        website = possibleWebsites[0]; // Use .com as primary
        
        // Generate likely LinkedIn URL
        linkedin = `https://www.linkedin.com/company/${cleanName}`;
        
        return {
          website: website,
          social: linkedin,
          confidence: 'medium',
          notes: `LLM + fallback generation`,
        };
      }

      return {
        website: website,
        social: linkedin,
        confidence:
          website && linkedin ? 'high' : website || linkedin ? 'medium' : 'low',
        notes: `LLM search completed`,
      };
    } catch (error) {
      console.error('LLM search failed:', error);
      return {
        website: '',
        social: '',
        confidence: 'low',
        notes: 'LLM search failed',
      };
    }
  };

  // Search for company information using LLM only
  const searchCompanyOnline = async (companyName: string) => {
    try {
      console.log(`Starting LLM search for: ${companyName}`);

      // Use LLM to find company information
      const llmResults = await searchCompanyWithLLM(companyName);

      console.log('LLM search results:', llmResults);

      // Return results from LLM search
      return {
        name: companyName,
        website: llmResults.website,
        social: llmResults.social,
        reddit: '',
        facebook: '',
        twitter: '',
        instagram: '',
        confidence: llmResults.confidence,
        notes: `🤖 LLM SEARCH: ${llmResults.notes}`,
      };
    } catch (error) {
      console.error('Error in LLM search:', error);

      // Return empty results
      return {
        name: companyName,
        website: '',
        social: '',
        reddit: '',
        facebook: '',
        twitter: '',
        instagram: '',
        confidence: 'low',
        notes: 'LLM search failed - no information found',
      };
    }
  };

  // Automaattinen yritystietojen haku
  const fetchCompanyInfo = async (index: number, companyName: string) => {
    if (!companyName.trim()) return;

    setIsFetchingCompanyInfo(index);

    try {
      // Search for real company information using web search
      const companyInfo = await searchCompanyOnline(companyName);

      if (companyInfo && companyInfo.name) {
        const newCompetitors = [...competitors];
        newCompetitors[index] = {
          ...newCompetitors[index],
          name: companyInfo.name || newCompetitors[index].name,
          website: companyInfo.website || newCompetitors[index].website,
          social: companyInfo.social || newCompetitors[index].social,
          reddit: companyInfo.reddit || newCompetitors[index].reddit,
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

      if (error.name === 'AbortError') {
        errorMessage = `Research timeout for ${companyName} (30s limit)`;
      } else if (error.message?.includes('Failed to fetch')) {
        errorMessage = `Ollama not running. Please start Ollama first.`;
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

  // Fetch customer reviews for a specific competitor
  const fetchCustomerReviews = async (index: number, companyName: string) => {
    if (!companyName.trim()) return;

    setIsFetchingReviews(index);

    try {
      // Use real Ollama to generate customer reviews
      const prompt = `Generate 5 realistic customer reviews for company: ${companyName}

Create diverse, authentic customer reviews that include:
- Mix of positive and constructive feedback
- Different customer perspectives
- Realistic language and scenarios
- Various rating levels (mostly positive)

Respond with only the review text, one review per line. No JSON, no formatting, just plain text reviews separated by newlines.

Example format:
Review 1 text here
Review 2 text here  
Review 3 text here
Review 4 text here
Review 5 text here`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000); // 25 second timeout

      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama2:7b',
          prompt: prompt,
          stream: false,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      // Clean the response and use it as reviews text
      const reviewsText = data.response.trim();

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
          message: `✅ Generated ${reviewCount} reviews for ${companyName}`,
        },
      });
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      let errorMessage = `Failed to fetch reviews for ${companyName}`;

      if (error.name === 'AbortError') {
        errorMessage = `Reviews timeout for ${companyName} (25s limit)`;
      } else if (error.message?.includes('Failed to fetch')) {
        errorMessage = `Ollama not running. Please start Ollama first.`;
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

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold font-headline tracking-tight'>
            ICP &amp; Campaign Insights
          </h1>
          <p className='text-muted-foreground'>
            Generate customer profiles and design winning campaigns with AI.
          </p>
        </div>
        <div className='flex gap-2'>
          <Button variant='outline' onClick={() => setShowSaveDialog(true)}>
            <Save className='h-4 w-4 mr-2' />
            Tallenna Projekti
          </Button>
          <Button variant='outline' onClick={() => setShowLoadDialog(true)}>
            <Upload className='h-4 w-4 mr-2' />
            Lataa Projekti ({savedProjects.length})
          </Button>
        </div>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <Card className='border-2 border-primary'>
          <CardHeader>
            <CardTitle>Tallenna Projekti</CardTitle>
            <CardDescription>
              Anna projektille nimi tallentaaksesi kaikki täytetyt tiedot
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <Label htmlFor='project-name'>Projektin nimi</Label>
              <Input
                id='project-name'
                placeholder='Esim. Asiakassegmentointi Q1 2024'
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>
            <div className='flex gap-2'>
              <Button onClick={saveProject} className='flex-1'>
                <Save className='h-4 w-4 mr-2' />
                Tallenna
              </Button>
              <Button
                variant='outline'
                onClick={() => setShowSaveDialog(false)}
                className='flex-1'>
                Peruuta
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Load Dialog */}
      {showLoadDialog && savedProjects.length > 0 && (
        <Card className='border-2 border-primary'>
          <CardHeader>
            <CardTitle>Lataa Projekti</CardTitle>
            <CardDescription>
              Valitse tallennettu projekti ladataksesi kaikki tiedot
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-3'>
            {savedProjects.map((name) => (
              <div
                key={name}
                className='flex items-center justify-between p-3 border rounded'>
                <span className='font-medium'>{name}</span>
                <div className='flex gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => loadProject(name)}>
                    <Upload className='h-4 w-4 mr-1' />
                    Lataa
                  </Button>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => deleteProject(name)}>
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            ))}
            <Button
              variant='outline'
              onClick={() => setShowLoadDialog(false)}
              className='w-full'>
              Sulje
            </Button>
          </CardContent>
        </Card>
      )}

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
          <Card className='mt-4'>
            <CardHeader className='flex-row items-start justify-between'>
              <div>
                <CardTitle className='flex items-center gap-2'>
                  <Wand2 className='h-5 w-5 text-primary' />
                  ICP Generator
                </CardTitle>
                <CardDescription>
                  Input competitor data to generate Ideal Customer Personas.
                </CardDescription>
              </div>
              <CardToolbar
                tooltip='Generate Ideal Customer Profiles (ICPs) by providing competitor websites and customer reviews. The AI will analyze the data to create detailed personas.'
                questions={[
                  'What is an ICP?',
                  'Give me some example competitor websites.',
                  'How do I find good customer reviews?',
                ]}
              />
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='space-y-4'>
                <Label>Competitors (1-6)</Label>
                {competitors.map((competitor, index) => (
                  <Card
                    key={index}
                    className='p-4 space-y-3 bg-muted/30 relative'>
                    <div className='flex items-center justify-between mb-3'>
                      <h3 className='font-medium'>Competitor {index + 1}</h3>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-8 w-8'
                        onClick={() => removeCompetitor(index)}
                        title='Poista kilpailija'>
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                    <div className='space-y-3'>
                      <div className='space-y-2'>
                        <Label htmlFor={`competitor-name-${index}`}>
                          Name of Competitor
                        </Label>
                        <div className='flex gap-2 relative'>
                          <Input
                            id={`competitor-name-${index}`}
                            placeholder='Kirjoita yrityksen nimi tai valitse tallennettu'
                            value={competitor.name}
                            onChange={(e) =>
                              handleCompetitorChange(
                                index,
                                'name',
                                e.target.value,
                              )
                            }
                          />
                          {savedCompetitors.length > 0 && (
                            <div className='relative'>
                              <Button
                                variant='outline'
                                size='icon'
                                onClick={() =>
                                  setShowCompetitorDropdown({
                                    ...showCompetitorDropdown,
                                    [index]: !showCompetitorDropdown[index],
                                  })
                                }
                                title='Valitse tallennettu kilpailija'>
                                <ChevronDown className='h-4 w-4' />
                              </Button>

                              {showCompetitorDropdown[index] && (
                                <Card className='absolute top-12 right-0 z-10 w-64 max-h-48 overflow-y-auto'>
                                  <CardContent className='p-2'>
                                    <div className='space-y-1'>
                                      {savedCompetitors.map((name) => (
                                        <Button
                                          key={name}
                                          variant='ghost'
                                          size='sm'
                                          className='w-full justify-start text-left'
                                          onClick={() =>
                                            loadSavedCompetitor(name, index)
                                          }>
                                          {name}
                                        </Button>
                                      ))}
                                    </div>
                                  </CardContent>
                                </Card>
                              )}
                            </div>
                          )}
                          <Button
                            variant='outline'
                            size='icon'
                            onClick={() => {
                              if (competitor.name.trim()) {
                                fetchCompanyInfo(index, competitor.name);
                              }
                            }}
                            disabled={
                              isFetchingCompanyInfo === index ||
                              !competitor.name.trim()
                            }
                            title='Hae yrityksen tiedot'>
                            {isFetchingCompanyInfo === index ? (
                              <RefreshCw className='h-4 w-4 animate-spin' />
                            ) : (
                              <Search className='h-4 w-4' />
                            )}
                          </Button>
                          <Button
                            variant='default'
                            size='icon'
                            onClick={() => {
                              if (!competitor.name.trim()) {
                                alert(
                                  'Kilpailijan nimi on pakollinen tallentamiseen!',
                                );
                                return;
                              }
                              const competitorData = {
                                name: competitor.name,
                                website: competitor.website,
                                social: competitor.social,
                                savedAt: new Date().toISOString(),
                              };
                              const key = `competitor-${competitor.name}`;
                              localStorage.setItem(
                                key,
                                JSON.stringify(competitorData),
                              );
                              loadSavedCompetitorsList();
                              alert(
                                `Kilpailijan perustiedot "${competitor.name}" tallennettu!`,
                              );
                            }}
                            title='Tallenna kilpailijan tiedot'>
                            <Save className='h-4 w-4' />
                          </Button>
                        </div>
                        {competitor.name && !competitor.website && (
                          <p className='text-xs text-muted-foreground'>
                            💡 Kirjoita yrityksen nimi ja klikkaa hakunappia
                          </p>
                        )}
                        {companyInfoStatus[index] && (
                          <p
                            className={`text-xs ${
                              companyInfoStatus[index].success
                                ? 'text-green-600'
                                : 'text-orange-600'
                            }`}>
                            {companyInfoStatus[index].message}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className='grid md:grid-cols-2 gap-3'>
                      <div className='space-y-2'>
                        <Label htmlFor={`competitor-website-${index}`}>
                          Website URL
                        </Label>
                        <div className='flex gap-2'>
                          <Input
                            id={`competitor-website-${index}`}
                            placeholder='https://competitor.com'
                            value={competitor.website}
                            onChange={(e) =>
                              handleCompetitorChange(
                                index,
                                'website',
                                e.target.value,
                              )
                            }
                          />
                          {competitor.website && (
                            <Button
                              variant='outline'
                              size='icon'
                              onClick={() =>
                                window.open(competitor.website, '_blank')
                              }
                              title='Avaa sivusto uudessa ikkunassa'>
                              <ExternalLink className='h-4 w-4' />
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className='space-y-2'>
                        <Label htmlFor={`competitor-social-${index}`}>
                          LinkedIn
                        </Label>
                        <div className='flex gap-2'>
                          <Input
                            id={`competitor-social-${index}`}
                            placeholder='https://linkedin.com/company/competitor'
                            value={competitor.social}
                            onChange={(e) =>
                              handleCompetitorChange(
                                index,
                                'social',
                                e.target.value,
                              )
                            }
                          />
                          {competitor.social && (
                            <Button
                              variant='outline'
                              size='icon'
                              onClick={() =>
                                window.open(competitor.social, '_blank')
                              }
                              title='Avaa LinkedIn uudessa ikkunassa'>
                              <ExternalLink className='h-4 w-4' />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className='space-y-2'>
                      <div className='flex items-center justify-between'>
                        <Label htmlFor={`competitor-reviews-${index}`}>
                          Customer Reviews
                        </Label>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => {
                            if (competitor.name.trim()) {
                              fetchCustomerReviews(index, competitor.name);
                            }
                          }}
                          disabled={
                            isFetchingReviews === index ||
                            !competitor.name.trim()
                          }
                          title='Fetch customer reviews'>
                          {isFetchingReviews === index ? (
                            <RefreshCw className='h-4 w-4 animate-spin mr-2' />
                          ) : (
                            <Search className='h-4 w-4 mr-2' />
                          )}
                          {isFetchingReviews === index
                            ? 'Fetching...'
                            : 'Fetch Reviews'}
                        </Button>
                      </div>
                      <Textarea
                        id={`competitor-reviews-${index}`}
                        placeholder='Click "Fetch Reviews" to collect customer reviews automatically...'
                        value={competitor.reviews || ''}
                        onChange={(e) =>
                          handleCompetitorChange(
                            index,
                            'reviews',
                            e.target.value,
                          )
                        }
                        rows={3}
                      />
                      {reviewsStatus[index] && (
                        <div
                          className={`text-xs ${
                            reviewsStatus[index].success
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}>
                          {reviewsStatus[index].message}
                        </div>
                      )}
                      {competitor.reviews && (
                        <div className='text-xs text-muted-foreground'>
                          <p>💡 Reviews collected</p>
                          <div className='mt-1 p-2 bg-muted/50 rounded text-xs'>
                            <p className='line-clamp-3'>{competitor.reviews}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
                {competitors.length < 6 && (
                  <Button
                    variant='outline'
                    onClick={addCompetitor}
                    className='w-full'>
                    <Plus className='mr-2 h-4 w-4' /> Add Competitor
                  </Button>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='additional-context'>
                  Additional Context (Optional)
                </Label>
                <Textarea
                  id='additional-context'
                  placeholder='Any additional information about your target market...'
                  rows={3}
                  value={additionalContext}
                  onChange={(e) => setAdditionalContext(e.target.value)}
                />
              </div>
              <div className='flex flex-wrap gap-2'>
                <div className='flex-1 flex gap-2'>
                  <Button
                    className='flex-1'
                    onClick={() => {
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

                      // Use real AI if we have data, otherwise use mock
                      if (competitorData.length > 0) {
                        generateICPsWithAI(
                          competitorData,
                          reviewData,
                          additionalContext,
                        );
                      } else {
                        generateICPs();
                      }
                    }}
                    disabled={isLoading}>
                    <Sparkles className='mr-2 h-4 w-4' />
                    {isLoading
                      ? 'Generating...'
                      : 'Generate Ideal Customer Personas'}
                  </Button>
                  <Button
                    variant='outline'
                    size='icon'
                    onClick={() => setShowICPPopup(true)}
                    className='h-10 w-10'>
                    <HelpCircle className='h-4 w-4' />
                  </Button>
                </div>
              </div>
              {error && (
                <div className='p-4 bg-red-50 border border-red-200 rounded-md'>
                  <p className='text-red-600 text-sm'>{error}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='demographics'>
          <Card className='mt-4'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Bot className='h-5 w-5 text-primary' />
                ICP Profiles
              </CardTitle>
              <CardDescription>
                View and manage your generated Ideal Customer Profiles
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generatedICPs.length > 0 ? (
                <div className='space-y-4'>
                  <h3 className='font-semibold'>
                    Generated ICPs ({generatedICPs.length})
                  </h3>
                  <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                    {generatedICPs.map((icp, index) => (
                      <Card key={index} className='bg-muted/30'>
                        <CardHeader>
                          <CardTitle className='flex items-center justify-between'>
                            {icp.name}
                            <span className='text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded'>
                              Mock ICP
                            </span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-3'>
                          <div>
                            <h4 className='font-medium text-sm'>
                              Demographics
                            </h4>
                            <p className='text-xs text-muted-foreground'>
                              Age: {icp.demographics.age} | Gender:{' '}
                              {icp.demographics.gender} | Location:{' '}
                              {icp.demographics.location}
                            </p>
                          </div>
                          <div>
                            <h4 className='font-medium text-sm'>Interests</h4>
                            <p className='text-xs text-muted-foreground'>
                              {icp.psychographics.interests.join(', ')}
                            </p>
                          </div>
                          <div>
                            <h4 className='font-medium text-sm'>Pain Points</h4>
                            <p className='text-xs text-muted-foreground'>
                              {icp.psychographics.painPoints.join(', ')}
                            </p>
                          </div>
                          <p className='text-sm'>{icp.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className='text-center py-8'>
                  <p className='text-muted-foreground'>
                    No ICP profiles generated yet. Go to the ICP Generator tab
                    to create your first profiles.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='campaign-designer'>
          <Card className='mt-4'>
            <CardHeader className='flex-row items-start justify-between'>
              <div>
                <CardTitle className='flex items-center gap-2'>
                  <Bot className='h-5 w-5 text-primary' />
                  Campaign Designer
                </CardTitle>
                <CardDescription>
                  Generate a full campaign based on your ICP.
                </CardDescription>
              </div>
              <CardToolbar
                tooltip='Select an ICP and a copy style, and our AI will generate a complete campaign for you, including ad copy, hooks, and landing page content.'
                questions={[
                  "What is a 'copy style'?",
                  'Generate a campaign for a different ICP.',
                  "What are 'hooks'?",
                ]}
              />
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Label>Ideal Customer Persona (ICP)</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder='Select an ICP' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='icp1'>ICP 1: SME Owners</SelectItem>
                    <SelectItem value='icp2'>
                      ICP 2: Marketing Managers
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <Label>Copy Style</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder='Select a copy style' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='facts'>Facts</SelectItem>
                    <SelectItem value='humour'>British Humour</SelectItem>
                    <SelectItem value='smart'>Smart</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <Label>Ad Media</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder='Select media type' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='google-ads'>Google Ads</SelectItem>
                    <SelectItem value='linkedin'>LinkedIn</SelectItem>
                    <SelectItem value='email'>Email</SelectItem>
                    <SelectItem value='print'>Print</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <Label>Image (Optional)</Label>
                <Input
                  id='image-prompt'
                  placeholder='Describe the image you want the AI to generate...'
                />
                <Button variant='outline' className='w-full'>
                  <ImageIcon className='mr-2 h-4 w-4' />
                  Select from Library
                </Button>
              </div>
              <div className='space-y-2'>
                <Label>Campaign Details (Optional)</Label>
                <Textarea placeholder='e.g., Launching a new feature for analytics...' />
              </div>
              <Button className='w-full' onClick={handleGenerateCampaign}>
                <Bot className='mr-2 h-4 w-4' />
                Generate Campaign
              </Button>
              {generatedCampaign && (
                <Card className='mt-6'>
                  <CardHeader>
                    <CardTitle>Generated Campaign</CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div className='space-y-2'>
                      <h4 className='font-semibold'>Ad Copy</h4>
                      <p className='text-sm text-muted-foreground'>
                        {generatedCampaign.adCopy}
                      </p>
                    </div>
                    <div className='space-y-2'>
                      <h4 className='font-semibold'>Image</h4>
                      <img
                        src={generatedCampaign.image}
                        alt='Generated Campaign'
                        className='rounded-md border'
                        data-ai-hint={generatedCampaign.imageHint}
                      />
                    </div>
                    <div className='space-y-2'>
                      <h4 className='font-semibold'>Call to Action (CTA)</h4>
                      <p className='text-sm text-muted-foreground'>
                        {generatedCampaign.cta}
                      </p>
                    </div>
                    <div className='space-y-2'>
                      <h4 className='font-semibold'>Hooks</h4>
                      <p className='text-sm text-muted-foreground'>
                        {generatedCampaign.hooks}
                      </p>
                    </div>
                    <div className='space-y-2'>
                      <h4 className='font-semibold'>Landing Page Copy</h4>
                      <p className='text-sm text-muted-foreground'>
                        {generatedCampaign.landingPageCopy}
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className='flex justify-end gap-2'>
                    <Button variant='outline'>
                      <Copy className='mr-2 h-4 w-4' /> Copy
                    </Button>
                    <Button variant='outline'>
                      <Download className='mr-2 h-4 w-4' /> Download Assets
                    </Button>
                    <Button>
                      <Save className='mr-2 h-4 w-4' /> Save to Personalization
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='campaign-library'>
          <Card className='mt-4'>
            <CardHeader className='flex-row items-center justify-between'>
              <div>
                <CardTitle>Campaign Idea Library</CardTitle>
                <CardDescription>
                  Browse these examples for inspiration. Save them to use in the
                  personalization builder.
                </CardDescription>
              </div>
              <CardToolbar
                tooltip='Review these AI-generated campaigns. You can copy content, download assets, or save a campaign to use later.'
                questions={[
                  'Generate more suggestions.',
                  'Can you make a campaign for a local business?',
                  'What kind of image would work well here?',
                ]}
              />
            </CardHeader>
            <CardContent className='space-y-4'>
              {campaignIdeas.map((idea, index) => (
                <Card key={index} className='bg-muted/30'>
                  <CardHeader>
                    <CardTitle>{idea.title}</CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div className='space-y-2'>
                      <h4 className='font-semibold'>Ad Copy</h4>
                      <p className='text-sm'>{idea.adCopy}</p>
                    </div>
                    <div className='space-y-2'>
                      <h4 className='font-semibold'>Landing Page Hook</h4>
                      <p className='text-sm'>{idea.hook}</p>
                    </div>
                    <div className='space-y-2'>
                      <h4 className='font-semibold'>Image Suggestion</h4>
                      <div className='flex items-center gap-4 mt-2'>
                        <img
                          src={`https://placehold.co/200x120.png`}
                          alt='Generated Ad'
                          className='rounded-md'
                          data-ai-hint={idea.imageHint}
                        />
                        <p className='text-sm'>{idea.imageSuggestion}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className='flex justify-end gap-2'>
                    <Button variant='outline'>
                      <Copy className='mr-2 h-4 w-4' /> Copy
                    </Button>
                    <Button variant='outline'>
                      <Download className='mr-2 h-4 w-4' /> Download
                    </Button>
                    <Button>
                      <Save className='mr-2 h-4 w-4' /> Save to Platform
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ICP Popup */}
      {showICPPopup && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 max-w-md mx-4 max-h-[80vh] overflow-y-auto'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-xl font-semibold'>What is an ICP?</h2>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => setShowICPPopup(false)}>
                <X className='h-4 w-4' />
              </Button>
            </div>
            <div className='space-y-4'>
              <div>
                <h3 className='font-medium mb-2'>
                  Ideal Customer Profile (ICP)
                </h3>
                <p className='text-sm text-muted-foreground mb-3'>
                  An ICP is a detailed description of your perfect customer -
                  the type of person or company that would benefit most from
                  your product or service.
                </p>
              </div>

              <div>
                <h4 className='font-medium mb-2'>Why ICPs Matter:</h4>
                <ul className='text-sm text-muted-foreground space-y-1'>
                  <li>• Focus your marketing efforts on the right audience</li>
                  <li>• Create more effective campaigns and messaging</li>
                  <li>• Reduce customer acquisition costs</li>
                  <li>• Improve product-market fit</li>
                </ul>
              </div>

              <div>
                <h4 className='font-medium mb-2'>What Our AI Analyzes:</h4>
                <ul className='text-sm text-muted-foreground space-y-1'>
                  <li>
                    • <strong>Demographics:</strong> Age, location, income,
                    education
                  </li>
                  <li>
                    • <strong>Psychographics:</strong> Interests, values,
                    lifestyle, pain points
                  </li>
                  <li>
                    • <strong>Behavior:</strong> Online habits, purchasing
                    behavior, brand preferences
                  </li>
                  <li>
                    • <strong>Goals & Challenges:</strong> What they want to
                    achieve and what's holding them back
                  </li>
                </ul>
              </div>

              <div>
                <h4 className='font-medium mb-2'>How to Use This Tool:</h4>
                <ol className='text-sm text-muted-foreground space-y-1'>
                  <li>1. Add your main competitors' websites</li>
                  <li>
                    2. Include customer reviews from Google, Trustpilot, etc.
                  </li>
                  <li>3. Add any additional context about your market</li>
                  <li>4. Click "Generate Ideal Customer Personas"</li>
                  <li>5. Use the results to guide your marketing strategy</li>
                </ol>
              </div>

              <div className='pt-4 border-t'>
                <Button
                  onClick={() => setShowICPPopup(false)}
                  className='w-full'>
                  Got it!
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
