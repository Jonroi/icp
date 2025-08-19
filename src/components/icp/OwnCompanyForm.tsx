import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
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
import { ExternalLink, RefreshCw } from 'lucide-react';
import { LocationSelector } from '@/components/ui/location-selector';
import type { OwnCompany } from '@/services/project';

interface OwnCompanyFormProps {
  company: OwnCompany;
  companies?: any[];
  activeCompany?: any;
  onChange: (field: keyof OwnCompany, value: string) => void;
  onSaveCompany?: (company: OwnCompany) => Promise<void>;
  onReset?: () => Promise<void>;
  onCompanyDeleted?: (companyId: string) => void;
  activeCompanyId?: string;
  onCompanyIdChange?: (id: string) => void;
}

const industryOptions = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Retail',
  'Manufacturing',
  'Real Estate',
  'Marketing',
  'Consulting',
  'Legal',
  'Non-profit',
  'Entertainment',
  'Food & Beverage',
  'Travel & Tourism',
  'Automotive',
  'Energy',
  'Telecommunications',
  'Media & Publishing',
  'Sports & Fitness',
  'Fashion & Beauty',
  'Other',
];

const companySizeOptions = [
  'Startup (1-10 employees)',
  'Small Business (11-50 employees)',
  'Medium Business (51-200 employees)',
  'Large Business (201-1000 employees)',
  'Enterprise (1000+ employees)',
];

const marketSegmentOptions = [
  'B2B (Business-to-Business)',
  'B2C (Business-to-Consumer)',
  'B2B2C (Business-to-Business-to-Consumer)',
  'D2C (Direct-to-Consumer)',
  'Marketplace',
  'SaaS (Software-as-a-Service)',
  'E-commerce',
  'Agency/Consulting',
  'Manufacturing',
  'Healthcare',
  'Education',
  'Financial Services',
  'Real Estate',
  'Other',
];

const pricingModelOptions = [
  'Subscription',
  'One-time Purchase',
  'Freemium',
  'Usage-based',
  'Tiered Pricing',
  'Custom Pricing',
  'Free',
  'Other',
];

export function OwnCompanyForm({
  company,
  companies = [],
  activeCompany,
  onChange,
  onSaveCompany,
  onReset,
  onCompanyDeleted,
  activeCompanyId,
  onCompanyIdChange,
}: OwnCompanyFormProps) {
  const [isResetting, setIsResetting] = useState(false);

  // Find the active company from the companies array
  const activeCompanyData = companies.find(
    (c) => c.id?.toString() === activeCompanyId,
  );

  // Note: Form updates are now handled in useAppState.ts to prevent conflicts

  const handleCompanySelect = (selectedCompany: OwnCompany) => {
    // Update form with selected company data
    Object.entries(selectedCompany).forEach(([key, value]) => {
      if (key in company && value !== undefined) {
        onChange(key as keyof OwnCompany, value as string);
      }
    });
  };

  const handleReset = async () => {
    if (onReset) {
      setIsResetting(true);
      try {
        await onReset();
      } finally {
        setIsResetting(false);
      }
    }
  };

  return (
    <div className='space-y-6'>
      {/* Active Company Display */}
      {activeCompanyData && (
        <div className='p-4 bg-muted/30 rounded-lg border'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-lg font-semibold'>{activeCompanyData.name}</p>
              {activeCompanyData.industry && (
                <p className='text-sm text-muted-foreground'>
                  {activeCompanyData.industry}
                </p>
              )}
            </div>
            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={handleReset}
                disabled={isResetting}
                className='flex items-center gap-2'>
                {isResetting ? (
                  <RefreshCw className='h-4 w-4 animate-spin' />
                ) : (
                  <RefreshCw className='h-4 w-4' />
                )}
                Reset Form
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className='space-y-3'>
        <div className='flex gap-2'>
          <div className='w-48 space-y-2'>
            <Label htmlFor='own-company-location'>Primary Market</Label>
            <LocationSelector
              key={`location-${company.location || ''}`}
              value={company.location || ''}
              onValueChange={(value) => onChange('location', value)}
              className='w-full'
            />
          </div>
        </div>

        <div className='space-y-2'>
          <p className='text-xs text-muted-foreground'>
            Primary market is required. Fill all fields for better results.
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
            placeholder='Describe your primary target market and ideal customers...'
            value={company.targetMarket || ''}
            onChange={(e) => onChange('targetMarket', e.target.value)}
            rows={3}
          />
        </div>

        <div className='grid md:grid-cols-2 gap-3'>
          <div className='space-y-2'>
            <Label htmlFor='own-company-market-segment'>Market Segment</Label>
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
          <Label htmlFor='own-company-value-proposition'>
            Value Proposition
          </Label>
          <Textarea
            id='own-company-value-proposition'
            placeholder='What unique value do you provide to your customers?'
            value={company.valueProposition || ''}
            onChange={(e) => onChange('valueProposition', e.target.value)}
            rows={3}
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='own-company-main-offerings'>Main Offerings</Label>
          <Textarea
            id='own-company-main-offerings'
            placeholder='Describe your main products or services...'
            value={company.mainOfferings || ''}
            onChange={(e) => onChange('mainOfferings', e.target.value)}
            rows={3}
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='own-company-unique-features'>Unique Features</Label>
          <Textarea
            id='own-company-unique-features'
            placeholder='What makes your offerings unique or different from competitors?'
            value={company.uniqueFeatures || ''}
            onChange={(e) => onChange('uniqueFeatures', e.target.value)}
            rows={3}
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='own-company-competitive-advantages'>
            Competitive Advantages
          </Label>
          <Textarea
            id='own-company-competitive-advantages'
            placeholder='What are your key competitive advantages?'
            value={company.competitiveAdvantages || ''}
            onChange={(e) => onChange('competitiveAdvantages', e.target.value)}
            rows={3}
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='own-company-current-customers'>
            Current Customers
          </Label>
          <Textarea
            id='own-company-current-customers'
            placeholder='Describe your current customer base...'
            value={company.currentCustomers || ''}
            onChange={(e) => onChange('currentCustomers', e.target.value)}
            rows={3}
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='own-company-success-stories'>Success Stories</Label>
          <Textarea
            id='own-company-success-stories'
            placeholder='Share some customer success stories or testimonials...'
            value={company.successStories || ''}
            onChange={(e) => onChange('successStories', e.target.value)}
            rows={3}
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='own-company-current-marketing-channels'>
            Current Marketing Channels
          </Label>
          <Textarea
            id='own-company-current-marketing-channels'
            placeholder='What marketing channels are you currently using?'
            value={company.currentMarketingChannels || ''}
            onChange={(e) =>
              onChange('currentMarketingChannels', e.target.value)
            }
            rows={3}
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='own-company-marketing-messaging'>
            Current Marketing Messaging
          </Label>
          <Textarea
            id='own-company-marketing-messaging'
            placeholder='Describe your current marketing messaging and positioning...'
            value={company.marketingMessaging || ''}
            onChange={(e) => onChange('marketingMessaging', e.target.value)}
            rows={3}
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='own-company-pain-points-solved'>
            Pain Points Solved
          </Label>
          <Textarea
            id='own-company-pain-points-solved'
            placeholder='What pain points do you solve for your customers?'
            value={company.painPointsSolved || ''}
            onChange={(e) => onChange('painPointsSolved', e.target.value)}
            rows={3}
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='own-company-customer-goals'>Customer Goals</Label>
          <Textarea
            id='own-company-customer-goals'
            placeholder='What goals do customers achieve with your help?'
            value={company.customerGoals || ''}
            onChange={(e) => onChange('customerGoals', e.target.value)}
            rows={3}
          />
        </div>
      </div>
    </div>
  );
}
