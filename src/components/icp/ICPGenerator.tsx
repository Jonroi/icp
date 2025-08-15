import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Wand2, Save, Loader2 } from 'lucide-react';
import { OwnCompanyForm } from './OwnCompanyForm';
import type { OwnCompany } from '@/services/project';

interface ICPGeneratorProps {
  ownCompany?: OwnCompany;
  isLoading: boolean;
  error: string | null;
  activeCompanyId?: string;
  companies?: any[];
  activeCompany?: any;
  onOwnCompanyChange?: (field: keyof OwnCompany, value: string) => void;
  onSaveOwnCompany?: (company: OwnCompany) => Promise<void>;
  onResetOwnCompany?: () => Promise<void>;
  onGenerateICPs: () => Promise<void>;
  onCompanyDeleted?: (companyId: string) => void;
  onCompanyIdChange?: (id: string) => void;
}

export function ICPGenerator({
  ownCompany,
  isLoading,
  error,
  activeCompanyId,
  companies = [],
  activeCompany,
  onOwnCompanyChange,
  onSaveOwnCompany,
  onResetOwnCompany,
  onGenerateICPs,
  onCompanyDeleted,
  onCompanyIdChange,
}: ICPGeneratorProps) {
  return (
    <Card className='mt-4 max-w-4xl mx-auto'>
      <CardHeader className='flex-col space-y-4 sm:flex-row sm:items-start sm:justify-between'>
        <div>
          <CardTitle className='flex items-center gap-2'>
            <Wand2 className='h-5 w-5 text-primary' />
            ICP Generator
          </CardTitle>
          <CardDescription>
            Input your company information to generate Ideal Customer Personas.
          </CardDescription>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            size='sm'
            className='flex items-center gap-2'
            title='Save current company data to database'
            onClick={async () => {
              try {
                if (onSaveOwnCompany && ownCompany) {
                  await onSaveOwnCompany(ownCompany);
                }
              } catch (error) {
                console.error('Error saving company data:', error);
              }
            }}
            disabled={isLoading}>
            <Save className='h-4 w-4' />
            Save
          </Button>
          <Button
            size='sm'
            className='flex items-center gap-2'
            title='Automatically fill company data using AI (coming soon)'
            disabled>
            Fill with AI (coming soon)
          </Button>
        </div>
      </CardHeader>
      <CardContent className='space-y-6'>
        <div className='space-y-2'>
          <OwnCompanyForm
            company={ownCompany || { name: '', website: '', social: '' }}
            companies={companies}
            activeCompany={activeCompany}
            onChange={(field, value) => onOwnCompanyChange?.(field, value)}
            onSaveCompany={onSaveOwnCompany}
            onReset={async () => {
              if (onResetOwnCompany) {
                await onResetOwnCompany();
              }
            }}
            onCompanyDeleted={onCompanyDeleted}
            activeCompanyId={activeCompanyId}
            onCompanyIdChange={onCompanyIdChange}
          />
        </div>

        {/* Additional context section removed */}

        <div className='flex flex-wrap gap-2'>
          <Button
            onClick={onGenerateICPs}
            disabled={isLoading || !ownCompany?.name?.trim()}
            className='flex items-center gap-2'>
            {isLoading ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <Sparkles className='h-4 w-4' />
            )}
            Generate ICPs
          </Button>
        </div>

        {error && (
          <div className='rounded-md bg-destructive/15 p-3 text-sm text-destructive'>
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
