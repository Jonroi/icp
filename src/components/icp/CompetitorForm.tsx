import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  ExternalLink,
  RefreshCw,
  Save,
  Search,
  Trash2,
  ChevronDown,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export interface Competitor {
  name: string;
  website: string;
  social: string;
  reddit?: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  reviews?: string;
}

interface CompetitorFormProps {
  competitor: Competitor;
  index: number;
  savedCompetitors: string[];
  showCompetitorDropdown: { [key: number]: boolean };
  isFetchingCompanyInfo: number | null;
  isFetchingReviews: number | null;
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
  isFetchingReviews,
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
        <div className='space-y-2'>
          <Label htmlFor={`competitor-name-${index}`}>Name of Competitor</Label>
          <div className='flex gap-2 relative'>
            <Input
              id={`competitor-name-${index}`}
              placeholder='Type a company name or select a saved one'
              value={competitor.name}
              onChange={(e) =>
                onCompetitorChange(index, 'name', e.target.value)
              }
            />
            {savedCompetitors.length > 0 && (
              <div className='relative'>
                <Button
                  variant='outline'
                  size='icon'
                  onClick={() => onToggleCompetitorDropdown(index)}
                  title='Select saved competitor'>
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
                            onClick={() => onLoadSavedCompetitor(name, index)}>
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
          {competitor.name && !competitor.website && (
            <p className='text-xs text-muted-foreground'>
              💡 Enter a company name and click the search button
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
          <Button
            variant='outline'
            size='sm'
            onClick={() => {
              if (competitor.name.trim()) {
                onFetchCustomerReviews(index, competitor.name);
              }
            }}
            disabled={isFetchingReviews === index || !competitor.name.trim()}
            title='Fetch customer reviews'>
            {isFetchingReviews === index ? (
              <RefreshCw className='h-4 w-4 animate-spin mr-2' />
            ) : (
              <Search className='h-4 w-4 mr-2' />
            )}
            {isFetchingReviews === index ? 'Fetching...' : 'Fetch Reviews'}
          </Button>
        </div>
        <Textarea
          id={`competitor-reviews-${index}`}
          placeholder='Click "Fetch Reviews" to collect customer reviews automatically...'
          value={competitor.reviews || ''}
          onChange={(e) => onCompetitorChange(index, 'reviews', e.target.value)}
          rows={3}
        />
        {reviewsStatus[index] && (
          <div
            className={`text-xs ${
              reviewsStatus[index].success ? 'text-green-600' : 'text-red-600'
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
  );
}
