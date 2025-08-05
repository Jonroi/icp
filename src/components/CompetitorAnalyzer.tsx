import { useState } from 'react';
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
} from 'lucide-react';
// import { AIService } from '@/services/ai';

interface CompetitorAnalyzerProps {
  onCompetitorDataCollected: (competitors: unknown[]) => void;
}

interface CompetitorAnalysis {
  name: string;
  website: string;
  social: string;
  websiteContent: string;
  analysis: {
    targetAudience: string[];
    painPoints: string[];
    valueProposition: string;
    pricingStrategy: string;
    marketingChannels: string[];
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
}

export function CompetitorAnalyzer({
  onCompetitorDataCollected,
}: CompetitorAnalyzerProps) {
  const [competitors, setCompetitors] = useState<
    Array<{ name: string; website: string; social: string }>
  >([{ name: '', website: '', social: '' }]);
  const [analysis, setAnalysis] = useState<CompetitorAnalysis[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedCompetitor, setSelectedCompetitor] =
    useState<CompetitorAnalysis | null>(null);

  // const aiService = new AIService(apiKey || '');

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

             // Simuloidaan kilpailija-analyysi
       const mockAnalysis: CompetitorAnalysis[] = validCompetitors.map(
         (comp) => ({
          name: comp.name,
          website: comp.website,
          social: comp.social,
          websiteContent: `Simulated content from ${comp.website}`,
          analysis: {
            targetAudience: [
              'Tech-savvy professionals aged 25-40',
              'Small to medium businesses',
              'Marketing managers and directors',
            ],
            painPoints: [
              'Limited budget for marketing tools',
              'Time constraints in campaign management',
              'Difficulty measuring ROI',
            ],
            valueProposition:
              'AI-powered marketing automation that saves time and increases conversions',
            pricingStrategy: 'Freemium model with premium tiers',
            marketingChannels: [
              'LinkedIn',
              'Google Ads',
              'Content Marketing',
              'Email',
            ],
            strengths: [
              'Strong brand recognition',
              'Comprehensive feature set',
              'Good customer support',
            ],
            weaknesses: [
              'High pricing for small businesses',
              'Complex onboarding process',
              'Limited customization options',
            ],
            opportunities: [
              'Growing demand for AI tools',
              'Expansion to new markets',
              'Partnership opportunities',
            ],
            threats: [
              'New competitors entering market',
              'Economic downturn affecting budgets',
              'Regulatory changes',
            ],
          },
        }),
      );

      setAnalysis(mockAnalysis);
      onCompetitorDataCollected(mockAnalysis);
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

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Target className='h-5 w-5' />
            Competitor Analyzer
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* Competitor Input */}
          <div className='space-y-4'>
            <Label>Add Competitors to Analyze</Label>
            {competitors.map((competitor, index) => (
              <Card key={index} className='p-4 space-y-3'>
                <div className='flex items-center justify-between'>
                  <h4 className='font-medium'>Competitor {index + 1}</h4>
                  {competitors.length > 1 && (
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => removeCompetitor(index)}>
                      Remove
                    </Button>
                  )}
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
                Export
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
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => setSelectedCompetitor(comp)}>
                    <Eye className='h-4 w-4' />
                  </Button>
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
