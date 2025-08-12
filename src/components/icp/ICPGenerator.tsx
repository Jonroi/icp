import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CardToolbar } from '@/components/ui/card-toolbar';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Sparkles, Wand2 } from 'lucide-react';
import { CompetitorForm } from './CompetitorForm';
import type { Competitor } from './CompetitorForm';
import { OwnCompanyForm, type OwnCompany } from './OwnCompanyForm';

interface ICPGeneratorProps {
  ownCompany?: OwnCompany;
  ownCompanyStatus?: { success: boolean; message: string } | null;
  isFetchingOwnCompany?: boolean;
  competitors: Competitor[];
  additionalContext: string;
  savedCompetitors: string[];
  showCompetitorDropdown: { [key: number]: boolean };
  isFetchingCompanyInfo: number | null;
  isFetchingData: number | null;
  companyInfoStatus: { [key: number]: { success: boolean; message: string } };
  reviewsStatus: { [key: number]: { success: boolean; message: string } };
  isLoading: boolean;
  error: string | null;
  onCompetitorChange: (
    index: number,
    field: keyof Competitor,
    value: string,
  ) => void;
  onAddCompetitor: () => void;
  onRemoveCompetitor: (index: number) => void;
  onAdditionalContextChange: (context: string) => void;
  onOwnCompanyChange?: (field: keyof OwnCompany, value: string) => void;
  onSaveOwnCompany?: (company: OwnCompany) => void;
  onFetchOwnCompanyInfo?: (companyName: string) => void;
  // Own company dropdown
  hasSavedOwnCompany?: () => boolean;
  showOwnCompanyDropdown?: boolean;
  onToggleOwnCompanyDropdown?: () => void;
  onLoadSavedOwnCompany?: () => void;
  onFetchCompanyInfo: (index: number, companyName: string) => void;
  onFetchCustomerReviews: (index: number, companyName: string) => void;
  onSaveCompetitor: (competitor: Competitor) => void;
  onLoadSavedCompetitor: (competitorName: string, index: number) => void;
  onToggleCompetitorDropdown: (index: number) => void;
  onGenerateICPs: () => Promise<void>;
}

export function ICPGenerator({
  ownCompany,
  ownCompanyStatus,
  isFetchingOwnCompany,
  competitors,
  additionalContext,
  savedCompetitors,
  showCompetitorDropdown,
  isFetchingCompanyInfo,
  isFetchingData,
  companyInfoStatus,
  reviewsStatus,
  isLoading,
  error,
  onCompetitorChange,
  onAddCompetitor,
  onRemoveCompetitor,
  onAdditionalContextChange,
  onOwnCompanyChange,
  onSaveOwnCompany,
  onFetchOwnCompanyInfo,
  hasSavedOwnCompany,
  showOwnCompanyDropdown,
  onToggleOwnCompanyDropdown,
  onLoadSavedOwnCompany,
  onFetchCompanyInfo,
  onFetchCustomerReviews,
  onSaveCompetitor,
  onLoadSavedCompetitor,
  onToggleCompetitorDropdown,
  onGenerateICPs,
}: ICPGeneratorProps) {
  return (
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
        <div className='space-y-2'>
          <OwnCompanyForm
            company={ownCompany || { name: '', website: '', social: '' }}
            isFetching={!!isFetchingOwnCompany}
            status={ownCompanyStatus || null}
            onChange={(field, value) => onOwnCompanyChange?.(field, value)}
            onFetchInfo={(name) => onFetchOwnCompanyInfo?.(name)}
            onSave={(company) => onSaveOwnCompany?.(company)}
            hasSaved={hasSavedOwnCompany?.()}
            showDropdown={!!showOwnCompanyDropdown}
            savedName={ownCompany?.name}
            onToggleDropdown={onToggleOwnCompanyDropdown}
            onLoadSaved={onLoadSavedOwnCompany}
          />
        </div>

        <div className='space-y-4'>
          <Label>Competitors (1-6)</Label>
          {competitors.map((competitor, index) => (
            <CompetitorForm
              key={index}
              competitor={competitor}
              index={index}
              savedCompetitors={savedCompetitors}
              showCompetitorDropdown={showCompetitorDropdown}
              isFetchingCompanyInfo={isFetchingCompanyInfo}
              isFetchingData={isFetchingData}
              companyInfoStatus={companyInfoStatus}
              reviewsStatus={reviewsStatus}
              onCompetitorChange={onCompetitorChange}
              onRemoveCompetitor={onRemoveCompetitor}
              onFetchCompanyInfo={onFetchCompanyInfo}
              onFetchCustomerReviews={onFetchCustomerReviews}
              onSaveCompetitor={onSaveCompetitor}
              onLoadSavedCompetitor={onLoadSavedCompetitor}
              onToggleCompetitorDropdown={onToggleCompetitorDropdown}
            />
          ))}
          {competitors.length < 6 && (
            <Button
              variant='outline'
              onClick={onAddCompetitor}
              className='w-full'>
              <Plus className='mr-2 h-4 w-4' /> Add Competitor
            </Button>
          )}
        </div>

        <div className='space-y-2'>
          <Label htmlFor='additional-context'>Additional Context</Label>
          <Textarea
            id='additional-context'
            placeholder='Any additional information about your target market...'
            rows={3}
            value={additionalContext}
            onChange={(e) => onAdditionalContextChange(e.target.value)}
          />
        </div>
        <div className='flex flex-wrap gap-2'>
          <Button
            className='flex-1'
            onClick={async () => {
              try {
                await onGenerateICPs();
              } catch (error) {
                console.error('Error generating ICPs:', error);
              }
            }}
            disabled={isLoading}>
            <Sparkles className='mr-2 h-4 w-4' />
            {isLoading ? 'Generating...' : 'Generate Ideal Customer Personas'}
          </Button>
        </div>
        {error && (
          <div className='p-4 bg-red-50 border border-red-200 rounded-md'>
            <p className='text-red-600 text-sm'>{error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
