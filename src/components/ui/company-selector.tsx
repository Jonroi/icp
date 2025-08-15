import { useState, useEffect, useCallback, useMemo } from 'react';
import { Input } from './input';
import { Label } from './label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';
import { Button } from './button';
import type { OwnCompany } from '@/services/project';
import { Loader2, Plus, Save, Trash2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface CompanySelectorProps {
  value: string;
  onChange: (field: keyof OwnCompany, value: string) => void;
  onCompanySelect: (company: OwnCompany) => void;
  onSaveCompany?: (company: OwnCompany) => Promise<void>;
  className?: string;
  onCompanyIdSelected?: (id: string) => void;
  selectedCompanyId?: string;
  allowCreate?: boolean;
  allowDelete?: boolean;
  onCompanyDeleted?: (companyId: string) => void;
  hideLoadingSpinner?: boolean;
}

export function CompanySelector({
  value,
  onChange,
  onCompanySelect,
  onSaveCompany,
  onCompanyIdSelected,
  selectedCompanyId,
  allowCreate = true,
  allowDelete = true,
  className = '',
  onCompanyDeleted,
  hideLoadingSpinner = false,
}: CompanySelectorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [selectedId, setSelectedId] = useState<string>('');

  // tRPC queries and mutations
  const companyListQuery = trpc.company.list.useQuery();
  const createCompanyMutation = trpc.company.create.useMutation();
  const deleteCompanyMutation = trpc.company.delete.useMutation();
  const setActiveCompanyMutation = trpc.company.setActive.useMutation();

  const companies = useMemo(
    () => companyListQuery.data?.list || [],
    [companyListQuery.data?.list],
  );
  const isLoadingCompanies = companyListQuery.isLoading;

  // Only set selected company if user explicitly selects one
  // Don't auto-select on page load
  useEffect(() => {
    if (selectedCompanyId && selectedCompanyId !== selectedId) {
      setSelectedId(selectedCompanyId);
    }
  }, [selectedCompanyId, selectedId]);

  const handleCompanySelect = useCallback(
    async (companyId: string) => {
      if (!companyId) return;

      if (companyId === 'new') {
        if (!allowCreate) return;
        setIsCreatingNew(true);
        return;
      }

      try {
        setIsLoading(true);

        // Set as active company
        await setActiveCompanyMutation.mutateAsync({ id: companyId });
        if (onCompanyIdSelected) onCompanyIdSelected(companyId);
        setSelectedId(companyId);

        // Find the selected company data and populate form
        const selectedCompany = companies.find(
          (company) => company.id.toString() === companyId,
        );
        if (selectedCompany && onCompanySelect) {
          onCompanySelect(selectedCompany);
        }
      } catch (error) {
        console.error('Error loading company data:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [
      allowCreate,
      onCompanyIdSelected,
      setActiveCompanyMutation,
      companies,
      onCompanySelect,
    ],
  );

  const handleSaveNewCompany = async () => {
    if (!newCompanyName.trim()) return;

    try {
      setIsCreatingNew(false);

      // Create company using tRPC
      const newCompany = await createCompanyMutation.mutateAsync({
        name: newCompanyName.trim(),
      });

      // Refresh company list
      await companyListQuery.refetch();

      // Select the new company
      if (onCompanyIdSelected) onCompanyIdSelected(newCompany.id.toString());
      setSelectedId(newCompany.id.toString());
      onCompanySelect(newCompany);

      setNewCompanyName('');
    } catch (error) {
      console.error('Error creating company:', error);
      alert('Failed to create company. Please try again.');
    }
  };

  const handleDeleteCompany = async () => {
    if (!selectedId || !allowDelete) return;

    if (
      !confirm(
        'Are you sure you want to delete this company? This action cannot be undone.',
      )
    ) {
      return;
    }

    try {
      setIsDeleting(true);

      // Delete company using tRPC
      await deleteCompanyMutation.mutateAsync({ id: selectedId });

      // Notify parent component
      onCompanyDeleted?.(selectedId);

      // Refresh company list
      await companyListQuery.refetch();

      // Clear selection
      setSelectedId('');
      if (onCompanyIdSelected) onCompanyIdSelected('');
    } catch (error) {
      console.error('Error deleting company:', error);
      alert('Failed to delete company. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor='company-selector'>
        Company{' '}
        <span className='text-red-600' aria-hidden='true'>
          *
        </span>
      </Label>

      {allowCreate && isCreatingNew ? (
        <div className='flex gap-2'>
          <Input
            placeholder='Enter company name'
            value={newCompanyName}
            onChange={(e) => setNewCompanyName(e.target.value)}
            className='flex-1'
          />
          <Button
            onClick={handleSaveNewCompany}
            disabled={!newCompanyName.trim()}
            size='sm'
            className='flex items-center gap-2'>
            <Save className='h-4 w-4' />
            Save
          </Button>
          <Button
            onClick={() => setIsCreatingNew(false)}
            variant='outline'
            size='sm'>
            Cancel
          </Button>
        </div>
      ) : (
        <div className='flex gap-2'>
          <div className='flex-1'>
            <Select
              value={selectedId}
              onValueChange={handleCompanySelect}
              disabled={isLoading || isLoadingCompanies}>
              <SelectTrigger className='w-full'>
                <SelectValue
                  placeholder={
                    allowCreate
                      ? 'Select or create a company'
                      : 'Select a company'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {allowCreate && (
                  <SelectItem value='new' className='flex items-center gap-2'>
                    <Plus className='h-4 w-4' />
                    Create New Company
                  </SelectItem>
                )}

                <div className='px-2 py-1.5 text-sm font-semibold text-muted-foreground'>
                  Companies
                </div>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id.toString()}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedId && allowDelete && (
            <Button
              onClick={handleDeleteCompany}
              disabled={isDeleting || isLoading || isLoadingCompanies}
              variant='destructive'
              size='sm'
              className='flex items-center gap-2'>
              <Trash2 className='h-4 w-4' />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          )}

          {(isLoading || isLoadingCompanies) && !hideLoadingSpinner && (
            <Loader2 className='h-4 w-4 animate-spin text-muted-foreground' />
          )}
        </div>
      )}
    </div>
  );
}
