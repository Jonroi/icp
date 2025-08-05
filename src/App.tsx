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
} from 'lucide-react';
import { useState } from 'react';
import { useAI } from '@/hooks/useAI';
// import type { CompetitorData, CustomerReview } from '@/services/ai';
import { GoogleReviewsCollector } from '@/components/GoogleReviewsCollector';
import { DemographicsAnalyzer } from '@/components/DemographicsAnalyzer';
import { CompetitorAnalyzer } from '@/components/CompetitorAnalyzer';
import type { GoogleReview } from '@/services/google-reviews';

type Competitor = {
  name: string;
  website: string;
  social: string;
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
  const [reviews, setReviews] = useState<string>('');
  const [additionalContext, setAdditionalContext] = useState<string>('');
  const [googleReviews, setGoogleReviews] = useState<GoogleReview[]>([]);
  // const [demographicsAnalysis, setDemographicsAnalysis] =
  //   useState<unknown>(null);
  // const [competitorAnalysis, setCompetitorAnalysis] = useState<unknown[]>([]);

  // AI hook - for now without API key (uses mock data)
  const { generateICPs, generatedICPs, isLoading, error } = useAI();
  const [generatedCampaign, setGeneratedCampaign] = useState<{
    adCopy: string;
    image: string;
    imageHint: string;
    cta: string;
    hooks: string;
    landingPageCopy: string;
  } | null>(null);

  const handleCompetitorChange = (
    index: number,
    field: keyof Competitor,
    value: string,
  ) => {
    const newCompetitors = [...competitors];
    newCompetitors[index][field] = value;
    setCompetitors(newCompetitors);
  };

  const addCompetitor = () => {
    if (competitors.length < 6) {
      setCompetitors([...competitors, { name: '', website: '', social: '' }]);
    }
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

  const handleGoogleReviewsCollected = (reviews: GoogleReview[]) => {
    setGoogleReviews(reviews);
  };

  const handleDemographicsAnalysisComplete = () => {
    // setDemographicsAnalysis(analysis);
  };

  const handleCompetitorDataCollected = () => {
    // setCompetitorAnalysis(competitors);
  };

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold font-headline tracking-tight'>
          ICP &amp; Campaign Insights
        </h1>
        <p className='text-muted-foreground'>
          Generate customer profiles and design winning campaigns with AI.
        </p>
      </div>

      <Tabs defaultValue='icp-generator'>
        <TabsList className='grid w-full grid-cols-6'>
          <TabsTrigger value='icp-generator'>ICP Generator</TabsTrigger>
          <TabsTrigger value='google-reviews'>Google Reviews</TabsTrigger>
          <TabsTrigger value='competitor-analysis'>
            Competitor Analysis
          </TabsTrigger>
          <TabsTrigger value='demographics'>Demographics</TabsTrigger>
          <TabsTrigger value='campaign-designer'>Campaign Designer</TabsTrigger>
          <TabsTrigger value='campaign-library'>Campaign Library</TabsTrigger>
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
                    <div className='flex items-end gap-3'>
                      <div className='flex-1 space-y-2'>
                        <Label htmlFor={`competitor-name-${index}`}>
                          Name of Competitor
                        </Label>
                        <Input
                          id={`competitor-name-${index}`}
                          placeholder='Competitor Inc.'
                          value={competitor.name}
                          onChange={(e) =>
                            handleCompetitorChange(
                              index,
                              'name',
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-9 w-9'
                        onClick={() => removeCompetitor(index)}>
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                    <div className='grid md:grid-cols-2 gap-3'>
                      <div className='space-y-2'>
                        <Label htmlFor={`competitor-website-${index}`}>
                          Website URL
                        </Label>
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
                      </div>
                      <div className='space-y-2'>
                        <Label htmlFor={`competitor-social-${index}`}>
                          Social Media (e.g., LinkedIn)
                        </Label>
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
                      </div>
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
                <Label htmlFor='reviews'>
                  Customer Reviews (Google, Trustpilot)
                </Label>
                <Textarea
                  id='reviews'
                  placeholder='Paste customer reviews here...'
                  rows={5}
                  value={reviews}
                  onChange={(e) => setReviews(e.target.value)}
                />
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
                <Button
                  className='flex-1'
                  onClick={() => {
                    generateICPs();
                  }}
                  disabled={isLoading}>
                  <Sparkles className='mr-2 h-4 w-4' />
                  {isLoading
                    ? 'Generating...'
                    : 'Generate Ideal Customer Personas'}
                </Button>
                <Button variant='secondary' className='flex-1'>
                  <Save className='mr-2 h-4 w-4' />
                  Save Competitor Data
                </Button>
              </div>
              {error && (
                <div className='p-4 bg-red-50 border border-red-200 rounded-md'>
                  <p className='text-red-600 text-sm'>{error}</p>
                </div>
              )}

              {generatedICPs.length > 0 && (
                <div className='space-y-4 pt-4 border-t'>
                  <h3 className='font-semibold'>
                    Generated ICPs ({generatedICPs.length})
                  </h3>
                  <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                    {generatedICPs.map((icp) => (
                      <Card key={icp.id} className='bg-muted/30'>
                        <CardHeader>
                          <CardTitle className='flex items-center justify-between'>
                            {icp.name}
                            <span className='text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded'>
                              {icp.confidence}% confidence
                            </span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-3'>
                          <div>
                            <h4 className='font-medium text-sm'>
                              Demographics
                            </h4>
                            <p className='text-xs text-muted-foreground'>
                              Age: {icp.demographics.ageRange.min}-
                              {icp.demographics.ageRange.max} years | Gender:{' '}
                              {icp.demographics.gender.male}% M,{' '}
                              {icp.demographics.gender.female}% F | Location:{' '}
                              {icp.demographics.location.join(', ')}
                            </p>
                          </div>
                          <div>
                            <h4 className='font-medium text-sm'>Job Titles</h4>
                            <p className='text-xs text-muted-foreground'>
                              {icp.psychographics.jobTitles.join(', ')}
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
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='google-reviews'>
          <GoogleReviewsCollector
            onReviewsCollected={handleGoogleReviewsCollected}
          />
        </TabsContent>

        <TabsContent value='competitor-analysis'>
          <CompetitorAnalyzer
            onCompetitorDataCollected={handleCompetitorDataCollected}
          />
        </TabsContent>

        <TabsContent value='demographics'>
          <DemographicsAnalyzer
            reviews={googleReviews}
            onAnalysisComplete={handleDemographicsAnalysisComplete}
          />
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
                    <SelectItem value='facebook'>Facebook</SelectItem>
                    <SelectItem value='instagram'>Instagram</SelectItem>
                    <SelectItem value='google-ads'>Google Ads</SelectItem>
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
    </div>
  );
}
