import React, { useMemo } from 'react';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import bytes from 'bytes';
import type { Resource } from '../types/crawler';

interface StatsPanelProps {
  resources: Resource[];
}

export function StatsPanel({ resources }: StatsPanelProps) {
  const stats = useMemo(() => {
    const typeBreakdown = resources.reduce((acc, resource) => {
      acc[resource.type] = (acc[resource.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalSize = resources.reduce((sum, resource) => sum + resource.size, 0);

    return {
      totalFiles: resources.length,
      totalSize,
      typeBreakdown
    };
  }, [resources]);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'image':
        return '图片';
      case 'script':
        return '脚本';
      case 'stylesheet':
        return '样式表';
      default:
        return type;
    }
  };

  if (resources.length === 0) {
    return null;
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-indigo-50 rounded-xl">
          <ChartBarIcon className="h-5 w-5 text-indigo-500" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">爬取统计</h2>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="text-sm text-gray-500">总文件数</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.totalFiles}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="text-sm text-gray-500">总大小</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">{bytes(stats.totalSize)}</p>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-4">资源类型分布</p>
          <div className="space-y-3">
            {Object.entries(stats.typeBreakdown).map(([type, count]) => (
              <div key={type} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                <span className="text-sm text-gray-700">{getTypeLabel(type)}</span>
                <span className="text-sm font-medium text-gray-900 bg-white px-3 py-1 rounded-lg shadow-sm">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}