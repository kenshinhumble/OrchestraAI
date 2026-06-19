import { callLLM, parseJSONResponse } from '../freemodel';
import { ARCHITECT_PROMPT } from '../prompts';
import { TechnicalSpec } from '../types';

export async function runArchitectAgent(userInput: string): Promise<TechnicalSpec> {
  const response = await callLLM(ARCHITECT_PROMPT, `User Request: ${userInput}`);
  return parseJSONResponse<TechnicalSpec>(response);
}
