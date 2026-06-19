import { NextRequest, NextResponse } from 'next/server';
import { orchestrate } from '@/lib/orchestrator';
import { OrchestrationState } from '@/lib/types';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // 1. Validasi Input
    const { input } = await req.json();

    if (!input || typeof input !== 'string' || input.trim().length < 5) {
      return NextResponse.json(
        { error: 'Valid input string (min 5 chars) is required' }, 
        { status: 400 }
      );
    }

    // Batasi panjang input untuk mencegah penyalahgunaan token
    if (input.length > 500) {
      return NextResponse.json(
        { error: 'Input too long. Max 500 characters.' }, 
        { status: 400 }
      );
    }

    // 2. Jalankan Orchestrator
    const finalState = await new Promise<OrchestrationState>((resolve) => {
      orchestrate(input, (state) => {
        // State updates bisa digunakan untuk streaming SSE nantinya
      }).then(resolve);
    });

    return NextResponse.json({ success: true, state: finalState });
    
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate application', detail: (error as Error).message },
      { status: 500 }
    );
  }
}
