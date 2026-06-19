'use client';

import { AgentName, AgentState, OrchestrationState } from '@/lib/types';

const AGENT_CONFIG: Record<AgentName, { label: string; icon: string; color: string }> = {
  architect: { label: 'Architect', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', color: 'blue' },
  frontend: { label: 'Frontend Dev', icon: 'M7 8l-4 4 4 4m6-8l4 4-4 4', color: 'purple' },
  backend: { label: 'Backend Dev', icon: 'M5 12H3l4-4 4 4H9m6 0h2l4 4-4 4h-2', color: 'green' },
  qa: { label: 'QA Reviewer', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'orange' },
};

const STATUS_STYLES = {
  idle: { bg: 'bg-gray-100', text: 'text-gray-400', border: 'border-gray-200', dot: 'bg-gray-300' },
  pending: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-300', dot: 'bg-blue-500 animate-pulse' },
  success: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-300', dot: 'bg-green-500' },
  error: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-300', dot: 'bg-red-500' },
};

interface AgentTimelineProps {
  state: OrchestrationState | null;
}

export default function AgentTimeline({ state }: AgentTimelineProps) {
  const agentNames: AgentName[] = ['architect', 'frontend', 'backend', 'qa'];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Agent Timeline
        </h2>
        {state && state.loopCount > 0 && (
          <span className="text-xs font-medium px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full">
            Loop: {state.loopCount}
          </span>
        )}
      </div>

      <div className="space-y-4">
        {agentNames.map((name, idx) => {
          const config = AGENT_CONFIG[name];
          const agentState: AgentState | undefined = state?.agents[name];
          const status = agentState?.status || 'idle';
          const style = STATUS_STYLES[status];

          return (
            <div key={name} className="relative">
              {idx < agentNames.length - 1 && (
                <div className={`absolute left-5 top-12 w-0.5 h-8 ${status === 'success' ? 'bg-green-300' : 'bg-gray-200'}`} />
              )}
              <div className={`flex items-start gap-3 p-4 rounded-xl border-2 ${style.border} ${style.bg} transition-all duration-300`}>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${style.dot}`}>
                  {status === 'pending' && (
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                  {status === 'success' && (
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {status === 'error' && (
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  {status === 'idle' && (
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={config.icon} />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className={`text-sm font-semibold ${style.text}`}>{config.label}</h3>
                    <span className={`text-xs uppercase font-bold ${style.text} opacity-60`}>{status}</span>
                  </div>
                  {agentState?.error && (
                    <p className="text-xs text-red-500 mt-1 truncate">{agentState.error}</p>
                  )}
                  {agentState?.output && status === 'success' && name === 'qa' && state?.qa && (
                    <p className={`text-xs mt-1 ${state.qa.status === 'pass' ? 'text-green-500' : 'text-orange-500'}`}>
                      {state.qa.feedback}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
              }
