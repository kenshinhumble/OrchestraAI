'use client';

import { useState } from 'react';
import { GeneratedCode } from '@/lib/types';

interface CodeOutputProps {
  code: GeneratedCode | null;
}

export default function CodeOutput({ code }: CodeOutputProps) {
  const [activeTab, setActiveTab] = useState<'frontend' | 'backend'>('frontend');

  if (!code) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 h-full flex items-center justify-center">
        <p className="text-gray-400 text-sm">Generated code will appear here...</p>
      </div>
    );
  }

  const displayCode = activeTab === 'frontend' ? code.frontend : code.backend;

  return (
    <div className="bg-gray-900 rounded-2xl shadow-lg border border-gray-200 overflow-hidden h-full flex flex-col">
      <div className="flex items-center justify-between bg-gray-800 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-400"></span>
            <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
            <span className="w-3 h-3 rounded-full bg-green-400"></span>
          </div>
          <span className="text-gray-400 text-xs ml-3 font-mono">output.tsx</span>
        </div>
        <div className="flex gap-1 bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('frontend')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition ${
              activeTab === 'frontend' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Frontend
          </button>
          <button
            onClick={() => setActiveTab('backend')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition ${
              activeTab === 'backend' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Backend
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap break-words">
          <code>{displayCode}</code>
        </pre>
      </div>
    </div>
  );
}
