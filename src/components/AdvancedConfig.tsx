import React from 'react';
import { Disclosure } from '@headlessui/react';
import { ChevronUpIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import type { AntiDetectionConfig, LocationPreset, DevicePreset, BrowserProfile } from '../types/crawler';

interface AdvancedConfigProps {
  config: AntiDetectionConfig;
  onConfigChange: (config: AntiDetectionConfig) => void;
  disabled: boolean;
}

const locationPresets: { value: LocationPreset; label: string; coords: [number, number] }[] = [
  { value: 'auto', label: '🌐 Auto Detect', coords: [0, 0] },
  { value: 'korea-seoul', label: '🇰🇷 Seoul, Korea', coords: [37.5665, 126.9780] },
  { value: 'korea-busan', label: '🇰🇷 Busan, Korea', coords: [35.1796, 129.0756] },
  { value: 'japan-tokyo', label: '🇯🇵 Tokyo, Japan', coords: [35.6762, 139.6503] },
  { value: 'china-beijing', label: '🇨🇳 Beijing, China', coords: [39.9042, 116.4074] },
  { value: 'usa-west', label: '🇺🇸 US West Coast', coords: [37.7749, -122.4194] },
  { value: 'usa-east', label: '🇺🇸 US East Coast', coords: [40.7128, -74.0060] },
  { value: 'europe-west', label: '🇪🇺 Western Europe', coords: [48.8566, 2.3522] },
];

const devicePresets: { value: DevicePreset; label: string }[] = [
  { value: 'auto', label: '🔄 Auto Detect' },
  { value: 'desktop-windows', label: '💻 Windows PC' },
  { value: 'desktop-mac', label: '🖥 MacBook' },
  { value: 'mobile-android', label: '📱 Android Phone' },
  { value: 'mobile-ios', label: '📱 iPhone' },
  { value: 'tablet-android', label: '📱 Android Tablet' },
  { value: 'tablet-ios', label: '📱 iPad' },
];

const browserProfiles: { value: BrowserProfile; label: string; description: string }[] = [
  { 
    value: 'standard', 
    label: 'Standard', 
    description: 'Basic fingerprint randomization'
  },
  { 
    value: 'stealth', 
    label: 'Stealth', 
    description: 'Advanced evasion techniques'
  },
  { 
    value: 'maximum', 
    label: 'Maximum Protection', 
    description: 'Full suite of anti-detection measures'
  },
];

export function AdvancedConfig({ config, onConfigChange, disabled }: AdvancedConfigProps) {
  const handleChange = (key: keyof AntiDetectionConfig, value: LocationPreset | DevicePreset | BrowserProfile) => {
    if (disabled) return;
    onConfigChange({
      ...config,
      [key]: value
    });
  };

  return (
    <Disclosure>
      {({ open }) => (
        <>
          <Disclosure.Button className="flex w-full justify-between rounded-lg bg-gray-50 px-4 py-3 text-left text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus-visible:ring focus-visible:ring-indigo-500 focus-visible:ring-opacity-75 items-center">
            <div className="flex items-center space-x-2">
              <ShieldCheckIcon className="h-5 w-5 text-gray-500" />
              <span>Anti-Detection Settings</span>
            </div>
            <ChevronUpIcon
              className={`${open ? 'rotate-180 transform' : ''} h-5 w-5 text-gray-500`}
            />
          </Disclosure.Button>
          <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm text-gray-500">
            <div className="space-y-4">
              {/* Location Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location Simulation
                </label>
                <select
                  value={config.location}
                  onChange={(e) => handleChange('location', e.target.value as LocationPreset)}
                  disabled={disabled}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100"
                >
                  {locationPresets.map((preset) => (
                    <option key={preset.value} value={preset.value}>
                      {preset.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Device Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Device Profile
                </label>
                <select
                  value={config.device}
                  onChange={(e) => handleChange('device', e.target.value as DevicePreset)}
                  disabled={disabled}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100"
                >
                  {devicePresets.map((preset) => (
                    <option key={preset.value} value={preset.value}>
                      {preset.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Browser Profile */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Protection Level
                </label>
                <div className="space-y-2">
                  {browserProfiles.map((profile) => (
                    <div key={profile.value} className="flex items-center">
                      <input
                        type="radio"
                        id={profile.value}
                        name="browser-profile"
                        value={profile.value}
                        checked={config.browserProfile === profile.value}
                        onChange={(e) => handleChange('browserProfile', e.target.value as BrowserProfile)}
                        disabled={disabled}
                        className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
                      />
                      <label htmlFor={profile.value} className="ml-3">
                        <span className="block text-sm font-medium text-gray-700">
                          {profile.label}
                        </span>
                        <span className="block text-xs text-gray-500">
                          {profile.description}
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}