export type AgentName = 'architect' | 'frontend' | 'backend' | 'qa';

export type AgentStatus = 'idle' | 'pending' | 'success' | 'error';

export interface AgentState {
  name: AgentName;
  status: AgentStatus;
  output: string | null;
  error: string | null;
}

export interface TechnicalSpec {
  features: string[];
  frontendSpec: string;
  backendSpec: string;
}

export interface GeneratedCode {
  frontend: string;
  backend: string;
}

export interface QAFeedback {
  status: 'pass' | 'fail';
  feedback: string;
  errors: string[];
}

export interface OrchestrationState {
  input: string;
  agents: Record<AgentName, AgentState>;
  specs: TechnicalSpec | null;
  code: GeneratedCode | null;
  qa: QAFeedback | null;
  loopCount: number;
  isRunning: boolean;
  finalOutput: GeneratedCode | null;
}
