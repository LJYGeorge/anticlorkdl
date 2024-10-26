import type { CrawlerConfig, Resource } from '../types/crawler';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? import.meta.env.VITE_API_URL || 'https://api.your-domain.com'
  : 'http://localhost:3000';

const TIMEOUT = 30000; // 30 seconds timeout

export async function startCrawling(
  url: string,
  config: CrawlerConfig,
  onResourceFound: (resource: Resource) => void
): Promise<void> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

    const response = await fetch(`${API_BASE_URL}/api/crawl`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url, config }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Crawling failed: ${response.statusText}`);
    }

    const eventSource = new EventSource(`${API_BASE_URL}/api/crawl-status`);
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.resource) {
          onResourceFound(data.resource);
        }
      } catch (error) {
        console.error('Failed to parse SSE message:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE Error:', error);
      eventSource.close();
    };

    // Add timeout for SSE connection
    setTimeout(() => {
      if (eventSource.readyState !== EventSource.CLOSED) {
        eventSource.close();
      }
    }, TIMEOUT);
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw new Error(error instanceof Error ? error.message : 'Unknown error');
  }
}