import React from 'react';
import { CogIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

interface CrawlerConfigProps {
  config: {
    maxDepth: number;
    includeImages: boolean;
    includeStyles: boolean;
    includeScripts: boolean;
    downloadResources: boolean;
  };
  onConfigChange: (config: any) => void;
  disabled: boolean;
}

export function CrawlerConfig({ config, onConfigChange, disabled }: CrawlerConfigProps) {
  const handleChange = (key: string, value: any) => {
    if (disabled) return;
    onConfigChange({
      ...config,
      [key]: value
    });
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-indigo-50 rounded-xl">
          <CogIcon className="h-5 w-5 text-indigo-500" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">爬取设置</h2>
      </div>

      <div className="space-y-6">
        <div>
          <label htmlFor="maxDepth" className="block text-sm font-medium text-gray-700 mb-2">
            最大爬取深度
          </label>
          <input
            type="number"
            id="maxDepth"
            min="1"
            max="10"
            value={config.maxDepth}
            onChange={(e) => handleChange('maxDepth', parseInt(e.target.value, 10))}
            disabled={disabled}
            className={clsx(
              "mt-1 block w-full rounded-xl",
              "border-0 py-3 px-4",
              "ring-1 ring-inset ring-gray-200",
              "text-gray-900 shadow-sm",
              "focus:ring-2 focus:ring-inset focus:ring-indigo-500",
              "disabled:bg-gray-50 disabled:cursor-not-allowed"
            )}
          />
        </div>

        <div className="space-y-4">
          {[
            { key: 'includeImages', label: '包含图片' },
            { key: 'includeStyles', label: '包含样式表' },
            { key: 'includeScripts', label: '包含脚本' },
            { key: 'downloadResources', label: '下载资源' },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between bg-gray-50 p-4 rounded-xl">
              <span className="text-sm text-gray-700">{label}</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config[key as keyof typeof config]}
                  onChange={(e) => handleChange(key, e.target.checked)}
                  disabled={disabled}
                  className="sr-only peer"
                />
                <div className={clsx(
                  "w-11 h-6 rounded-full peer",
                  "bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300",
                  "peer-checked:after:translate-x-full peer-checked:after:border-white",
                  "after:content-[''] after:absolute after:top-[2px] after:left-[2px]",
                  "after:bg-white after:border-gray-300 after:border after:rounded-full",
                  "after:h-5 after:w-5 after:transition-all",
                  "peer-checked:bg-gradient-to-r peer-checked:from-indigo-500 peer-checked:to-purple-500"
                )}></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}