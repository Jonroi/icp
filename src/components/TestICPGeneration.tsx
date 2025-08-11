import { useState } from 'react';
import {
  testReviewFetching,
  analyzeReviewQuality,
} from '../utils/test-review-fetching';
import {
  debugReviewFetching,
  formatDebugResults,
} from '../utils/debug-review-fetching';
import { ReviewsService } from '../services/reviews-service';
import { Button } from './ui/button';
import { Card } from './ui/card';

export function TestICPGeneration() {
  const [isTestingReviews, setIsTestingReviews] = useState(false);
  const [testResults, setTestResults] = useState<string>('');
  const [quickTestResult, setQuickTestResult] = useState<{
    realReviews: number;
    navigation: number;
    suspicious: number;
    total: number;
  } | null>(null);
  const [debugResult, setDebugResult] = useState<string>('');

  const handleTestReviews = async () => {
    setIsTestingReviews(true);
    setTestResults('');

    try {
      // Capture console output for the test
      const originalLog = console.log;
      const originalError = console.error;
      const logs: string[] = [];

      console.log = (...args) => {
        logs.push(args.join(' '));
        originalLog(...args);
      };

      console.error = (...args) => {
        logs.push(`ERROR: ${args.join(' ')}`);
        originalError(...args);
      };

      await testReviewFetching();

      // Restore console
      console.log = originalLog;
      console.error = originalError;

      setTestResults(logs.join('\n'));
    } catch (error) {
      setTestResults(`Test failed: ${error}`);
    } finally {
      setIsTestingReviews(false);
    }
  };

  const handleQuickTest = async () => {
    try {
      setQuickTestResult(null);
      // Test with a known delivery company that should have reviews
      const reviews = await ReviewsService.fetchCustomerReviews(
        'UPS',
        'ups.com',
      );
      const analysis = analyzeReviewQuality(reviews);
      setQuickTestResult(analysis);
    } catch (error) {
      console.error('Quick test failed:', error);
    }
  };

  const handleDebugTest = async () => {
    try {
      setDebugResult('Running debug test for DB Schenker...\n');
      const steps = await debugReviewFetching('DB Schenker', 'dbschenker.com');
      const formatted = formatDebugResults(steps);
      setDebugResult(formatted);
    } catch (error) {
      setDebugResult(`Debug test failed: ${error}`);
    }
  };

  return (
    <div className='p-6 space-y-6'>
      <Card className='p-6'>
        <h2 className='text-xl font-bold mb-4'>
          Enhanced Review Fetching Test
        </h2>
        <p className='text-gray-600 mb-4'>
          Test the improved review fetching system that should filter out
          navigation elements and extract real customer reviews from Trustpilot
          and Reddit.
        </p>

        <div className='flex gap-4 mb-4'>
          <Button
            onClick={handleTestReviews}
            disabled={isTestingReviews}
            className='bg-blue-600 hover:bg-blue-700'>
            {isTestingReviews ? 'Testing...' : 'Run Full Review Test'}
          </Button>

          <Button onClick={handleQuickTest} variant='outline'>
            Quick Test (UPS)
          </Button>

          <Button
            onClick={handleDebugTest}
            variant='outline'
            className='bg-orange-50 hover:bg-orange-100'>
            🔍 Debug DB Schenker
          </Button>
        </div>

        {quickTestResult && (
          <div className='bg-gray-50 p-4 rounded-lg mb-4'>
            <h3 className='font-semibold mb-2'>Quick Test Results:</h3>
            <div className='grid grid-cols-2 gap-4 text-sm'>
              <div>Total Reviews: {quickTestResult.total}</div>
              <div className='text-green-600'>
                Real Reviews: {quickTestResult.realReviews}
              </div>
              <div className='text-red-600'>
                Navigation/Metadata: {quickTestResult.navigation}
              </div>
              <div className='text-yellow-600'>
                Suspicious: {quickTestResult.suspicious}
              </div>
            </div>
            <div className='mt-2'>
              <div className='text-sm text-gray-600'>
                Success Rate:{' '}
                {quickTestResult.total > 0
                  ? Math.round(
                      (quickTestResult.realReviews / quickTestResult.total) *
                        100,
                    )
                  : 0}
                %
              </div>
            </div>
            {quickTestResult.navigation > quickTestResult.realReviews && (
              <div className='text-red-600 text-sm mt-2'>
                ⚠️ Still getting too much navigation content - may need further
                refinement
              </div>
            )}
          </div>
        )}

        {testResults && (
          <div className='bg-black text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto'>
            <h3 className='font-semibold mb-2 text-white'>
              Test Console Output:
            </h3>
            <pre className='whitespace-pre-wrap'>{testResults}</pre>
          </div>
        )}

        {debugResult && (
          <div className='bg-orange-50 border border-orange-200 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto'>
            <h3 className='font-semibold mb-2 text-orange-800'>
              🔍 Debug Analysis for DB Schenker:
            </h3>
            <pre className='whitespace-pre-wrap text-orange-900'>
              {debugResult}
            </pre>
          </div>
        )}
      </Card>

      <Card className='p-6'>
        <h3 className='text-lg font-semibold mb-3'>What was improved:</h3>
        <ul className='list-disc list-inside space-y-2 text-sm text-gray-700'>
          <li>
            <strong>Enhanced web scraping:</strong> Better content extraction
            with fetchStructuredText()
          </li>
          <li>
            <strong>Multiple URL attempts:</strong> Tries different Trustpilot
            URL patterns
          </li>
          <li>
            <strong>Improved filtering:</strong> Specifically filters out the
            navigation elements you showed
          </li>
          <li>
            <strong>Better review detection:</strong> Looks for personal
            language, experience words, and review indicators
          </li>
          <li>
            <strong>Enhanced AI validation:</strong> Improved prompts and
            fallback heuristics
          </li>
          <li>
            <strong>Cleaner text processing:</strong> Removes markdown links,
            ratings, and boilerplate content
          </li>
        </ul>
      </Card>

      <Card className='p-6'>
        <h3 className='text-lg font-semibold mb-3'>
          Issues from your example that are now fixed:
        </h3>
        <ul className='list-disc list-inside space-y-2 text-sm text-gray-700'>
          <li>
            ❌ "Insurance agency in United States" → ✅ Filtered out as search
            suggestion
          </li>
          <li>
            ❌ "Travel agency in New York" → ✅ Filtered out as search
            suggestion
          </li>
          <li>
            ❌ "Companies can ask for reviews via automatic invitations" → ✅
            Filtered out as metadata
          </li>
          <li>
            ❌ "Here are 8 tips for writing great reviews" → ✅ Filtered out as
            help text
          </li>
          <li>
            ✅ "Parcel delivery takes 10 days..." → ✅ Kept as genuine customer
            review
          </li>
        </ul>
      </Card>
    </div>
  );
}
