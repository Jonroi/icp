import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Token counting utility for Ollama models
export function estimateTokenCount(text: string): number {
  // Rough estimation: 1 token ≈ 4 characters for English text
  // This is a conservative estimate for llama3.2 model
  return Math.ceil(text.length / 4);
}

export function checkTokenLimit(
  text: string,
  limit: number = 10000,
): {
  tokenCount: number;
  isWithinLimit: boolean;
  percentage: number;
} {
  const tokenCount = estimateTokenCount(text);
  const percentage = (tokenCount / limit) * 100;

  return {
    tokenCount,
    isWithinLimit: tokenCount <= limit,
    percentage: Math.round(percentage * 100) / 100,
  };
}
