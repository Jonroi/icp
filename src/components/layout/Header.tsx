import { CompanyToolbar } from '@/components/layout/CompanyToolbar';
import type { OwnCompany } from '@/services/project';

interface HeaderProps {
  activeCompanyId?: string;
  companies: OwnCompany[];
  onCompanyIdChange?: (id: string) => void;
  isLoading?: boolean;
}

export function Header({
  activeCompanyId,
  companies,
  onCompanyIdChange,
  isLoading,
}: HeaderProps) {
  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div className='space-y-2'>
          <h1 className='text-3xl font-bold tracking-tight lg:text-4xl'>
            ICP &amp; Campaign Insights
          </h1>
          <p className='text-muted-foreground text-sm lg:text-base'>
            Generate customer profiles and design winning campaigns with AI.
          </p>
        </div>

        <div className='flex-shrink-0 ml-6'>
          <CompanyToolbar
            activeCompanyId={activeCompanyId}
            companies={companies}
            onCompanyIdChange={onCompanyIdChange}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
