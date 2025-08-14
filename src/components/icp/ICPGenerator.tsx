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
import { Sparkles, Wand2, Save } from 'lucide-react';
import { OwnCompanyForm } from './OwnCompanyForm';
import type { OwnCompany } from '@/services/project-service';
// Agent button removed during reset

interface ICPGeneratorProps {
  ownCompany?: OwnCompany;
  isLoading: boolean;
  error: string | null;
  onOwnCompanyChange?: (field: keyof OwnCompany, value: string) => void;
  onSaveOwnCompany?: (company: OwnCompany) => Promise<void>;
  onResetOwnCompany?: () => Promise<void>;
  onGenerateICPs: () => Promise<void>;
}

export function ICPGenerator({
  ownCompany,
  isLoading,
  error,
  onOwnCompanyChange,
  onSaveOwnCompany,
  onResetOwnCompany,
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
            Input your company information to generate Ideal Customer Personas.
          </CardDescription>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            size='sm'
            className='flex items-center gap-2'
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
          <Button size='sm' className='flex items-center gap-2' disabled>
            Fill with AI (coming soon)
          </Button>
        </div>
      </CardHeader>
      <CardContent className='space-y-6'>
        <div className='space-y-2'>
          <OwnCompanyForm
            company={ownCompany || { name: '', website: '', social: '' }}
            onChange={(field, value) => onOwnCompanyChange?.(field, value)}
            onSaveCompany={onSaveOwnCompany}
            onReset={async () => {
              if (onResetOwnCompany) {
                await onResetOwnCompany();
              }
            }}
          />
        </div>

        {/* Additional Context removed */}

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
