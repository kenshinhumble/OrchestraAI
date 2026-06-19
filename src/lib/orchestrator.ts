// src/lib/orchestrator.ts

import { runArchitectAgent } from './agents/architect';
import { runFrontendAgent } from './agents/frontend';
import { runBackendAgent } from './agents/backend';
import { runQAAgent } from './agents/qa';
import {
  AgentName,
  AgentState,
  GeneratedCode,
  OrchestrationState,
} from './types';

const MAX_LOOPS = 2; // Turunkan max loop dari 3 ke 2 untuk mencegah timeout

function createInitialState(): OrchestrationState {
  const agentNames: AgentName[] = ['architect', 'frontend', 'backend', 'qa'];
  const agents = {} as Record<AgentName, AgentState>;
  agentNames.forEach((name) => {
    agents[name] = { name, status: 'idle', output: null, error: null };
  });
  return {
    input: '',
    agents,
    specs: null,
    code: null,
    qa: null,
    loopCount: 0,
    isRunning: false,
    finalOutput: null,
  };
}

export async function orchestrate(
  userInput: string,
  onUpdate: (state: OrchestrationState) => void
): Promise<OrchestrationState> {
  let state = createInitialState();
  state.input = userInput;
  state.isRunning = true;
  onUpdate({ ...state });

  try {
    while (state.loopCount < MAX_LOOPS) {
      state.loopCount += 1;
      onUpdate({ ...state });

      // --- ARCHITECT AGENT ---
      state.agents.architect.status = 'pending';
      onUpdate({ ...state });
      
      const specs = await runArchitectAgent(userInput);
      state.specs = specs;
      state.agents.architect.status = 'success';
      state.agents.architect.output = 'Specs generated';
      onUpdate({ ...state });

      // --- FRONTEND & BACKEND (PARALLEL) ---
      state.agents.frontend.status = 'pending';
      state.agents.backend.status = 'pending';
      onUpdate({ ...state });

      const [frontendResult, backendResult] = await Promise.all([
        runFrontendAgent(specs),
        runBackendAgent(specs)
      ]);

      state.code = {
        frontend: frontendResult.frontend,
        backend: backendResult.backend,
      };
      state.agents.frontend.status = 'success';
      state.agents.frontend.output = 'Code generated';
      state.agents.backend.status = 'success';
      state.agents.backend.output = 'Code generated';
      onUpdate({ ...state });

      // --- QA REVIEWER ---
      state.agents.qa.status = 'pending';
      onUpdate({ ...state });
      
      const qaResult = await runQAAgent(specs, state.code);
      state.qa = qaResult;
      state.agents.qa.output = 'Review complete';

      if (qaResult.status === 'pass') {
        state.agents.qa.status = 'success';
        state.finalOutput = state.code;
        state.isRunning = false;
        onUpdate({ ...state });
        return state;
      } else {
        state.agents.qa.status = 'error';
        state.agents.qa.error = qaResult.feedback;
        state.agents.frontend.status = 'idle';
        state.agents.backend.status = 'idle';
        state.agents.architect.status = 'idle';
        onUpdate({ ...state });
      }
    }

    state.isRunning = false;
    state.agents.qa.status = 'error';
    state.agents.qa.error = `Max loop (${MAX_LOOPS}) reached.`;
    onUpdate({ ...state });
    return state;

  } catch (error) {
    state.isRunning = false;
    const e = error as Error;
    if (state.agents.architect.status === 'pending') state.agents.architect.status = 'error';
    if (state.agents.frontend.status === 'pending') state.agents.frontend.status = 'error';
    if (state.agents.backend.status === 'pending') state.agents.backend.status = 'error';
    if (state.agents.qa.status === 'pending') state.agents.qa.status = 'error';
    
    state.agents.architect.error = e.message;
    onUpdate({ ...state });
    return state;
  }
}
      
