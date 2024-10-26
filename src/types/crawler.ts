export type CrawlerStatus = 'idle' | 'crawling' | 'completed' | 'error';

export interface Resource {
  url: string;
  type: string;
  status: 'downloading' | 'downloaded' | 'error';
  size: number;
  localPath?: string;
  error?: string;
}

export type LocationPreset = 
  | 'auto' 
  | 'korea-seoul' 
  | 'korea-busan' 
  | 'japan-tokyo' 
  | 'japan-osaka'
  | 'china-beijing' 
  | 'china-shanghai'
  | 'usa-west' 
  | 'usa-east'
  | 'usa-central'
  | 'europe-west'
  | 'europe-east'
  | 'europe-north'
  | 'asia-southeast'
  | 'australia-sydney';

export type DevicePreset = 
  | 'auto' 
  | 'desktop-windows' 
  | 'desktop-mac' 
  | 'desktop-linux'
  | 'mobile-android' 
  | 'mobile-ios' 
  | 'tablet-android' 
  | 'tablet-ios'
  | 'tv-smart'
  | 'console-gaming';

export type BrowserProfile = 
  | 'standard' 
  | 'stealth' 
  | 'maximum'
  | 'enterprise'
  | 'residential';

export interface AntiDetectionConfig {
  location: LocationPreset;
  device: DevicePreset;
  browserProfile: BrowserProfile;
  rotateUserAgent: boolean;
  simulateHumanBehavior: boolean;
  useWebGLMasking: boolean;
  useCanvasNoise: boolean;
  useTimezoneMasking: boolean;
}

export interface ProxyConfig {
  enabled: boolean;
  host: string;
  port: number;
  protocol: 'http' | 'https' | 'socks4' | 'socks5';
  username?: string;
  password?: string;
  rotateInterval?: number;
}

export interface CrawlerConfig {
  maxDepth: number;
  includeImages: boolean;
  includeStyles: boolean;
  includeScripts: boolean;
  downloadResources: boolean;
  antiDetection: AntiDetectionConfig;
  proxy: ProxyConfig;
  requestDelay: number;
  maxConcurrent: number;
  respectRobotsTxt: boolean;
  followRedirects: boolean;
}

export interface ProxyStatus {
  isValid: boolean;
  ip?: string;
  country?: string;
  city?: string;
  isp?: string;
  latency?: number;
  anonymityLevel?: 'transparent' | 'anonymous' | 'elite';
  protocol?: ProxyConfig['protocol'];
  lastChecked: Date;
  error?: string;
}