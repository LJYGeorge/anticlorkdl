import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import clsx from 'clsx';
import { CrawlerForm } from './components/CrawlerForm';
import { CrawlerStatus } from './components/CrawlerStatus';
import { ResourceList } from './components/ResourceList';
import { CrawlerConfig } from './components/CrawlerConfig';
import { AdvancedConfig } from './components/AdvancedConfig';
import { ProxyConfig } from './components/ProxyConfig';
import { StatsPanel } from './components/StatsPanel';
import { ConsoleViewer } from './components/ConsoleViewer';
import type { Resource, CrawlerStatus as StatusType, CrawlerConfig as ConfigType, ProxyConfig as ProxyConfigType } from './types/crawler';

export default function App() {
  const [crawlingStatus, setCrawlingStatus] = useState<StatusType>('idle');
  const [resources, setResources] = useState<Resource[]>([]);
  const [saveDir, setSaveDir] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [config, setConfig] = useState<ConfigType>({
    maxDepth: 2,
    includeImages: true,
    includeStyles: true,
    includeScripts: true,
    downloadResources: true,
    antiDetection: {
      location: 'auto',
      device: 'auto',
      browserProfile: 'standard',
      rotateUserAgent: true,
      simulateHumanBehavior: true,
      useWebGLMasking: true,
      useCanvasNoise: true,
      useTimezoneMasking: true
    },
    proxy: {
      enabled: false,
      host: '',
      port: 8080,
      protocol: 'http'
    },
    requestDelay: 1000,
    maxConcurrent: 5,
    respectRobotsTxt: true,
    followRedirects: true
  });

  const addLog = (message: string) => {
    setLogs(prev => [...prev, message]);
  };

  const handleStartCrawling = async (url: string) => {
    if (!url.startsWith('http')) {
      alert('请输入以 http 或 https 开头的有效网址');
      return;
    }

    setCrawlingStatus('crawling');
    setResources([]);
    setLogs([]);
    
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const newSaveDir = `/website_backup_${timestamp}`;
      setSaveDir(newSaveDir);
      addLog(`开始爬取 ${url}`);
      addLog(`使用地理位置: ${config.antiDetection.location}`);
      addLog(`设备配置: ${config.antiDetection.device}`);
      addLog(`保护级别: ${config.antiDetection.browserProfile}`);
      
      if (config.proxy.enabled) {
        addLog(`使用代理: ${config.proxy.protocol}://${config.proxy.host}:${config.proxy.port}`);
      }

      setTimeout(() => {
        const mockResources: Resource[] = [
          {
            url: `${url}/styles.css`,
            type: 'stylesheet',
            status: 'downloaded',
            size: 15000
          },
          {
            url: `${url}/main.js`,
            type: 'script',
            status: 'downloaded',
            size: 45000
          },
          {
            url: `${url}/logo.png`,
            type: 'image',
            status: 'downloaded',
            size: 25000
          }
        ];
        
        mockResources.forEach(resource => {
          setResources(prev => [...prev, resource]);
          addLog(`发现资源: ${resource.url}`);
        });
        
        setCrawlingStatus('completed');
        addLog('爬取完成');
      }, 2000);
    } catch (error) {
      setCrawlingStatus('error');
      addLog(`错误: ${error instanceof Error ? error.message : '未知错误'}`);
      console.error('爬取失败:', error);
    }
  };

  const handleConfigChange = (newConfig: Partial<ConfigType>) => {
    setConfig(prev => ({
      ...prev,
      ...newConfig
    }));
  };

  const handleProxyChange = (proxy: ProxyConfigType) => {
    handleConfigChange({ proxy });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">
              网站资源爬取工具
            </h1>
            <p className="mt-3 text-gray-500">
              高效、安全地爬取网站资源，支持多种反检测机制
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-semibold text-gray-900">
                  开始爬取
                </h2>
                <button
                  onClick={() => setIsConsoleOpen(!isConsoleOpen)}
                  className={clsx(
                    "px-4 py-2 text-sm font-medium rounded-xl",
                    "transition-all duration-200",
                    "border border-gray-200",
                    "hover:bg-gray-50",
                    isConsoleOpen 
                      ? "bg-gray-100 text-gray-700"
                      : "bg-white text-gray-600"
                  )}
                >
                  {isConsoleOpen ? '隐藏控制台' : '显示控制台'}
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <div className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-100 shadow-lg">
                    <CrawlerForm 
                      onSubmit={handleStartCrawling}
                      disabled={crawlingStatus === 'crawling'}
                    />

                    <CrawlerStatus 
                      status={crawlingStatus}
                      saveDir={saveDir}
                    />
                  </div>

                  {resources.length > 0 && (
                    <ResourceList resources={resources} />
                  )}
                </div>

                <div className="space-y-8">
                  <CrawlerConfig
                    config={config}
                    onConfigChange={handleConfigChange}
                    disabled={crawlingStatus === 'crawling'}
                  />
                  
                  <AdvancedConfig
                    config={config.antiDetection}
                    onConfigChange={(antiDetection) => handleConfigChange({ antiDetection })}
                    disabled={crawlingStatus === 'crawling'}
                  />

                  <ProxyConfig
                    config={config.proxy}
                    onConfigChange={handleProxyChange}
                    disabled={crawlingStatus === 'crawling'}
                  />
                  
                  <StatsPanel resources={resources} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConsoleViewer 
        logs={logs}
        isOpen={isConsoleOpen}
        onClose={() => setIsConsoleOpen(false)}
      />
    </div>
  );
}