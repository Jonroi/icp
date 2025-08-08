import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  ExternalLink,
  RefreshCw,
  Search,
  Save,
  ChevronDown,
} from 'lucide-react';

export interface OwnCompany {
  name: string;
  website: string;
  social: string;
}

interface OwnCompanyFormProps {
  company: OwnCompany;
  isFetching: boolean;
  status?: { success: boolean; message: string } | null;
  onChange: (field: keyof OwnCompany, value: string) => void;
  onFetchInfo: (companyName: string) => void;
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
  isFetching,
  status,
  onChange,
  onFetchInfo,
  onSave,
  hasSaved,
  showDropdown,
  savedName,
  onToggleDropdown,
  onLoadSaved,
}: OwnCompanyFormProps) {
  return (
    <Card className='p-4 space-y-3 bg-muted/20'>
      <div className='flex items-center justify-between mb-1'>
        <h3 className='font-medium'>Your Company</h3>
      </div>

      <div className='space-y-3'>
        <div className='space-y-2'>
          <Label htmlFor='own-company-name'>
            Company Name{' '}
            <span className='text-red-600' aria-hidden='true'>
              *
            </span>
          </Label>
          <div className='flex gap-2'>
            <div className='relative flex-1'>
              <Input
                id='own-company-name'
                placeholder='Enter your company name'
                value={company.name}
                onChange={(e) => onChange('name', e.target.value)}
                className='pr-10'
              />
              {hasSaved && (
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
              )}

              {hasSaved && showDropdown && (
                <Card className='absolute top-10 right-0 z-10 w-64'>
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
            </div>
            <Button
              variant='outline'
              size='icon'
              onClick={() => company.name.trim() && onFetchInfo(company.name)}
              disabled={isFetching || !company.name.trim()}
              title='Fetch company info'>
              {isFetching ? (
                <RefreshCw className='h-4 w-4 animate-spin' />
              ) : (
                <Search className='h-4 w-4' />
              )}
            </Button>
            <Button
              variant='default'
              size='icon'
              onClick={() => onSave?.(company)}
              disabled={!company.name.trim()}
              title='Save your company details'>
              <Save className='h-4 w-4' />
            </Button>
          </div>
          {status && (
            <p
              className={`text-xs ${
                status.success ? 'text-green-600' : 'text-orange-600'
              }`}>
              {status.message}
            </p>
          )}
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
      </div>
      <CardContent className='p-0' />
    </Card>
  );
}
