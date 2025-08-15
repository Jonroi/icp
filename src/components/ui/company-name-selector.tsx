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
// Test companies are now unified with user companies via /api/company
import type { OwnCompany } from '@/services/project-service';
import { Building2, Loader2 } from 'lucide-react';

interface CompanyNameSelectorProps {
  value: string;
  onChange: (field: keyof OwnCompany, value: string) => void;
  onCompanySelect: (company: OwnCompany) => void;
  className?: string;
}

export function CompanyNameSelector({
  value,
  onChange,
  onCompanySelect,
  className = '',
}: CompanyNameSelectorProps) {
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Load available companies on component mount
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        setIsLoadingCompanies(true);
        const resp = await fetch('/api/company', { cache: 'no-store' });
        if (resp.ok) {
          const json = await resp.json();
          setCompanies(
            (json.list || []) as Array<{ id: string; name: string }>,
          );
        }
      } catch (error) {
        console.error('Error loading companies:', error);
      } finally {
        setIsLoadingCompanies(false);
      }
    };

    loadCompanies();
  }, []);

  const handleTestCompanySelect = async (companyId: string) => {
    if (!companyId || companyId === 'custom') return;

    try {
      setIsLoading(true);
      await fetch(`/api/company?id=${encodeURIComponent(companyId)}`, {
        cache: 'no-store',
      });
      const stateResp = await fetch('/api/company-data');
      if (stateResp.ok) {
        const data = await stateResp.json();
        onCompanySelect(data?.data?.currentData || ({} as OwnCompany));
      }
    } catch (error) {
      console.error('Error loading company data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor='own-company-name'>
        Company Name{' '}
        <span className='text-red-600' aria-hidden='true'>
          *
        </span>
      </Label>
      <div className='flex gap-2'>
        <div className='flex-1 relative'>
          <Input
            id='own-company-name'
            placeholder='Enter your company name (required)'
            aria-required='true'
            required
            value={value}
            onChange={(e) => onChange('name', e.target.value)}
          />
        </div>
        <div className='w-48'>
          <Select
            onValueChange={handleTestCompanySelect}
            disabled={isLoading || isLoadingCompanies}>
            <SelectTrigger className='w-full'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='custom'>Custom Company</SelectItem>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
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
      <p className='text-xs text-muted-foreground'>
        Enter your company name or select an existing company to load its data.
      </p>
    </div>
  );
}
