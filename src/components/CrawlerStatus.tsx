import React from 'react';
import clsx from 'clsx';

interface CrawlerStatusProps {
  status: 'idle' | 'crawling' | 'completed' | 'error';
  saveDir: string;
}

export function CrawlerStatus({ status, saveDir }: CrawlerStatusProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'crawling':
        return 'text-amber-600';
      case 'completed':
        return 'text-emerald-600';
      case 'error':
        return 'text-rose-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'idle':
        return '准备开始爬取';
      case 'crawling':
        return '正在爬取中...';
      case 'completed':
        return '爬取完成';
      case 'error':
        return '爬取过程中出现错误';
      default:
        return '';
    }
  };

  return (
    <div className="mt-6">
      <div className={clsx('text-sm font-medium', getStatusColor())}>
        状态: {getStatusMessage()}
      </div>
      {saveDir && status === 'completed' && (
        <div className="mt-2 text-sm text-gray-600">
          保存目录: {saveDir}
        </div>
      )}
    </div>
  );
}