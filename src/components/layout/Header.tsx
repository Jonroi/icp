import { CompanySelector } from '@/components/ui/company-selector';
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
  const activeCompany = companies.find(
    (company) => company.id?.toString() === activeCompanyId,
  );

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
      </div>

      {/* Universal Company Selector */}
      <div className='flex items-center gap-4 p-4 bg-muted/30 rounded-lg border'>
        <div className='flex items-center gap-2'>
          <span className='text-sm font-medium text-muted-foreground'>
            Active Company:
          </span>
        </div>
        <CompanySelector
          value={activeCompany?.name || ''}
          onChange={() => {}}
          onCompanySelect={(company: OwnCompany) => {
            // This will be handled by the parent component
          }}
          onCompanyIdSelected={(id) => {
            onCompanyIdChange?.(id);
          }}
          selectedCompanyId={activeCompanyId}
          allowCreate={true}
          allowDelete={true}
          className='min-w-[300px]'
          hideLoadingSpinner={isLoading}
        />
        {activeCompany && (
          <div className='text-sm text-muted-foreground'>
            {activeCompany.industry && (
              <span className='mr-2'>• {activeCompany.industry}</span>
            )}
            {activeCompany.location && <span>• {activeCompany.location}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
