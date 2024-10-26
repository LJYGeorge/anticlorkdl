import React from 'react';
import { DocumentIcon, PhotoIcon, CodeBracketIcon } from '@heroicons/react/24/outline';
import bytes from 'bytes';
import clsx from 'clsx';
import type { Resource } from '../types/crawler';

interface ResourceListProps {
  resources: Resource[];
}

export function ResourceList({ resources }: ResourceListProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <PhotoIcon className="h-5 w-5 text-indigo-400" />;
      case 'script':
        return <CodeBracketIcon className="h-5 w-5 text-purple-400" />;
      default:
        return <DocumentIcon className="h-5 w-5 text-blue-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'downloaded':
        return 'text-emerald-600 bg-emerald-50 ring-emerald-500/10';
      case 'downloading':
        return 'text-amber-600 bg-amber-50 ring-amber-500/10';
      case 'error':
        return 'text-rose-600 bg-rose-50 ring-rose-500/10';
      default:
        return 'text-gray-600 bg-gray-50 ring-gray-500/10';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'downloaded':
        return '已下载';
      case 'downloading':
        return '下载中';
      case 'error':
        return '错误';
      default:
        return '等待中';
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">已捕获的资源</h3>
      <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl border border-gray-100 overflow-hidden">
        <ul className="divide-y divide-gray-100">
          {resources.map((resource, index) => (
            <li key={index} className="hover:bg-gray-50 transition-colors duration-150">
              <div className="px-6 py-4 flex items-center">
                <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                  <div className="flex items-center">
                    <div className="p-2 bg-gray-50 rounded-xl">
                      {getIcon(resource.type)}
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900 truncate max-w-md">
                        {resource.url}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {bytes(resource.size)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="ml-5 flex-shrink-0">
                  <span className={clsx(
                    "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
                    "ring-1 ring-inset",
                    getStatusColor(resource.status)
                  )}>
                    {getStatusText(resource.status)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}