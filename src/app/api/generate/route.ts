import { NextRequest, NextResponse } from 'next/server';
import { orchestrate } from '@/lib/orchestrator';
import { OrchestrationState } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input: string = body.input;

    if (!input || typeof input !== 'string' || input.trim().length < 5) {
      return NextResponse.json(
        { error: 'Valid input string (min 5 chars) is required' }, 
        { status: 400 }
      );
    }

    if (input.length > 500) {
      return NextResponse.json(
        { error: 'Input too long. Max 500 characters.' }, 
        { status: 400 }
      );
    }

    const finalState = await new Promise<OrchestrationState>((resolve, reject) => {
      orchestrate(input, () => {})
        .then(resolve)
        .catch(reject);
    });

    return NextResponse.json({ success: true, state: finalState });
    
  } catch (error) {
    console.error('Generation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to generate application', detail: errorMessage },
      { status: 500 }
    );
  }
}
