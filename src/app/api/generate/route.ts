import { NextRequest, NextResponse } from 'next/server';
import { orchestrate } from '@/lib/orchestrator';
import { OrchestrationState } from '@/lib/types';

// Ubah ke Edge Runtime untuk menghindari 10s timeout di Vercel Hobby
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // 1. Validasi Origin
    const origin = req.headers.get('origin');
    const host = req.headers.get('host');
    
    // DAFTARKAN DOMAIN VERCEL ANDA DI SINI (tanpa https://)
    // Dan biarkan localhost untuk testing di komputer Anda
    const allowedDomains = [
      'localhost:3000', 
      'multi-agent-app-builder.vercel.app' // GANTI DENGAN DOMAIN VERCEL ANDA YANG ASLI
    ];

    // Cek apakah request berasal dari domain yang diizinkan
    const isAllowedOrigin = !origin || allowedDomains.includes(new URL(origin).host);
    const isAllowedHost = !host || allowedDomains.includes(host);

    if (!isAllowedOrigin && !isAllowedHost) {
      console.error(`Blocked Origin/Host: ${origin} / ${host}`);
      return NextResponse.json({ error: 'Unauthorized origin' }, { status: 403 });
    }

    // 2. Validasi Input
    const { input } = await req.json();

    if (!input || typeof input !== 'string' || input.trim().length < 5) {
      return NextResponse.json({ error: 'Valid input string (min 5 chars) is required' }, { status: 400 });
    }

    if (input.length > 500) {
      return NextResponse.json({ error: 'Input too long. Max 500 characters.' }, { status: 400 });
    }

    // 3. Jalankan Orchestrator
    const finalState = await new Promise<OrchestrationState>((resolve) => {
      orchestrate(input, (state) => {
        // Bisa digunakan untuk streaming nantinya
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
