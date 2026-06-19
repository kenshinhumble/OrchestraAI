import { NextRequest, NextResponse } from 'next/server';
import { orchestrate } from '@/lib/orchestrator';
import { OrchestrationState } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { input } = await req.json();

    if (!input || typeof input !== 'string') {
      return NextResponse.json({ error: 'Valid input string is required' }, { status: 400 });
    }

    // Karena orchestrator menggunakan callback onUpdate yang kompleks,
    // kita jalankan sampai selesai dan kembalikan state final.
    // Untuk streaming real-time, bisa diubah ke Server-Sent Events (SSE).
    const finalState = await new Promise<OrchestrationState>((resolve) => {
      orchestrate(input, (state) => {
        // State updates could be streamed here if using SSE
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
