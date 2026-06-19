import { callLLM, parseJSONResponse } from '../freemodel';
import { BACKEND_PROMPT } from '../prompts';
import { GeneratedCode, TechnicalSpec } from '../types';

export async function runBackendAgent(spec: TechnicalSpec): Promise<Pick<GeneratedCode, 'backend'>> {
  const specString = JSON.stringify(spec, null, 2);
  const response = await callLLM(BACKEND_PROMPT, `Technical Specification:\n${specString}`);
  return parseJSONResponse<Pick<GeneratedCode, 'backend'>>(response);
}
