import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { LocationSelector } from '@/components/ui/location-selector';
import { CompanySelector } from '@/components/ui/company-selector';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { OwnCompany } from '@/services/project-service';
import { ExternalLink, Save, RotateCcw } from 'lucide-react';

interface OwnCompanyFormProps {
  company: OwnCompany;
  onChange: (field: keyof OwnCompany, value: string) => void;
  onReset?: () => void;
  onSaveCompany?: (company: OwnCompany) => Promise<void>;
}

export function OwnCompanyForm({
  company,
  onChange,
  onReset,
  onSaveCompany,
}: OwnCompanyFormProps) {
  // Handle bulk company selection
  const handleCompanySelect = (selectedCompany: OwnCompany) => {
    // Update all fields at once
    Object.entries(selectedCompany).forEach(([field, value]) => {
      onChange(field as keyof OwnCompany, value as string);
    });
  };

  // Handle form reset
  const handleReset = async () => {
    if (onReset) {
      try {
        await onReset();
      } catch (error) {
        console.error('Error resetting form:', error);
      }
    } else {
      // Fallback: clear all fields manually
      const emptyCompany: OwnCompany = {
        name: '',
        location: '',
        website: '',
        social: '',
        industry: '',
        companySize: '',
        targetMarket: '',
        valueProposition: '',
        mainOfferings: '',
        pricingModel: '',
        uniqueFeatures: '',
        marketSegment: '',
        competitiveAdvantages: '',
        currentCustomers: '',
        successStories: '',
        painPointsSolved: '',
        customerGoals: '',
        currentMarketingChannels: '',
        marketingMessaging: '',
      };

      Object.entries(emptyCompany).forEach(([field, value]) => {
        onChange(field as keyof OwnCompany, value);
      });
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
      <div className='mb-3'>
        <h3 className='font-medium'>Your Company</h3>
      </div>

      {/* Reset Button - Only show if onReset is provided */}
      {onReset && (
        <div className='flex justify-end items-center gap-2 mb-4'>
          <Button
            type='button'
            variant='outline'
            onClick={async () => {
              try {
                await handleReset();
              } catch (error) {
                console.error('Error resetting form:', error);
              }
            }}
            className='flex items-center gap-2'
            title='Clear all fields and start over'>
            <RotateCcw className='h-4 w-4' />
            Reset Form
          </Button>
        </div>
      )}

      <div className='space-y-3'>
        <div className='flex gap-2'>
          <div className='flex-1'>
            <CompanySelector
              value={company.name}
              onChange={onChange}
              onCompanySelect={handleCompanySelect}
              onSaveCompany={onSaveCompany}
            />
          </div>

          <div className='w-48 space-y-2'>
            <Label htmlFor='own-company-location'>Location</Label>
            <LocationSelector
              value={company.location || 'Global'}
              onValueChange={(value) => onChange('location', value)}
              className='w-full'
            />
          </div>
        </div>

        <div className='space-y-2'>
          <p className='text-xs text-muted-foreground'>
            Company name and location is required. Fill all fields for better
            results.
          </p>
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
    </Card>
  );
}
