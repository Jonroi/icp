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
import {
  getTestCompanyNames,
  getTestCompanyById,
} from '@/services/test-companies-service';
import type { OwnCompany } from '@/services/project-service';
import { Building2, Loader2, Plus, Save } from 'lucide-react';

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
  const [savedCompanies, setSavedCompanies] = useState<OwnCompany[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');

  // Load available companies on component mount
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        setIsLoadingCompanies(true);

        // Load test companies
        const testCompanyNames = await getTestCompanyNames();
        setCompanies(testCompanyNames);

        // Load saved companies from localStorage
        const saved = localStorage.getItem('saved-companies');
        if (saved) {
          const parsed = JSON.parse(saved);
          setSavedCompanies(parsed);
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

    if (companyId === 'custom') {
      setIsCreatingNew(false);
      return;
    }

    try {
      setIsLoading(true);

      // Check if it's a saved company
      const savedCompany = savedCompanies.find((c) => c.id === companyId);
      if (savedCompany) {
        onCompanySelect(savedCompany);
        return;
      }

      // Check if it's a test company
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

  const handleSaveNewCompany = async () => {
    if (!newCompanyName.trim() || !onSaveCompany) return;

    try {
      const newCompany: OwnCompany = {
        id: `company-${Date.now()}`,
        name: newCompanyName.trim(),
        location: '',
        website: '',
        social: '',
        industry: '',
        companySize: '',
        targetMarket: '',
        valueProposition: '',
        mainOfferings: '',
        pricingModel: '',
        uniqueFeatures: '',
        marketSegment: '',
        competitiveAdvantages: '',
        currentCustomers: '',
        successStories: '',
        painPointsSolved: '',
        customerGoals: '',
        currentMarketingChannels: '',
        marketingMessaging: '',
      };

      await onSaveCompany(newCompany);

      // Add to saved companies
      const updatedSaved = [...savedCompanies, newCompany];
      setSavedCompanies(updatedSaved);
      localStorage.setItem('saved-companies', JSON.stringify(updatedSaved));

      // Select the new company
      onCompanySelect(newCompany);

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

                {savedCompanies.length > 0 && (
                  <>
                    <div className='px-2 py-1.5 text-sm font-semibold text-muted-foreground'>
                      Your Companies
                    </div>
                    {savedCompanies.map((company) => (
                      <SelectItem key={company.id} value={company.id || ''}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </>
                )}

                <div className='px-2 py-1.5 text-sm font-semibold text-muted-foreground'>
                  Test Companies
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
