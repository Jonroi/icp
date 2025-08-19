import { CompanySelector } from '@/components/ui/company-selector';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
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

  // tRPC: counts per active company
  const icpByCompanyQuery = trpc.icp.getByCompany.useQuery(
    { companyId: activeCompanyId || '' },
    { enabled: !!activeCompanyId },
  );
  const campaignsByCompanyQuery = trpc.campaign.getByCompany.useQuery(
    { companyId: activeCompanyId || '' },
    { enabled: !!activeCompanyId },
  );

  const companyListQuery = trpc.company.list.useQuery();
  const deleteCompanyMutation = trpc.company.delete.useMutation();

  const handleDeleteActiveCompany = async () => {
    if (!activeCompanyId) return;
    const ok = confirm(
      `Are you sure you want to delete "${
        activeCompany?.name || 'this company'
      }"? This cannot be undone.`,
    );
    if (!ok) return;
    try {
      await deleteCompanyMutation.mutateAsync({ id: activeCompanyId });
      await companyListQuery.refetch();
      onCompanyIdChange?.('');
    } catch (e) {
      console.error('Failed to delete company:', e);
      alert('Failed to delete company. Please try again.');
    }
  };

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
      <div className='flex items-end justify-between p-4 bg-muted/30 rounded-lg border'>
        <div className='flex items-end gap-4'>
          <CompanySelector
            value={activeCompany?.name || ''}
            onChange={() => {}}
            onCompanySelect={(company: OwnCompany) => {
              // handled by parent
            }}
            onCompanyIdSelected={(id) => {
              onCompanyIdChange?.(id);
            }}
            selectedCompanyId={activeCompanyId}
            allowCreate={true}
            allowDelete={false}
            className='min-w-[300px]'
            hideLoadingSpinner={isLoading}
          />
          {/* Counters */}
          {activeCompanyId && (
            <div className='flex items-center gap-3'>
              <div className='px-4 py-2 bg-secondary text-secondary-foreground rounded-md border text-sm font-medium min-w-[120px] text-center'>
                ICPs: {icpByCompanyQuery.data?.length ?? 0}
              </div>
              <div className='px-4 py-2 bg-secondary text-secondary-foreground rounded-md border text-sm font-medium min-w-[120px] text-center'>
                Campaigns: {campaignsByCompanyQuery.data?.length ?? 0}
              </div>
            </div>
          )}
        </div>
        <Button
          variant='destructive'
          size='sm'
          onClick={handleDeleteActiveCompany}
          disabled={!activeCompanyId || deleteCompanyMutation.isPending}
          title='Delete active company'>
          <Trash2 className='h-4 w-4' />
          {deleteCompanyMutation.isPending ? 'Deleting...' : 'Delete'}
        </Button>
      </div>
    </div>
  );
}
