import { useState, useEffect } from 'react';
import { Button } from './button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';
import {
  getTestCompanyNames,
  getTestCompanyById,
} from '@/services/test-companies-service';
import type { OwnCompany } from '@/services/project-service';
import { Building2, Loader2 } from 'lucide-react';

interface CompanySelectorProps {
  onCompanySelect: (company: OwnCompany) => void;
  currentCompanyName?: string;
  className?: string;
}

export function CompanySelector({
  onCompanySelect,
  currentCompanyName,
  className = '',
}: CompanySelectorProps) {
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);

  // Load available companies on component mount
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        setIsLoadingCompanies(true);
        const companyNames = await getTestCompanyNames();
        setCompanies(companyNames);

        // Set current company if it matches one of the test companies
        if (currentCompanyName) {
          const currentCompany = companyNames.find(
            (c) => c.name === currentCompanyName,
          );
          if (currentCompany) {
            setSelectedCompanyId(currentCompany.id);
          }
        }
      } catch (error) {
        console.error('Error loading companies:', error);
      } finally {
        setIsLoadingCompanies(false);
      }
    };

    loadCompanies();
  }, [currentCompanyName]);

  const handleCompanySelect = async (companyId: string) => {
    if (!companyId) return;

    try {
      setIsLoading(true);
      setSelectedCompanyId(companyId);

      const company = await getTestCompanyById(companyId);
      if (company) {
        onCompanySelect(company);
      }
    } catch (error) {
      console.error('Error loading company data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingCompanies) {
    return (
      <div
        className={`flex items-center gap-2 text-sm text-muted-foreground ${className}`}>
        <Loader2 className='h-4 w-4 animate-spin' />
        Loading companies...
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className={`text-sm text-muted-foreground ${className}`}>
        No test companies available
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Building2 className='h-4 w-4 text-muted-foreground' />
      <span className='text-sm text-muted-foreground'>Test Company:</span>
      <Select
        value={selectedCompanyId}
        onValueChange={handleCompanySelect}
        disabled={isLoading}>
        <SelectTrigger className='w-64'>
          <SelectValue placeholder='Select a test company' />
        </SelectTrigger>
        <SelectContent>
          {companies.map((company) => (
            <SelectItem key={company.id} value={company.id}>
              {company.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isLoading && <Loader2 className='h-4 w-4 animate-spin' />}
    </div>
  );
}
