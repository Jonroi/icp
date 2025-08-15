import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown, Search, X } from 'lucide-react';
import { CONTINENTS, COUNTRIES_BY_REGION } from './location-data';

interface LocationSelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  showLabel?: boolean;
  labelText?: string;
}

export function LocationSelector({
  value = '',
  onValueChange,
  placeholder = 'Select market location',
  className = 'w-48',
  showLabel = false,
  labelText = 'Location',
}: LocationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Get all options for search
  const allOptions = useMemo(() => {
    const options = [
      ...CONTINENTS.map((continent) => ({
        ...continent,
        type: 'continent' as const,
        group: 'Continents & Global',
      })),
      ...Object.entries(COUNTRIES_BY_REGION).flatMap(([region, countries]) =>
        countries.map((country) => ({
          ...country,
          type: 'country' as const,
          group: region,
        })),
      ),
    ];
    return options.sort((a, b) => a.label.localeCompare(b.label));
  }, []);

  // Filter options based on search term
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return allOptions;

    const searchLower = searchTerm.toLowerCase();
    return allOptions.filter(
      (option) =>
        option.label.toLowerCase().includes(searchLower) ||
        (option.type === 'continent' &&
          option.description?.toLowerCase().includes(searchLower)) ||
        option.group.toLowerCase().includes(searchLower),
    );
  }, [allOptions, searchTerm]);

  // Get current selected option
  const selectedOption = allOptions.find((option) => option.value === value);

  // If value is not in predefined options, create a custom option
  const displayValue = selectedOption ? selectedOption.label : value;

  const handleSelect = (optionValue: string) => {
    onValueChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = () => {
    onValueChange('');
    setSearchTerm('');
  };

  return (
    <div className='space-y-2 relative'>
      {showLabel && (
        <Label className='text-sm'>
          {labelText}{' '}
          <span className='text-muted-foreground text-xs'>
            (primary market)
          </span>
        </Label>
      )}

      <div className='relative'>
        <Button
          variant='outline'
          className={`w-full justify-between ${className}`}
          onClick={() => setIsOpen(!isOpen)}>
          <span className='truncate'>{displayValue || placeholder}</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </Button>

        {isOpen && (
          <Card className='absolute top-full left-0 right-0 z-50 mt-1 max-h-80 overflow-hidden'>
            <CardContent className='p-0'>
              {/* Search input */}
              <div className='p-2 border-b'>
                <div className='relative'>
                  <Search className='absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                  <Input
                    placeholder='Search markets, countries, regions...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='pl-8 pr-8'
                    autoFocus
                  />
                  {searchTerm && (
                    <Button
                      variant='ghost'
                      size='icon'
                      className='absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6'
                      onClick={() => setSearchTerm('')}>
                      <X className='h-3 w-3' />
                    </Button>
                  )}
                </div>
              </div>

              {/* Options list */}
              <div className='max-h-64 overflow-y-auto'>
                {filteredOptions.length === 0 ? (
                  <div className='p-4 text-center text-muted-foreground text-sm'>
                    No locations found for &quot;{searchTerm}&quot;
                  </div>
                ) : (
                  <div className='py-1'>
                    {filteredOptions.map((option) => (
                      <Button
                        key={option.value}
                        variant='ghost'
                        className='w-full justify-start text-left px-3 py-2 h-auto'
                        onClick={() => handleSelect(option.value)}>
                        <div className='flex flex-col items-start'>
                          <span className='font-medium'>{option.label}</span>
                          {option.type === 'continent' &&
                            option.description && (
                              <span className='text-xs text-muted-foreground'>
                                {option.description}
                              </span>
                            )}
                        </div>
                      </Button>
                    ))}
                  </div>
                )}
              </div>

              {/* Clear button */}
              <div className='p-2 border-t'>
                <Button
                  variant='ghost'
                  size='sm'
                  className='w-full text-muted-foreground'
                  onClick={handleClear}>
                  Clear selection
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Click outside to close */}
      {isOpen && (
        <div
          className='fixed inset-0 z-40'
          onClick={() => {
            setIsOpen(false);
            setSearchTerm('');
          }}
        />
      )}
    </div>
  );
}
