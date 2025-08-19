import { CompanySelector } from '@/components/ui/company-selector';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import type { OwnCompany } from '@/services/project';

interface CompanyToolbarProps {
  activeCompanyId?: string;
  companies: OwnCompany[];
  onCompanyIdChange?: (id: string) => void;
  isLoading?: boolean;
}

export function CompanyToolbar({
  activeCompanyId,
  companies,
  onCompanyIdChange,
  isLoading,
}: CompanyToolbarProps) {
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
    <div className='flex items-center gap-2 p-2 bg-muted/10 rounded text-sm'>
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
        className='min-w-[180px] text-sm'
        hideLoadingSpinner={isLoading}
        hideLabel={true}
      />

      {/* Counters */}
      {activeCompanyId && (
        <>
          <div className='px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs font-medium'>
            ICPs: {icpByCompanyQuery.data?.length ?? 0}
          </div>
          <div className='px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs font-medium'>
            Campaigns: {campaignsByCompanyQuery.data?.length ?? 0}
          </div>
        </>
      )}

      <Button
        variant='destructive'
        size='sm'
        onClick={handleDeleteActiveCompany}
        disabled={!activeCompanyId || deleteCompanyMutation.isPending}
        title='Delete active company'
        className='text-xs h-7 px-2 ml-1'>
        <Trash2 className='h-3 w-3' />
        {deleteCompanyMutation.isPending ? 'Deleting...' : 'Delete'}
      </Button>
    </div>
  );
}
