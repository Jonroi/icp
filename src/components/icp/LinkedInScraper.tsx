import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LinkedInService } from '@/services/linkedin-service';
import type { LinkedInData } from '@/services/linkedin-service';

interface LinkedInScraperProps {
  onLinkedInDataScraped: (data: LinkedInData) => void;
  isFetching: boolean;
  status?: { success: boolean; message: string };
}

export function LinkedInScraper({
  onLinkedInDataScraped,
  isFetching,
  status,
}: LinkedInScraperProps) {
  const [linkedInUrl, setLinkedInUrl] = useState('');
  const [isValidUrl, setIsValidUrl] = useState(true);

  const handleUrlChange = (url: string) => {
    setLinkedInUrl(url);
    if (url.trim()) {
      setIsValidUrl(LinkedInService.isValidLinkedInUrl(url));
    } else {
      setIsValidUrl(true);
    }
  };

  const handleScrape = async () => {
    if (!linkedInUrl.trim() || !isValidUrl) return;

    try {
      const linkedInService = new LinkedInService();
      const data = await linkedInService.scrapeLinkedInUrl(linkedInUrl);

      if (data) {
        onLinkedInDataScraped(data);
        setLinkedInUrl(''); // Clear input after successful scrape
      }
    } catch (error) {
      console.error('LinkedIn scraping failed:', error);
    }
  };

  const getUrlType = () => {
    if (!linkedInUrl.trim()) return '';
    return LinkedInService.getUrlType(linkedInUrl);
  };

  const urlType = getUrlType();

  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <svg
            className='w-5 h-5 text-blue-600'
            fill='currentColor'
            viewBox='0 0 24 24'>
            <path d='M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' />
          </svg>
          LinkedIn Data Scraper
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='space-y-2'>
          <Label htmlFor='linkedin-url'>LinkedIn URL</Label>
          <Input
            id='linkedin-url'
            type='url'
            placeholder='https://www.linkedin.com/company/example or https://www.linkedin.com/in/username'
            value={linkedInUrl}
            onChange={(e) => handleUrlChange(e.target.value)}
            className={!isValidUrl ? 'border-red-500' : ''}
          />
          {linkedInUrl && (
            <div className='text-sm text-gray-600'>
              {isValidUrl ? (
                <span className='text-green-600'>
                  ✓ Valid LinkedIn {urlType} URL
                </span>
              ) : (
                <span className='text-red-600'>
                  ✗ Invalid LinkedIn URL format
                </span>
              )}
            </div>
          )}
        </div>

        <Button
          onClick={handleScrape}
          disabled={!linkedInUrl.trim() || !isValidUrl || isFetching}
          className='w-full'>
          {isFetching ? (
            <>
              <svg
                className='animate-spin -ml-1 mr-3 h-4 w-4 text-white'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'>
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'></circle>
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
              </svg>
              Scraping...
            </>
          ) : (
            'Scrape LinkedIn Data'
          )}
        </Button>

        {status && (
          <div
            className={`p-3 rounded-md text-sm ${
              status.success
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
            {status.message}
          </div>
        )}

        <div className='text-xs text-gray-500 space-y-1'>
          <p>
            <strong>Supported URLs:</strong>
          </p>
          <ul className='list-disc list-inside space-y-1'>
            <li>Company pages: linkedin.com/company/company-name</li>
            <li>Profile pages: linkedin.com/in/username</li>
            <li>School pages: linkedin.com/school/school-name</li>
          </ul>
          <p className='mt-2'>
            <strong>Note:</strong> Some LinkedIn pages may require
            authentication or be private.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
