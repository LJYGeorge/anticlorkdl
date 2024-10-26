import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

interface ConsoleViewerProps {
  logs: string[];
  isOpen: boolean;
  onClose: () => void;
}

export function ConsoleViewer({ logs, isOpen, onClose }: ConsoleViewerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="bg-gray-900 text-gray-100 p-4 shadow-xl border-t border-gray-700">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium">控制台输出</h3>
          <button
            onClick={onClose}
            className={clsx(
              "text-gray-400 hover:text-gray-200",
              "transition-colors duration-200"
            )}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 h-48 overflow-auto font-mono text-sm">
          {logs.map((log, index) => (
            <div key={index} className="py-1">
              <span className="text-gray-500">{`>`}</span> {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}