import { callLLM, parseJSONResponse } from '../freemodel';
import { FRONTEND_PROMPT } from '../prompts';
import { GeneratedCode, TechnicalSpec } from '../types';

export async function runFrontendAgent(spec: TechnicalSpec): Promise<Pick<GeneratedCode, 'frontend'>> {
  const specString = JSON.stringify(spec, null, 2);
  const response = await callLLM(FRONTEND_PROMPT, `Technical Specification:\n${specString}`);
  return parseJSONResponse<Pick<GeneratedCode, 'frontend'>>(response);
}
