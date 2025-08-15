import { useState, useEffect, useCallback } from 'react';
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
import type { OwnCompany } from '@/services/project-service';
import { Loader2, Plus, Save, Trash2 } from 'lucide-react';

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
  onCompanyDeleted?: () => void;
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
}: CompanySelectorProps) {
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [selectedId, setSelectedId] = useState<string>('');

  // Load available companies on component mount
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        setIsLoadingCompanies(true);

        const resp = await fetch('/api/company', { cache: 'no-store' });
        if (resp.ok) {
          const json = await resp.json();
          const list = (json.list || []) as Array<{ id: string; name: string }>;
          setCompanies(list);
          // Do not auto-select active company on initial load
        }
      } catch (error) {
        console.error('Error loading companies:', error);
      } finally {
        setIsLoadingCompanies(false);
      }
    };

    loadCompanies();
  }, [onCompanyIdSelected, selectedCompanyId]);

  useEffect(() => {
    if (selectedCompanyId) setSelectedId(selectedCompanyId);
  }, [selectedCompanyId]);

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

        // Ask server to select and mirror fields, then fetch current form data to populate UI
        await fetch(`/api/company?id=${encodeURIComponent(companyId)}`, {
          cache: 'no-store',
        });
        if (onCompanyIdSelected) onCompanyIdSelected(companyId);
        setSelectedId(companyId);
        const stateResp = await fetch('/api/company-data');
        if (stateResp.ok) {
          const data = await stateResp.json();
          onCompanySelect(data?.data?.currentData || ({} as OwnCompany));
        }
        // Force refresh after mirror to ensure all fields show immediately
        try {
          const refresh = await fetch('/api/company-data', {
            cache: 'no-store',
          });
          if (refresh.ok) {
            const d = await refresh.json();
            onCompanySelect(d?.data?.currentData || ({} as OwnCompany));
          }
        } catch (_) {}
      } catch (error) {
        console.error('Error loading company data:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [allowCreate, onCompanyIdSelected, onCompanySelect],
  );

  const handleSaveNewCompany = async () => {
    if (!newCompanyName.trim()) return;

    try {
      // Create company in DB
      const resp = await fetch('/api/company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCompanyName.trim() }),
      });
      if (!resp.ok) throw new Error('Failed to create company');
      const created = await resp.json();
      // Refresh list
      const listResp = await fetch('/api/company', { cache: 'no-store' });
      if (listResp.ok) {
        const json = await listResp.json();
        setCompanies((json.list || []) as Array<{ id: string; name: string }>);
      }
      // Since create sets active, pull current form data
      const stateResp = await fetch('/api/company-data');
      if (stateResp.ok) {
        const data = await stateResp.json();
        onCompanySelect(data?.data?.currentData || ({} as OwnCompany));
      }
      try {
        const id = (created?.company?.id ||
          created?.company?.id?.toString?.()) as string | undefined;
        if (id) {
          onCompanyIdSelected?.(id);
          setSelectedId(id);
        }
      } catch (_) {}
      // Reset form
      setNewCompanyName('');
      setIsCreatingNew(false);
    } catch (error) {
      console.error('Error saving new company:', error);
    }
  };

  const handleDeleteCompany = async () => {
    if (
      !selectedId ||
      !confirm(
        'Are you sure you want to delete this company? This will also delete all associated ICP profiles and cannot be undone.',
      )
    ) {
      return;
    }

    try {
      setIsDeleting(true);

      // Delete company and all associated data
      const resp = await fetch(
        `/api/company?id=${encodeURIComponent(selectedId)}`,
        {
          method: 'DELETE',
        },
      );

      if (!resp.ok) {
        throw new Error('Failed to delete company');
      }

      // Refresh companies list
      const listResp = await fetch('/api/company', { cache: 'no-store' });
      if (listResp.ok) {
        const json = await listResp.json();
        setCompanies((json.list || []) as Array<{ id: string; name: string }>);
      }

      // Clear selection
      setSelectedId('');
      onCompanyIdSelected?.('');
      onCompanySelect({} as OwnCompany);

      // Notify parent component
      onCompanyDeleted?.();
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
                  <SelectItem key={company.id} value={company.id || ''}>
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

          {(isLoading || isLoadingCompanies) && (
            <Loader2 className='h-4 w-4 animate-spin text-muted-foreground' />
          )}
        </div>
      )}

      <p className='text-xs text-muted-foreground'>
        Select an existing company or create a new one to get started.
      </p>
    </div>
  );
}
