import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { LocationSelector } from '@/components/ui/location-selector';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { OwnCompany } from '@/services/project-service';
import { CompanyDataFetcher } from '@/services/ai/company-data-fetcher';
import {
  ExternalLink,
  RefreshCw,
  Save,
  ChevronDown,
  Zap,
  Search,
} from 'lucide-react';

interface OwnCompanyFormProps {
  company: OwnCompany;
  isFetchingData: boolean;
  reviewsStatus?: { success: boolean; message: string } | null;
  onChange: (field: keyof OwnCompany, value: string) => void;
  onFetchCustomerReviews: (companyName: string) => void;
  onSave?: (company: OwnCompany) => void;
  // Dropdown controls
  hasSaved?: boolean;
  showDropdown?: boolean;
  savedName?: string;
  onToggleDropdown?: () => void;
  onLoadSaved?: () => void;
}

export function OwnCompanyForm({
  company,
  isFetchingData,
  reviewsStatus,
  onChange,
  onFetchCustomerReviews,
  onSave,
  hasSaved,
  showDropdown,
  savedName,
  onToggleDropdown,
  onLoadSaved,
}: OwnCompanyFormProps) {
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [autoFillStatus, setAutoFillStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const companyDataFetcher = new CompanyDataFetcher();

  // Auto-fill company data from multiple sources
  const handleAutoFill = async () => {
    if (!company.name.trim()) {
      setAutoFillStatus({
        success: false,
        message: 'Company name is required for auto-fill',
      });
      return;
    }

    if (!company.location || company.location === 'Global') {
      setAutoFillStatus({
        success: false,
        message:
          'Please select a specific location for better auto-fill results',
      });
      return;
    }

    setIsAutoFilling(true);
    setAutoFillStatus(null);

    try {
      const result = await companyDataFetcher.fetchCompanyData(
        company.name,
        company.location,
      );

      if (result.success) {
        // Apply the fetched data to the form
        Object.entries(result.data).forEach(([key, value]) => {
          if (value && key in company) {
            onChange(key as keyof OwnCompany, value);
          }
        });

        setAutoFillStatus({
          success: true,
          message: `Auto-filled data from ${result.sources.join(', ')} sources`,
        });
      } else {
        setAutoFillStatus({
          success: false,
          message: `Auto-fill failed: ${
            result.errors?.join(', ') || 'No data found'
          }`,
        });
      }
    } catch (error) {
      setAutoFillStatus({
        success: false,
        message: `Auto-fill error: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      });
    } finally {
      setIsAutoFilling(false);
    }
  };

  // Predefined options for dropdowns
  const industryOptions = [
    'SaaS/Software',
    'E-commerce',
    'Healthcare',
    'Finance/Banking',
    'Education',
    'Manufacturing',
    'Real Estate',
    'Marketing/Advertising',
    'Consulting',
    'Retail',
    'Technology',
    'Media/Entertainment',
    'Transportation',
    'Energy',
    'Other',
  ];

  const companySizeOptions = [
    'Startup (1-10 employees)',
    'Small Business (11-50 employees)',
    'Medium Business (51-200 employees)',
    'Large Business (201-1000 employees)',
    'Enterprise (1000+ employees)',
  ];

  const pricingModelOptions = [
    'Subscription',
    'One-time purchase',
    'Freemium',
    'Usage-based',
    'Tiered pricing',
    'Custom pricing',
    'Free',
  ];

  const marketSegmentOptions = [
    'B2B',
    'B2C',
    'B2B2C',
    'D2C (Direct to Consumer)',
    'Marketplace',
    'Platform',
  ];

  const marketingChannelsOptions = [
    'LinkedIn',
    'Google Ads',
    'Facebook Ads',
    'Instagram',
    'Email Marketing',
    'Content Marketing',
    'SEO',
    'Trade Shows',
    'Referral Programs',
    'Influencer Marketing',
    'YouTube',
    'TikTok',
    'Twitter/X',
    'Direct Mail',
    'Cold Calling',
  ];
  return (
    <Card className='p-4 space-y-3 bg-muted/30 relative'>
      <div className='flex items-center justify-between mb-3'>
        <h3 className='font-medium'>Your Company</h3>
      </div>

      <div className='space-y-3'>
        <div className='flex gap-2'>
          <div className='flex-1 space-y-2'>
            <Label htmlFor='own-company-name'>
              Company Name{' '}
              <span className='text-red-600' aria-hidden='true'>
                *
              </span>
            </Label>
            <div className='relative'>
              <Input
                id='own-company-name'
                placeholder='Enter your company name (required)'
                aria-required='true'
                required
                value={company.name}
                onChange={(e) => onChange('name', e.target.value)}
                className='pr-10'
              />
              {hasSaved && (
                <>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7'
                    onClick={onToggleDropdown}
                    title='Select saved company'
                    aria-haspopup='listbox'
                    aria-expanded={!!showDropdown}>
                    <ChevronDown className='h-4 w-4 opacity-70' />
                  </Button>

                  {showDropdown && (
                    <Card className='absolute top-10 right-0 z-10 w-64 max-h-48 overflow-y-auto'>
                      <CardContent className='p-2'>
                        <div className='space-y-1'>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='w-full justify-start text-left'
                            onClick={onLoadSaved}
                            title='Load saved company'>
                            {savedName || 'Saved company'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>
          </div>

          <div className='w-48 space-y-2'>
            <Label htmlFor='own-company-location'>Location</Label>
            <LocationSelector
              value={company.location || 'Global'}
              onValueChange={(value) => onChange('location', value)}
              className='w-full'
            />
          </div>

          <div className='space-y-2'>
            <div className='opacity-0 pointer-events-none'>
              <Label>Placeholder</Label>
            </div>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                size='icon'
                onClick={handleAutoFill}
                disabled={
                  isAutoFilling ||
                  !company.name.trim() ||
                  !company.location ||
                  company.location === 'Global'
                }
                title='Auto-fill from multiple sources (Google Maps, LinkedIn, etc.) - requires company name and specific location'>
                {isAutoFilling ? (
                  <RefreshCw className='h-4 w-4 animate-spin' />
                ) : (
                  <Zap className='h-4 w-4' />
                )}
              </Button>
              <Button
                variant='default'
                size='icon'
                onClick={() => {
                  if (!company.name.trim()) {
                    alert('Company name is required to save!');
                    return;
                  }
                  onSave?.(company);
                }}
                title='Save company details'>
                <Save className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </div>

        <div className='space-y-2'>
          <p className='text-xs text-muted-foreground'>
            Company name and location is required, But for better results, fill
            all fields or use Auto-Fill to get comprehensive data from multiple
            sources
          </p>
          {company.name && !company.website && (
            <p className='text-xs text-muted-foreground'>
              💡 Enter your company name and location, then use Auto-Fill to get
              comprehensive data from multiple sources
            </p>
          )}
          {autoFillStatus && (
            <p
              className={`text-xs ${
                autoFillStatus.success ? 'text-green-600' : 'text-orange-600'
              }`}>
              {autoFillStatus.message}
            </p>
          )}
        </div>
      </div>

      <div className='grid md:grid-cols-2 gap-3'>
        <div className='space-y-2'>
          <Label htmlFor='own-company-website'>Website URL</Label>
          <div className='flex gap-2'>
            <Input
              id='own-company-website'
              placeholder='https://yourcompany.com'
              value={company.website}
              onChange={(e) => onChange('website', e.target.value)}
            />
            {company.website && (
              <Button
                variant='outline'
                size='icon'
                onClick={() => window.open(company.website, '_blank')}
                title='Open website in a new tab'>
                <ExternalLink className='h-4 w-4' />
              </Button>
            )}
          </div>
        </div>
        <div className='space-y-2'>
          <Label htmlFor='own-company-social'>LinkedIn</Label>
          <div className='flex gap-2'>
            <Input
              id='own-company-social'
              placeholder='https://linkedin.com/company/your-company'
              value={company.social}
              onChange={(e) => onChange('social', e.target.value)}
            />
            {company.social && (
              <Button
                variant='outline'
                size='icon'
                onClick={() => window.open(company.social, '_blank')}
                title='Open LinkedIn in a new tab'>
                <ExternalLink className='h-4 w-4' />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Business Information Section */}
      <div className='space-y-4'>
        <div className='flex items-center gap-2'>
          <h4 className='text-sm font-medium text-muted-foreground'>
            Business Information
          </h4>
          <div className='flex-1 h-px bg-border'></div>
        </div>

        <div className='grid md:grid-cols-2 gap-3'>
          <div className='space-y-2'>
            <Label htmlFor='own-company-industry'>Industry/Sector</Label>
            <Select
              value={company.industry || ''}
              onValueChange={(value) => onChange('industry', value)}>
              <SelectTrigger>
                <SelectValue placeholder='Select your industry' />
              </SelectTrigger>
              <SelectContent>
                {industryOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='space-y-2'>
            <Label htmlFor='own-company-size'>Company Size</Label>
            <Select
              value={company.companySize || ''}
              onValueChange={(value) => onChange('companySize', value)}>
              <SelectTrigger>
                <SelectValue placeholder='Select company size' />
              </SelectTrigger>
              <SelectContent>
                {companySizeOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='own-company-target-market'>Target Market</Label>
          <Textarea
            id='own-company-target-market'
            placeholder='Describe your primary target market (e.g., Small businesses in Finland, Tech startups, Healthcare professionals)'
            value={company.targetMarket || ''}
            onChange={(e) => onChange('targetMarket', e.target.value)}
            rows={2}
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='own-company-value-prop'>Value Proposition</Label>
          <Textarea
            id='own-company-value-prop'
            placeholder='What unique value do you provide to customers? (e.g., We help small businesses automate their marketing with AI)'
            value={company.valueProposition || ''}
            onChange={(e) => onChange('valueProposition', e.target.value)}
            rows={2}
          />
        </div>

        <div className='grid md:grid-cols-2 gap-3'>
          <div className='space-y-2'>
            <Label htmlFor='own-company-offerings'>Main Offerings</Label>
            <Textarea
              id='own-company-offerings'
              placeholder='Main products/services you offer'
              value={company.mainOfferings || ''}
              onChange={(e) => onChange('mainOfferings', e.target.value)}
              rows={2}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='own-company-pricing'>Pricing Model</Label>
            <Select
              value={company.pricingModel || ''}
              onValueChange={(value) => onChange('pricingModel', value)}>
              <SelectTrigger>
                <SelectValue placeholder='Select pricing model' />
              </SelectTrigger>
              <SelectContent>
                {pricingModelOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='own-company-features'>
            Unique Features/Advantages
          </Label>
          <Textarea
            id='own-company-features'
            placeholder='What makes your product/service unique? Key features or competitive advantages'
            value={company.uniqueFeatures || ''}
            onChange={(e) => onChange('uniqueFeatures', e.target.value)}
            rows={2}
          />
        </div>

        <div className='grid md:grid-cols-2 gap-3'>
          <div className='space-y-2'>
            <Label htmlFor='own-company-segment'>Market Segment</Label>
            <Select
              value={company.marketSegment || ''}
              onValueChange={(value) => onChange('marketSegment', value)}>
              <SelectTrigger>
                <SelectValue placeholder='Select market segment' />
              </SelectTrigger>
              <SelectContent>
                {marketSegmentOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='space-y-2'>
            <Label htmlFor='own-company-advantages'>
              Competitive Advantages
            </Label>
            <Input
              id='own-company-advantages'
              placeholder='Key advantages over competitors'
              value={company.competitiveAdvantages || ''}
              onChange={(e) =>
                onChange('competitiveAdvantages', e.target.value)
              }
            />
          </div>
        </div>
      </div>

      {/* Customer Insights Section */}
      <div className='space-y-4'>
        <div className='flex items-center gap-2'>
          <h4 className='text-sm font-medium text-muted-foreground'>
            Customer Insights
          </h4>
          <div className='flex-1 h-px bg-border'></div>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='own-company-customers'>Current Customer Base</Label>
          <Textarea
            id='own-company-customers'
            placeholder='Describe your current customers (types, industries, sizes, characteristics)'
            value={company.currentCustomers || ''}
            onChange={(e) => onChange('currentCustomers', e.target.value)}
            rows={2}
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='own-company-success-stories'>
            Success Stories/Testimonials
          </Label>
          <Textarea
            id='own-company-success-stories'
            placeholder='Customer success stories, testimonials, or case studies'
            value={company.successStories || ''}
            onChange={(e) => onChange('successStories', e.target.value)}
            rows={3}
          />
        </div>

        <div className='grid md:grid-cols-2 gap-3'>
          <div className='space-y-2'>
            <Label htmlFor='own-company-pain-points'>Pain Points Solved</Label>
            <Textarea
              id='own-company-pain-points'
              placeholder='What problems do you solve for customers?'
              value={company.painPointsSolved || ''}
              onChange={(e) => onChange('painPointsSolved', e.target.value)}
              rows={2}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='own-company-goals'>Customer Goals</Label>
            <Textarea
              id='own-company-goals'
              placeholder='What goals do customers achieve with your help?'
              value={company.customerGoals || ''}
              onChange={(e) => onChange('customerGoals', e.target.value)}
              rows={2}
            />
          </div>
        </div>
      </div>

      {/* Marketing Context Section */}
      <div className='space-y-4'>
        <div className='flex items-center gap-2'>
          <h4 className='text-sm font-medium text-muted-foreground'>
            Marketing Context
          </h4>
          <div className='flex-1 h-px bg-border'></div>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='own-company-channels'>
            Current Marketing Channels
          </Label>
          <Textarea
            id='own-company-channels'
            placeholder='What marketing channels are you currently using? (e.g., LinkedIn, Google Ads, Email, Events)'
            value={company.currentMarketingChannels || ''}
            onChange={(e) =>
              onChange('currentMarketingChannels', e.target.value)
            }
            rows={2}
          />
          <div className='flex flex-wrap gap-1 mt-1'>
            <span className='text-xs text-muted-foreground'>Quick add:</span>
            {marketingChannelsOptions.slice(0, 8).map((channel) => (
              <Button
                key={channel}
                variant='outline'
                size='sm'
                className='text-xs h-6 px-2'
                onClick={() => {
                  const current = company.currentMarketingChannels || '';
                  const newValue = current ? `${current}, ${channel}` : channel;
                  onChange('currentMarketingChannels', newValue);
                }}>
                + {channel}
              </Button>
            ))}
          </div>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='own-company-messaging'>Marketing Messaging</Label>
          <Textarea
            id='own-company-messaging'
            placeholder='Current marketing messaging, positioning, or key talking points'
            value={company.marketingMessaging || ''}
            onChange={(e) => onChange('marketingMessaging', e.target.value)}
            rows={2}
          />
        </div>
      </div>

      {/* Save Button */}
      <div className='flex justify-end pt-2'>
        <Button
          type='button'
          onClick={() => onSave?.(company)}
          disabled={!company.name.trim()}
          className='flex items-center gap-2'
          title='Save all company information'>
          <Save className='h-4 w-4' />
          Save Company Info
        </Button>
      </div>

      <div className='space-y-2'>
        <div className='flex items-center justify-between'>
          <Label htmlFor='own-company-reviews'>Customer Reviews</Label>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                if (company.name.trim()) {
                  onFetchCustomerReviews(company.name);
                }
              }}
              disabled={isFetchingData || !company.name.trim()}
              title='Fetch customer data'>
              {isFetchingData ? (
                <RefreshCw className='h-4 w-4 animate-spin mr-2' />
              ) : (
                <Search className='h-4 w-4 mr-2' />
              )}
              {isFetchingData ? 'Fetching...' : 'Fetch Data'}
            </Button>
          </div>
        </div>
        <Textarea
          id='own-company-reviews'
          placeholder='Click "Fetch Data" to collect real customer reviews from Google Maps via Apify'
          value={company.reviews || ''}
          readOnly
          rows={6}
          className='max-h-48 overflow-y-auto'
        />
        {reviewsStatus && (
          <div
            className={`text-xs ${
              reviewsStatus.success ? 'text-green-600' : 'text-red-600'
            }`}>
            {reviewsStatus.message}
          </div>
        )}
      </div>
    </Card>
  );
}
