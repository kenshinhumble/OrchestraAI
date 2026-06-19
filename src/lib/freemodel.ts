// Interface untuk pemanggilan LLM
export interface LLMConfig {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
}

// Fungsi simulasi untuk development tanpa API Key
export async function callLLM(
  systemPrompt: string,
  userPrompt: string,
  config?: LLMConfig
): Promise<string> {
  // Jika ada API key, gunakan pemanggilan nyata
  if (config?.apiKey) {
    const response = await fetch(`${config.baseUrl || 'https://api.openai.com/v1'}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });
    
    const data = await response.json();
    return data.choices[0].message.content;
  }

  // Simulasi response untuk development
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
  
  if (systemPrompt.includes('Architect')) {
    return JSON.stringify({
      features: ['Input Form', 'Data Display', 'Submit Button'],
      frontendSpec: 'Create a form with an input field, a submit button, and a display area for results using Tailwind CSS.',
      backendSpec: 'Create a POST API route at /api/process that accepts a string and returns a formatted response.',
    });
  }
  
  if (systemPrompt.includes('Frontend')) {
    return JSON.stringify({
      frontend: `import React, { useState } from 'react';\n\nexport default function GeneratedComponent() {\n  const [input, setInput] = useState('');\n  const [result, setResult] = useState('');\n  const handleSubmit = async (e: React.FormEvent) => {\n    e.preventDefault();\n    const res = await fetch('/api/process', { method: 'POST', body: JSON.stringify({ input }) });\n    const data = await res.json();\n    setResult(data.output);\n  };\n  return (\n    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg">\n      <h1 className="text-2xl font-bold mb-4 text-gray-800">Generated App</h1>\n      <form onSubmit={handleSubmit} className="space-y-4">\n        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Enter text..." />\n        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">Submit</button>\n      </form>\n      {result && <div className="mt-4 p-4 bg-gray-100 rounded-lg">{result}</div>}\n    </div>\n  );\n}`,
    });
  }
  
  if (systemPrompt.includes('Backend')) {
    return JSON.stringify({
      backend: `import { NextRequest, NextResponse } from 'next/server';\n\nexport async function POST(req: NextRequest) {\n  try {\n    const { input } = await req.json();\n    if (!input) return NextResponse.json({ error: 'Input required' }, { status: 400 });\n    const output = \`Processed: \${input.toUpperCase()}\`;\n    return NextResponse.json({ success: true, output });\n  } catch (e) {\n    return NextResponse.json({ error: 'Server error' }, { status: 500 });\n  }\n}`,
    });
  }
  
  if (systemPrompt.includes('QA')) {
    return JSON.stringify({
      status: 'pass',
      feedback: 'Code meets specifications with no critical issues.',
      errors: [],
    });
  }
  
  return '{}';
}

export function parseJSONResponse<T>(response: string): T {
  // Bersihkan response dari kemungkinan markdown code blocks
  const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned) as T;
}
