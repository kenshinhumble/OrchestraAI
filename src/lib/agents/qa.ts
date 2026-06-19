import { callLLM, parseJSONResponse } from '../freemodel';
import { QA_PROMPT } from '../prompts';
import { GeneratedCode, QAFeedback, TechnicalSpec } from '../types';

export async function runQAAgent(spec: TechnicalSpec, code: GeneratedCode): Promise<QAFeedback> {
  const reviewInput = JSON.stringify({ spec, code }, null, 2);
  const response = await callLLM(QA_PROMPT, `Review the following code against the specification:\n${reviewInput}`);
  return parseJSONResponse<QAFeedback>(response);
}
