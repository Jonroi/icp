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
import { Sparkles, Wand2 } from 'lucide-react';
import { OwnCompanyForm } from './OwnCompanyForm';
import type { OwnCompany } from '@/services/project-service';
import { AgentButton } from '@/components/agents/agent-button';

interface ICPGeneratorProps {
  ownCompany?: OwnCompany;
  additionalContext: string;
  isLoading: boolean;
  error: string | null;
  onAdditionalContextChange: (context: string) => void;
  onOwnCompanyChange?: (field: keyof OwnCompany, value: string) => void;
  onSaveOwnCompany?: (company: OwnCompany) => void;
  onResetOwnCompany?: () => void;
  onGenerateICPs: () => Promise<void>;
}

export function ICPGenerator({
  ownCompany,
  additionalContext,
  isLoading,
  error,
  onAdditionalContextChange,
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
        <AgentButton
          agentId='company-profile-agent'
          size='sm'
          className='flex items-center gap-2'
          context={ownCompany}
          onFormUpdate={onOwnCompanyChange}>
          Fill with AI
        </AgentButton>
      </CardHeader>
      <CardContent className='space-y-6'>
        <div className='space-y-2'>
          <OwnCompanyForm
            company={ownCompany || { name: '', website: '', social: '' }}
            onChange={(field, value) => onOwnCompanyChange?.(field, value)}
            onSave={(company) => onSaveOwnCompany?.(company)}
            onReset={onResetOwnCompany}
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='additional-context'>Additional Context</Label>
          <Textarea
            id='additional-context'
            placeholder='Any additional information about your target market, ideal customers, or business goals...'
            rows={4}
            value={additionalContext}
            onChange={(e) => onAdditionalContextChange(e.target.value)}
          />
          <p className='text-xs text-muted-foreground'>
            Describe your ideal customers, target market characteristics, or any
            specific insights about your audience.
          </p>
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
