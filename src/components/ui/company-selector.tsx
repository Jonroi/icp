import { useState, useEffect } from 'react';
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
import { Loader2, Plus, Save } from 'lucide-react';

interface CompanySelectorProps {
  value: string;
  onChange: (field: keyof OwnCompany, value: string) => void;
  onCompanySelect: (company: OwnCompany) => void;
  onSaveCompany?: (company: OwnCompany) => Promise<void>;
  className?: string;
}

export function CompanySelector({
  value,
  onChange,
  onCompanySelect,
  onSaveCompany,
  className = '',
}: CompanySelectorProps) {
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');

  // Load available companies on component mount
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        setIsLoadingCompanies(true);

        // Load companies from database
        const resp = await fetch('/api/company', { cache: 'no-store' });
        if (resp.ok) {
          const json = await resp.json();
          const list = (json.list || []) as Array<{ id: string; name: string }>;
          setCompanies(list);
        }
      } catch (error) {
        console.error('Error loading companies:', error);
      } finally {
        setIsLoadingCompanies(false);
      }
    };

    loadCompanies();
  }, []);

  const handleCompanySelect = async (companyId: string) => {
    if (!companyId) return;

    if (companyId === 'new') {
      setIsCreatingNew(true);
      return;
    }

    try {
      setIsLoading(true);

      // Ask server to select and mirror fields, then fetch current form data to populate UI
      await fetch(`/api/company?id=${encodeURIComponent(companyId)}`, {
        cache: 'no-store',
      });
      const stateResp = await fetch('/api/company-data');
      if (stateResp.ok) {
        const data = await stateResp.json();
        onCompanySelect(data?.data?.currentData || ({} as OwnCompany));
      }
      // Force refresh after mirror to ensure Additional Context and fields show immediately
      try {
        const refresh = await fetch('/api/company-data', { cache: 'no-store' });
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
  };

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
      // Reset form
      setNewCompanyName('');
      setIsCreatingNew(false);
    } catch (error) {
      console.error('Error saving new company:', error);
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

      {isCreatingNew ? (
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
              onValueChange={handleCompanySelect}
              disabled={isLoading || isLoadingCompanies}>
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Select or create a company' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='new' className='flex items-center gap-2'>
                  <Plus className='h-4 w-4' />
                  Create New Company
                </SelectItem>

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
