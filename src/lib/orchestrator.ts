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

const MAX_LOOPS = 3;

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

      // --- 1. ARCHITECT AGENT ---
      state.agents.architect.status = 'pending';
      onUpdate({ ...state });
      
      try {
        const specs = await runArchitectAgent(userInput);
        state.specs = specs;
        state.agents.architect.status = 'success';
        state.agents.architect.output = JSON.stringify(specs, null, 2);
      } catch (e) {
        state.agents.architect.status = 'error';
        state.agents.architect.error = (e as Error).message;
        state.isRunning = false;
        onUpdate({ ...state });
        return state;
      }
      onUpdate({ ...state });

      // --- 2. FRONTEND & BACKEND (PARALLEL) ---
      state.agents.frontend.status = 'pending';
      state.agents.backend.status = 'pending';
      onUpdate({ ...state });

      try {
        const [frontendResult, backendResult] = await Promise.all([
          runFrontendAgent(state.specs!),
          runBackendAgent(state.specs!)
        ]);

        state.code = {
          frontend: frontendResult.frontend,
          backend: backendResult.backend,
        };
        state.agents.frontend.status = 'success';
        state.agents.frontend.output = frontendResult.frontend;
        state.agents.backend.status = 'success';
        state.agents.backend.output = backendResult.backend;
      } catch (e) {
        state.agents.frontend.status = 'error';
        state.agents.backend.status = 'error';
        state.agents.frontend.error = (e as Error).message;
        state.isRunning = false;
        onUpdate({ ...state });
        return state;
      }
      onUpdate({ ...state });

      // --- 3. QA REVIEWER ---
      state.agents.qa.status = 'pending';
      onUpdate({ ...state });
      
      try {
        const qaResult = await runQAAgent(state.specs!, state.code!);
        state.qa = qaResult;
        state.agents.qa.output = JSON.stringify(qaResult, null, 2);

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
      } catch (e) {
        state.agents.qa.status = 'error';
        state.agents.qa.error = (e as Error).message;
        state.isRunning = false;
        onUpdate({ ...state });
        return state;
      }
    }

    // Jika melebihi MAX_LOOPS
    state.isRunning = false;
    state.agents.qa.status = 'error';
    state.agents.qa.error = `Max loop count (${MAX_LOOPS}) exceeded. Manual review required.`;
    onUpdate({ ...state });
    return state;

  } catch (error) {
    state.isRunning = false;
    onUpdate({ ...state });
    return state;
  }
}
