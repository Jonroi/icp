import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { LocationSelector } from '@/components/ui/location-selector';
import type { OwnCompany } from '@/services/project-service';
import {
  ExternalLink,
  RefreshCw,
  Search,
  Save,
  ChevronDown,
} from 'lucide-react';

interface OwnCompanyFormProps {
  company: OwnCompany;
  isFetchingCompanyInfo: boolean;
  isFetchingData: boolean;
  companyInfoStatus?: { success: boolean; message: string } | null;
  reviewsStatus?: { success: boolean; message: string } | null;
  onChange: (field: keyof OwnCompany, value: string) => void;
  onFetchCompanyInfo: (companyName: string) => void;
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
  isFetchingCompanyInfo,
  isFetchingData,
  companyInfoStatus,
  reviewsStatus,
  onChange,
  onFetchCompanyInfo,
  onFetchCustomerReviews,
  onSave,
  hasSaved,
  showDropdown,
  savedName,
  onToggleDropdown,
  onLoadSaved,
}: OwnCompanyFormProps) {
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
                onClick={() => {
                  if (company.name.trim()) {
                    onFetchCompanyInfo(company.name);
                  }
                }}
                disabled={isFetchingCompanyInfo || !company.name.trim()}
                title='Fetch company info'>
                {isFetchingCompanyInfo ? (
                  <RefreshCw className='h-4 w-4 animate-spin' />
                ) : (
                  <Search className='h-4 w-4' />
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
            Only the company name is required. All other fields are optional.
          </p>
          {company.name && !company.website && (
            <p className='text-xs text-muted-foreground'>
              💡 Enter your company name and use Search to auto-fill optional
              details
            </p>
          )}
          {companyInfoStatus && (
            <p
              className={`text-xs ${
                companyInfoStatus.success ? 'text-green-600' : 'text-orange-600'
              }`}>
              {companyInfoStatus.message}
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
          placeholder='Copy and paste reviews here, Click "Fetch Data" to collect customer data automatically or ask AI Assistant to generate reviews'
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
