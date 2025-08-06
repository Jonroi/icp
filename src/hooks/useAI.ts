import { useState, useCallback } from 'react';
import { AIService } from '@/services/ai';
import type { ICP, CompetitorData, CustomerReview } from '@/services/ai';

export function useAI(apiKey?: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedICPs, setGeneratedICPs] = useState<ICP[]>([]);

  const generateICPs = useCallback(
    async (
      competitors: CompetitorData[],
      reviews: CustomerReview[],
      additionalContext: string = '',
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        const aiService = new AIService(apiKey);
        const icps = await aiService.generateICPs(
          competitors,
          reviews,
          additionalContext,
        );
        setGeneratedICPs(icps);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to generate ICPs',
        );
      } finally {
        setIsLoading(false);
      }
    },
    [apiKey],
  );

  const generateICPsWithAI = useCallback(
    async (
      competitors: CompetitorData[],
      reviews: CustomerReview[],
      additionalContext: string = '',
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        const aiService = new AIService(apiKey);
        const icps = await aiService.generateICPs(
          competitors,
          reviews,
          additionalContext,
        );
        setGeneratedICPs(icps);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to generate ICPs',
        );
      } finally {
        setIsLoading(false);
      }
    },
    [apiKey],
  );

  const clearICPs = useCallback(() => {
    setGeneratedICPs([]);
    setError(null);
  }, []);

  return {
    generateICPs,
    generateICPsWithAI,
    clearICPs,
    generatedICPs,
    isLoading,
    error,
  };
}
