'use client';

import { useState } from 'react';
import FeatureInput from '@/components/FeatureInput';
import AgentTimeline from '@/components/AgentTimeline';
import CodeOutput from '@/components/CodeOutput';
import LivePreview from '@/components/LivePreview';
import { OrchestrationState } from '@/lib/types';

export default function Home() {
  const [state, setState] = useState<OrchestrationState | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleGenerate = async (input: string) => {
    setIsRunning(true);
    setState(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      });

      if (!response.ok) throw new Error('Failed to generate');

      const data = await response.json();
      setState(data.state);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate. Check console for details.');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 backdrop-blur-md bg-white/80">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Multi-Agent App Builder</h1>
              <p className="text-xs text-gray-500">AI-Powered Full-Stack Code Generation</p>
            </div>
          </div>
          {state && (
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${state.isRunning ? 'bg-yellow-400 animate-pulse' : state.finalOutput ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="text-sm font-medium text-gray-600">
                {state.isRunning ? 'Processing' : state.finalOutput ? 'Completed' : 'Failed'}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Top Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <FeatureInput onGenerate={handleGenerate} isRunning={isRunning} />
          </div>
          <div>
            <AgentTimeline state={state} />
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ minHeight: '500px' }}>
          <CodeOutput code={state?.finalOutput || state?.code || null} />
          <LivePreview code={state?.finalOutput || state?.code || null} />
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-gray-400">
          <p>Powered by 4-Agent Architecture: Architect → Frontend + Backend (Parallel) → QA Reviewer</p>
        </footer>
      </main>
    </div>
  );
      }
