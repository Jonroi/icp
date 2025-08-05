import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Target,
  TrendingUp,
  Download,
  Search,
  Eye,
  Save,
  Upload,
  Trash2,
} from 'lucide-react';
import { AIService } from '@/services/ai';
import type { CompetitorAnalysis } from '@/services/ai';

interface CompetitorAnalyzerProps {
  onCompetitorDataCollected: (competitors: unknown[]) => void;
}

interface CompetitorAnalysisResult {
  name: string;
  website: string;
  social: string;
  websiteContent: string;
  analysis: CompetitorAnalysis;
}

export function CompetitorAnalyzer({
  onCompetitorDataCollected,
}: CompetitorAnalyzerProps) {
  const [competitors, setCompetitors] = useState<
    Array<{ name: string; website: string; social: string }>
  >([{ name: '', website: '', social: '' }]);
  const [analysis, setAnalysis] = useState<CompetitorAnalysisResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedCompetitor, setSelectedCompetitor] =
    useState<CompetitorAnalysisResult | null>(null);
  const [savedCompetitors, setSavedCompetitors] = useState<string[]>([]);
  const [showLoadMenu, setShowLoadMenu] = useState(false);

  const aiService = new AIService();

  const addCompetitor = () => {
    setCompetitors([...competitors, { name: '', website: '', social: '' }]);
  };

  const removeCompetitor = (index: number) => {
    const newCompetitors = competitors.filter((_, i) => i !== index);
    setCompetitors(newCompetitors);
  };

  const updateCompetitor = (index: number, field: string, value: string) => {
    const newCompetitors = [...competitors];
    newCompetitors[index] = { ...newCompetitors[index], [field]: value };
    setCompetitors(newCompetitors);
  };

  const analyzeCompetitors = async () => {
    setIsAnalyzing(true);

    try {
      const validCompetitors = competitors.filter((c) => c.name && c.website);

      // Käytä AI-palvelua analysoimaan kilpailijat
      const analysisPromises = validCompetitors.map(async (comp) => {
        // Hae sivuston sisältö
        const websiteContent = await aiService.scrapeWebsite(comp.website);

        // Luo analyysi AI:lla
        const analysis = await aiService.generateCompetitorAnalysis(
          comp,
          websiteContent,
        );

        return {
          name: comp.name,
          website: comp.website,
          social: comp.social,
          websiteContent: websiteContent,
          analysis: analysis,
        };
      });

      const analysisResults = await Promise.all(analysisPromises);
      setAnalysis(analysisResults);
      onCompetitorDataCollected(analysisResults);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const exportAnalysis = () => {
    if (analysis.length === 0) return;

    const dataStr = JSON.stringify(analysis, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'competitor-analysis.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Load saved competitors list on component mount
  useEffect(() => {
    loadSavedCompetitorsList();
  }, []);

  // Close load menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showLoadMenu) {
        const target = event.target as Element;
        if (!target.closest('.relative')) {
          setShowLoadMenu(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLoadMenu]);

  const loadSavedCompetitorsList = () => {
    const saved = Object.keys(localStorage)
      .filter((key) => key.startsWith('competitor-'))
      .map((key) => key.replace('competitor-', ''));
    setSavedCompetitors(saved);
  };

  const saveCompetitor = (competitorData: CompetitorAnalysisResult) => {
    const key = `competitor-${competitorData.name}`;
    const dataToSave = {
      ...competitorData,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(key, JSON.stringify(dataToSave));
    loadSavedCompetitorsList();
    alert(`Kilpailija "${competitorData.name}" tallennettu onnistuneesti!`);
  };

  const saveCompetitorInput = (competitor: {
    name: string;
    website: string;
    social: string;
  }) => {
    if (!competitor.name.trim()) {
      alert('Kilpailijan nimi on pakollinen tallentamiseen!');
      return;
    }

    const key = `competitor-${competitor.name}`;
    const dataToSave = {
      name: competitor.name,
      website: competitor.website,
      social: competitor.social,
      websiteContent: '',
      analysis: null,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(key, JSON.stringify(dataToSave));
    loadSavedCompetitorsList();
    alert(
      `Kilpailijan perustiedot "${competitor.name}" tallennettu onnistuneesti!`,
    );
  };

  const loadCompetitor = (competitorName: string) => {
    const key = `competitor-${competitorName}`;
    const savedData = localStorage.getItem(key);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);

        // Check if competitor already exists in current list
        const existingIndex = competitors.findIndex(
          (c) => c.name === competitorName,
        );
        const existingAnalysisIndex = analysis.findIndex(
          (a) => a.name === competitorName,
        );

        if (existingIndex !== -1) {
          // Update existing competitor
          const newCompetitors = [...competitors];
          newCompetitors[existingIndex] = {
            name: parsed.name,
            website: parsed.website,
            social: parsed.social,
          };
          setCompetitors(newCompetitors);
        } else {
          // Add as new competitor
          setCompetitors([
            ...competitors,
            {
              name: parsed.name,
              website: parsed.website,
              social: parsed.social,
            },
          ]);
        }

        if (parsed.analysis && existingAnalysisIndex !== -1) {
          // Update existing analysis
          const newAnalysis = [...analysis];
          newAnalysis[existingAnalysisIndex] = parsed;
          setAnalysis(newAnalysis);
        } else if (parsed.analysis) {
          // Add as new analysis
          setAnalysis([...analysis, parsed]);
        }

        const analysisStatus = parsed.analysis
          ? 'analyysi mukaan lukien'
          : 'perustiedot';
        alert(
          `Kilpailija "${competitorName}" ladattu onnistuneesti (${analysisStatus})!`,
        );
        setShowLoadMenu(false);
      } catch (error) {
        console.error('Error loading competitor:', error);
        alert('Virhe ladattaessa kilpailijaa.');
      }
    }
  };

  const deleteCompetitor = (competitorName: string) => {
    const key = `competitor-${competitorName}`;
    localStorage.removeItem(key);
    loadSavedCompetitorsList();
    alert(`Kilpailija "${competitorName}" poistettu!`);
  };

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Target className='h-5 w-5' />
              Competitor Analyzer
            </div>
            <div className='relative'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setShowLoadMenu(!showLoadMenu)}>
                <Upload className='h-4 w-4 mr-2' />
                Lataa tallennetut ({savedCompetitors.length})
              </Button>

              {showLoadMenu && savedCompetitors.length > 0 && (
                <Card className='absolute right-0 top-12 z-10 w-80 max-h-60 overflow-y-auto'>
                  <CardContent className='p-3'>
                    <div className='space-y-2'>
                      {savedCompetitors.map((name) => (
                        <div
                          key={name}
                          className='flex items-center justify-between p-2 border rounded'>
                          <span className='text-sm font-medium'>{name}</span>
                          <div className='flex gap-1'>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => loadCompetitor(name)}>
                              <Upload className='h-3 w-3' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => deleteCompetitor(name)}>
                              <Trash2 className='h-3 w-3' />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* Competitor Input */}
          <div className='space-y-4'>
            <Label>Add Competitors to Analyze</Label>
            <div className='bg-blue-50 border border-blue-200 rounded-md p-3 mb-4'>
              <p className='text-sm text-blue-800'>
                💡 <strong>Huomio:</strong> LLM voi generoida osoite-ehdotuksia
                automaattisesti, mutta tarkista aina että linkit ovat oikeita
                ennen analyysiä.
              </p>
            </div>
            {competitors.map((competitor, index) => (
              <Card key={index} className='p-4 space-y-3'>
                <div className='flex items-center justify-between'>
                  <h4 className='font-medium'>Competitor {index + 1}</h4>
                  <div className='flex gap-2'>
                    {competitors.length > 1 && (
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => removeCompetitor(index)}>
                        Remove
                      </Button>
                    )}
                    <Button
                      variant='default'
                      size='sm'
                      onClick={() => saveCompetitorInput(competitor)}>
                      <Save className='h-4 w-4 mr-1' />
                      Tallenna
                    </Button>
                  </div>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
                  <div>
                    <Label>Company Name</Label>
                    <Input
                      placeholder='Competitor Inc.'
                      value={competitor.name}
                      onChange={(e) =>
                        updateCompetitor(index, 'name', e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label>Website URL</Label>
                    <Input
                      placeholder='https://competitor.com'
                      value={competitor.website}
                      onChange={(e) =>
                        updateCompetitor(index, 'website', e.target.value)
                      }
                    />
                    <p className='text-xs text-muted-foreground mt-1'>
                      Tarkista linkki ennen analyysiä
                    </p>
                  </div>
                  <div>
                    <Label>Social Media</Label>
                    <Input
                      placeholder='https://linkedin.com/company/competitor'
                      value={competitor.social}
                      onChange={(e) =>
                        updateCompetitor(index, 'social', e.target.value)
                      }
                    />
                    <p className='text-xs text-muted-foreground mt-1'>
                      Tarkista linkki ennen analyysiä
                    </p>
                  </div>
                </div>
              </Card>
            ))}
            <Button
              variant='outline'
              onClick={addCompetitor}
              className='w-full'>
              Add Another Competitor
            </Button>
          </div>

          <Button
            onClick={analyzeCompetitors}
            disabled={
              isAnalyzing ||
              competitors.filter((c) => c.name && c.website).length === 0
            }
            className='w-full'>
            {isAnalyzing ? 'Analyzing...' : 'Analyze Competitors'}
          </Button>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <TrendingUp className='h-5 w-5' />
                Analysis Results
              </div>
              <Button variant='outline' size='sm' onClick={exportAnalysis}>
                <Download className='h-4 w-4 mr-2' />
                Export All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            {analysis.map((comp, index) => (
              <Card key={index} className='p-4'>
                <div className='flex items-center justify-between mb-4'>
                  <div>
                    <h3 className='font-semibold'>{comp.name}</h3>
                    <p className='text-sm text-muted-foreground'>
                      {comp.website}
                    </p>
                  </div>
                  <div className='flex gap-2'>
                    <Button
                      variant='default'
                      size='sm'
                      onClick={() => saveCompetitor(comp)}>
                      <Save className='h-4 w-4 mr-1' />
                      Tallenna
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => setSelectedCompetitor(comp)}>
                      <Eye className='h-4 w-4' />
                    </Button>
                  </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <h4 className='font-medium mb-2'>Target Audience</h4>
                    <div className='flex flex-wrap gap-1'>
                      {comp.analysis.targetAudience.map((audience, i) => (
                        <Badge key={i} variant='secondary'>
                          {audience}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className='font-medium mb-2'>Pain Points</h4>
                    <div className='flex flex-wrap gap-1'>
                      {comp.analysis.painPoints.map((point, i) => (
                        <Badge key={i} variant='destructive'>
                          {point}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className='font-medium mb-2'>Value Proposition</h4>
                    <p className='text-sm text-muted-foreground'>
                      {comp.analysis.valueProposition}
                    </p>
                  </div>

                  <div>
                    <h4 className='font-medium mb-2'>Marketing Channels</h4>
                    <div className='flex flex-wrap gap-1'>
                      {comp.analysis.marketingChannels.map((channel, i) => (
                        <Badge key={i} variant='outline'>
                          {channel}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Detailed Analysis Modal */}
      {selectedCompetitor && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <Search className='h-5 w-5' />
                Detailed Analysis: {selectedCompetitor.name}
              </div>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setSelectedCompetitor(null)}>
                Close
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              <div className='space-y-4'>
                <div>
                  <h4 className='font-medium mb-2'>Strengths</h4>
                  <ul className='space-y-1'>
                    {selectedCompetitor.analysis.strengths.map(
                      (strength, i) => (
                        <li key={i} className='text-sm flex items-center gap-2'>
                          <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                          {strength}
                        </li>
                      ),
                    )}
                  </ul>
                </div>

                <div>
                  <h4 className='font-medium mb-2'>Weaknesses</h4>
                  <ul className='space-y-1'>
                    {selectedCompetitor.analysis.weaknesses.map(
                      (weakness, i) => (
                        <li key={i} className='text-sm flex items-center gap-2'>
                          <div className='w-2 h-2 bg-red-500 rounded-full'></div>
                          {weakness}
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              </div>

              <div className='space-y-4'>
                <div>
                  <h4 className='font-medium mb-2'>Opportunities</h4>
                  <ul className='space-y-1'>
                    {selectedCompetitor.analysis.opportunities.map(
                      (opportunity, i) => (
                        <li key={i} className='text-sm flex items-center gap-2'>
                          <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                          {opportunity}
                        </li>
                      ),
                    )}
                  </ul>
                </div>

                <div>
                  <h4 className='font-medium mb-2'>Threats</h4>
                  <ul className='space-y-1'>
                    {selectedCompetitor.analysis.threats.map((threat, i) => (
                      <li key={i} className='text-sm flex items-center gap-2'>
                        <div className='w-2 h-2 bg-orange-500 rounded-full'></div>
                        {threat}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h4 className='font-medium mb-2'>Pricing Strategy</h4>
              <p className='text-sm text-muted-foreground'>
                {selectedCompetitor.analysis.pricingStrategy}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
