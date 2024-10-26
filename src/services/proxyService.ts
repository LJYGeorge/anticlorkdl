import type { ProxyConfig, ProxyStatus } from '../types/crawler';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.your-domain.com'
  : 'http://localhost:3000';

export async function testProxy(config: ProxyConfig): Promise<ProxyStatus> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/proxy/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config)
    });

    if (!response.ok) {
      throw new Error('Proxy test failed');
    }

    return await response.json();
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      lastChecked: new Date()
    };
  }
}