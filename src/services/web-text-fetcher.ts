export class WebTextFetcher {
  private static readonly PROXY_PREFIX = 'https://r.jina.ai/';

  async fetchText(url: string, timeoutMs: number = 30000): Promise<string> {
    const proxiedUrl = this.buildProxiedUrl(url);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const resp = await fetch(proxiedUrl, { signal: controller.signal });
      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status}`);
      }
      const text = await resp.text();
      return text.trim();
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async fetchStructuredText(
    url: string,
    selector?: string,
    timeoutMs: number = 30000,
  ): Promise<string> {
    // Try to get structured content with better extraction
    const proxiedUrl = this.buildProxiedUrl(url);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      // Use Jina AI with custom headers for better extraction
      const resp = await fetch(proxiedUrl, {
        signal: controller.signal,
        headers: {
          Accept: 'text/plain, application/json',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status}`);
      }

      const text = await resp.text();
      return this.cleanWebContent(text);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private cleanWebContent(text: string): string {
    // Remove common web navigation and UI elements
    const lines = text.split('\n');
    const cleanedLines = lines.filter((line) => {
      const trimmed = line.trim().toLowerCase();

      // Skip empty lines
      if (!trimmed) return false;

      // Skip navigation and UI elements
      const skipPatterns = [
        /^(home|about|contact|login|sign up|menu|search)$/,
        /^(cookie|privacy|terms|legal)/,
        /^(\[|\(|\{).*\]|\)|\}$/, // Skip bracketed navigation
        /^(\d+\s+)?(star|rating|review)s?$/,
        /^(sort by|filter|categories|blog)$/,
        /^https?:\/\//, // Skip URLs
        /^(image|logo|icon|button)$/,
        /^(suggested|popular|trending)/,
        /^(\d+\.?\d*\s*\/\s*\d+)/, // Skip ratings like "4.5/5"
      ];

      return !skipPatterns.some((pattern) => pattern.test(trimmed));
    });

    return cleanedLines.join('\n').trim();
  }

  async fetchJson<T>(url: string, timeoutMs: number = 15000): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const resp = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status}`);
      }
      return (await resp.json()) as T;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private buildProxiedUrl(url: string): string {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return `${WebTextFetcher.PROXY_PREFIX}${url}`;
    }
    return `${WebTextFetcher.PROXY_PREFIX}https://${url}`;
  }
}
