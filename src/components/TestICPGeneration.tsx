import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { testICPGeneration } from '@/utils/test-icp-generation';
import { Sparkles, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import type { ICP } from '@/services/ai';

export function TestICPGeneration() {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    icps?: ICP[];
    duration?: number;
    error?: string;
  } | null>(null);

  const handleTestICPGeneration = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const result = await testICPGeneration();
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Test failed unexpectedly',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card className='mt-4'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Sparkles className='h-5 w-5 text-primary' />
          Test ICP Generation
        </CardTitle>
        <CardDescription>
          Test the ICP generation functionality with sample data
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <Button
          onClick={handleTestICPGeneration}
          disabled={isTesting}
          className='w-full'>
          {isTesting ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Testing ICP Generation...
            </>
          ) : (
            <>
              <Sparkles className='mr-2 h-4 w-4' />
              Test ICP Generation
            </>
          )}
        </Button>

        {testResult && (
          <div className='space-y-4'>
            <div
              className={`p-4 rounded-md border ${
                testResult.success
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}>
              <div className='flex items-center gap-2'>
                {testResult.success ? (
                  <CheckCircle className='h-5 w-5 text-green-600' />
                ) : (
                  <XCircle className='h-5 w-5 text-red-600' />
                )}
                <h4 className='font-medium'>
                  {testResult.success ? 'Test Passed' : 'Test Failed'}
                </h4>
              </div>
              <p className='text-sm mt-2'>{testResult.message}</p>
              {testResult.duration && (
                <p className='text-sm mt-1 text-muted-foreground'>
                  Duration: {testResult.duration}ms
                </p>
              )}
              {testResult.error && (
                <p className='text-sm mt-1 text-red-600'>
                  Error: {testResult.error}
                </p>
              )}
            </div>

            {testResult.success && testResult.icps && (
              <div className='space-y-2'>
                <h4 className='font-medium'>Generated ICPs:</h4>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {testResult.icps.map((icp, index) => (
                    <Card key={index} className='bg-muted/30'>
                      <CardHeader className='pb-2'>
                        <CardTitle className='text-sm'>{icp.name}</CardTitle>
                      </CardHeader>
                      <CardContent className='pt-0'>
                        <p className='text-xs text-muted-foreground mb-2'>
                          {icp.description.substring(0, 100)}...
                        </p>
                        <div className='text-xs space-y-1'>
                          <p>
                            <strong>Demographics:</strong>{' '}
                            {icp.demographics.age}, {icp.demographics.gender},{' '}
                            {icp.demographics.location}
                          </p>
                          <p>
                            <strong>Interests:</strong>{' '}
                            {icp.psychographics.interests.length} items
                          </p>
                          <p>
                            <strong>Pain Points:</strong>{' '}
                            {icp.psychographics.painPoints.length} items
                          </p>
                          <p>
                            <strong>Goals:</strong> {icp.goals.length} items
                          </p>
                          <p>
                            <strong>Challenges:</strong> {icp.challenges.length}{' '}
                            items
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
