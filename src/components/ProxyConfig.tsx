import React, { useState } from 'react';
import { Disclosure } from '@headlessui/react';
import { ChevronUpIcon, GlobeAltIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { testProxy } from '../services/proxyService';
import type { ProxyConfig, ProxyStatus } from '../types/crawler';
import clsx from 'clsx';

interface ProxyConfigProps {
  config: ProxyConfig;
  onConfigChange: (config: ProxyConfig) => void;
  disabled: boolean;
}

export function ProxyConfig({ config, onConfigChange, disabled }: ProxyConfigProps) {
  const [testing, setTesting] = useState(false);
  const [proxyStatus, setProxyStatus] = useState<ProxyStatus | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleChange = (key: keyof ProxyConfig, value: any) => {
    if (disabled) return;
    onConfigChange({
      ...config,
      [key]: value
    });
    // Reset status when config changes
    setProxyStatus(null);
  };

  const handleTestProxy = async () => {
    setTesting(true);
    try {
      const status = await testProxy(config);
      setProxyStatus(status);
    } catch (error) {
      setProxyStatus({
        isValid: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        lastChecked: new Date()
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Disclosure>
      {({ open }) => (
        <>
          <Disclosure.Button className="flex w-full justify-between rounded-lg bg-gray-50 px-4 py-3 text-left text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus-visible:ring focus-visible:ring-indigo-500 focus-visible:ring-opacity-75 items-center">
            <div className="flex items-center space-x-2">
              <GlobeAltIcon className="h-5 w-5 text-gray-500" />
              <span>Proxy Settings</span>
              {proxyStatus && (
                <span className={clsx(
                  "ml-2 px-2 py-1 text-xs rounded-full",
                  proxyStatus.isValid 
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                )}>
                  {proxyStatus.isValid ? 'Valid' : 'Invalid'}
                </span>
              )}
            </div>
            <ChevronUpIcon
              className={`${open ? 'rotate-180 transform' : ''} h-5 w-5 text-gray-500`}
            />
          </Disclosure.Button>
          <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm text-gray-500">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Enable Proxy</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.enabled}
                    onChange={(e) => handleChange('enabled', e.target.checked)}
                    disabled={disabled}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {config.enabled && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Protocol
                    </label>
                    <select
                      value={config.protocol}
                      onChange={(e) => handleChange('protocol', e.target.value)}
                      disabled={disabled}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100"
                    >
                      <option value="http">HTTP</option>
                      <option value="https">HTTPS</option>
                      <option value="socks4">SOCKS4</option>
                      <option value="socks5">SOCKS5</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Host
                      </label>
                      <input
                        type="text"
                        value={config.host}
                        onChange={(e) => handleChange('host', e.target.value)}
                        disabled={disabled}
                        placeholder="proxy.example.com"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Port
                      </label>
                      <input
                        type="number"
                        value={config.port}
                        onChange={(e) => handleChange('port', parseInt(e.target.value, 10))}
                        disabled={disabled}
                        placeholder="8080"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100"
                      />
                    </div>
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="text-sm text-indigo-600 hover:text-indigo-500"
                    >
                      {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}
                    </button>
                  </div>

                  {showAdvanced && (
                    <div className="space-y-4 border-t border-gray-200 pt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Username (Optional)
                        </label>
                        <input
                          type="text"
                          value={config.username || ''}
                          onChange={(e) => handleChange('username', e.target.value)}
                          disabled={disabled}
                          placeholder="username"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Password (Optional)
                        </label>
                        <input
                          type="password"
                          value={config.password || ''}
                          onChange={(e) => handleChange('password', e.target.value)}
                          disabled={disabled}
                          placeholder="••••••••"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100"
                        />
                      </div>
                    </div>
                  )}

                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={handleTestProxy}
                      disabled={disabled || testing || !config.host || !config.port}
                      className={clsx(
                        "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white",
                        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500",
                        disabled || testing || !config.host || !config.port
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-indigo-600 hover:bg-indigo-700"
                      )}
                    >
                      {testing ? (
                        <>
                          <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-4 w-4" />
                          Testing Proxy...
                        </>
                      ) : (
                        'Test Proxy Connection'
                      )}
                    </button>

                    {proxyStatus && (
                      <div className="mt-4 p-4 rounded-md bg-gray-50">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                          Proxy Test Results
                        </h4>
                        {proxyStatus.isValid ? (
                          <div className="space-y-1">
                            <p className="text-sm text-gray-600">
                              Status: <span className="text-green-600">Valid</span>
                            </p>
                            {proxyStatus.ip && (
                              <p className="text-sm text-gray-600">
                                IP: {proxyStatus.ip}
                              </p>
                            )}
                            {proxyStatus.country && (
                              <p className="text-sm text-gray-600">
                                Location: {proxyStatus.country}
                              </p>
                            )}
                            {proxyStatus.latency && (
                              <p className="text-sm text-gray-600">
                                Latency: {proxyStatus.latency}ms
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm text-red-600">
                            {proxyStatus.error || 'Failed to validate proxy'}
                          </div>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          Last checked: {proxyStatus.lastChecked.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}