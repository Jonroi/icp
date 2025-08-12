import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LocationSelector } from '@/components/ui/location-selector';
import {
  ExternalLink,
  RefreshCw,
  Save,
  Search,
  Trash2,
  ChevronDown,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { Competitor as ProjectCompetitor } from '@/services/project-service';
export type Competitor = ProjectCompetitor;

interface CompetitorFormProps {
  competitor: Competitor;
  index: number;
  savedCompetitors: string[];
  showCompetitorDropdown: { [key: number]: boolean };
  isFetchingCompanyInfo: number | null;
  isFetchingData: number | null;
  companyInfoStatus: { [key: number]: { success: boolean; message: string } };
  reviewsStatus: { [key: number]: { success: boolean; message: string } };
  onCompetitorChange: (
    index: number,
    field: keyof Competitor,
    value: string,
  ) => void;
  onRemoveCompetitor: (index: number) => void;
  onFetchCompanyInfo: (index: number, companyName: string) => void;
  onFetchCustomerReviews: (index: number, companyName: string) => void;
  onSaveCompetitor: (competitor: Competitor) => void;
  onLoadSavedCompetitor: (competitorName: string, index: number) => void;
  onToggleCompetitorDropdown: (index: number) => void;
}

export function CompetitorForm({
  competitor,
  index,
  savedCompetitors,
  showCompetitorDropdown,
  isFetchingCompanyInfo,
  isFetchingData,
  companyInfoStatus,
  reviewsStatus,
  onCompetitorChange,
  onRemoveCompetitor,
  onFetchCompanyInfo,
  onFetchCustomerReviews,
  onSaveCompetitor,
  onLoadSavedCompetitor,
  onToggleCompetitorDropdown,
}: CompetitorFormProps) {
  return (
    <Card className='p-4 space-y-3 bg-muted/30 relative'>
      <div className='flex items-center justify-between mb-3'>
        <h3 className='font-medium'>Competitor {index + 1}</h3>
        <Button
          variant='ghost'
          size='icon'
          className='h-8 w-8'
          onClick={() => onRemoveCompetitor(index)}
          title='Remove competitor'>
          <Trash2 className='h-4 w-4' />
        </Button>
      </div>
      <div className='space-y-3'>
        <div className='flex gap-2'>
          <div className='flex-1 space-y-2'>
            <Label htmlFor={`competitor-name-${index}`}>
              Competitor Name{' '}
              <span className='text-red-600' aria-hidden='true'>
                *
              </span>
            </Label>
            <div className='relative'>
              <Input
                id={`competitor-name-${index}`}
                placeholder='Enter competitor name (required)'
                aria-required='true'
                required
                value={competitor.name}
                onChange={(e) =>
                  onCompetitorChange(index, 'name', e.target.value)
                }
                className='pr-10'
              />
              {savedCompetitors.length > 0 && (
                <>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7'
                    onClick={() => onToggleCompetitorDropdown(index)}
                    title='Select saved competitor'
                    aria-haspopup='listbox'
                    aria-expanded={!!showCompetitorDropdown[index]}>
                    <ChevronDown className='h-4 w-4 opacity-70' />
                  </Button>

                  {showCompetitorDropdown[index] && (
                    <Card className='absolute top-10 right-0 z-10 w-64 max-h-48 overflow-y-auto'>
                      <CardContent className='p-2'>
                        <div className='space-y-1'>
                          {savedCompetitors.map((name) => (
                            <Button
                              key={name}
                              variant='ghost'
                              size='sm'
                              className='w-full justify-start text-left'
                              onClick={() =>
                                onLoadSavedCompetitor(name, index)
                              }>
                              {name}
                            </Button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>
          </div>

          <div className='w-48 space-y-2'>
            <Label htmlFor={`competitor-location-${index}`}>Location </Label>
            <LocationSelector
              value={competitor.location || 'Global'}
              onValueChange={(value) =>
                onCompetitorChange(index, 'location', value)
              }
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
                  if (competitor.name.trim()) {
                    onFetchCompanyInfo(index, competitor.name);
                  }
                }}
                disabled={
                  isFetchingCompanyInfo === index || !competitor.name.trim()
                }
                title='Fetch company info'>
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
                    alert('Competitor name is required to save!');
                    return;
                  }
                  onSaveCompetitor(competitor);
                }}
                title='Save competitor details'>
                <Save className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </div>

        <div className='space-y-2'>
          <p className='text-xs text-muted-foreground'>
            Only the competitor name is required. All other fields are optional.
          </p>
          {competitor.name && !competitor.website && (
            <p className='text-xs text-muted-foreground'>
              💡 Enter the competitor name and use Search to auto-fill optional
              details
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
          <Label htmlFor={`competitor-website-${index}`}>Website URL</Label>
          <div className='flex gap-2'>
            <Input
              id={`competitor-website-${index}`}
              placeholder='https://competitor.com'
              value={competitor.website}
              onChange={(e) =>
                onCompetitorChange(index, 'website', e.target.value)
              }
            />
            {competitor.website && (
              <Button
                variant='outline'
                size='icon'
                onClick={() => window.open(competitor.website, '_blank')}
                title='Open website in a new tab'>
                <ExternalLink className='h-4 w-4' />
              </Button>
            )}
          </div>
        </div>
        <div className='space-y-2'>
          <Label htmlFor={`competitor-social-${index}`}>LinkedIn</Label>
          <div className='flex gap-2'>
            <Input
              id={`competitor-social-${index}`}
              placeholder='https://linkedin.com/company/competitor'
              value={competitor.social}
              onChange={(e) =>
                onCompetitorChange(index, 'social', e.target.value)
              }
            />
            {competitor.social && (
              <Button
                variant='outline'
                size='icon'
                onClick={() => window.open(competitor.social, '_blank')}
                title='Open LinkedIn in a new tab'>
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
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                if (competitor.name.trim()) {
                  onFetchCustomerReviews(index, competitor.name);
                }
              }}
              disabled={isFetchingData === index || !competitor.name.trim()}
              title='Fetch customer data'>
              {isFetchingData === index ? (
                <RefreshCw className='h-4 w-4 animate-spin mr-2' />
              ) : (
                <Search className='h-4 w-4 mr-2' />
              )}
              {isFetchingData === index ? 'Fetching...' : 'Fetch Data'}
            </Button>
          </div>
        </div>
        <Textarea
          id={`competitor-reviews-${index}`}
          placeholder='Copy and paste reviews here, Click "Fetch Data" to collect customer data automatically or ask AI Assistant to generate reviews'
          value={competitor.reviews || ''}
          readOnly
          rows={6}
          className='max-h-48 overflow-y-auto'
        />
        {reviewsStatus[index] && (
          <div
            className={`text-xs ${
              reviewsStatus[index].success ? 'text-green-600' : 'text-red-600'
            }`}>
            {reviewsStatus[index].message}
          </div>
        )}
      </div>
    </Card>
  );
}
