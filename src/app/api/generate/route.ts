import { NextRequest, NextResponse } from 'next/server';
import { orchestrate } from '@/lib/orchestrator';
import { OrchestrationState } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Rate limiting sederhana berbasis memory (Hanya untuk demo/Vercel Serverless)
// Catatan: Di Vercel serverless, ini akan reset per instans cold start, 
// tapi cukup baik untuk memblokir spamming dasar.
const requestCounts = new Map<string, { count: number; lastRequest: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 menit
const MAX_REQUESTS_PER_MINUTE = 3; // Maksimal 3 generate per menit per IP

export async function POST(req: NextRequest) {
  try {
    // 1. Validasi Origin (Hanya izinkan dari domain Vercel Anda sendiri)
    const origin = req.headers.get('origin');
    const host = req.headers.get('host');
    
    // Ganti 'multi-agent-app-builder.vercel.app' dengan domain Vercel Anda yang sebenarnya
    // Atau biarkan cek host jika origin null (postman/api client)
    const allowedDomains = ['localhost:3000', 'multi-agent-app-builder.vercel.app']; // TAMBAHKAN DOMAIN VERCEL ANDA DI SINI
    if (origin && !allowedDomains.includes(new URL(origin).host)) {
      return NextResponse.json({ error: 'Unauthorized origin' }, { status: 403 });
    }

    // 2. Basic Rate Limiting
    const ip = req.headers.get('x-forwarded-for') || 'unknown-ip';
    const now = Date.now();
    const userRequests = requestCounts.get(ip);

    if (userRequests) {
      if (now - userRequests.lastRequest < RATE_LIMIT_WINDOW) {
        if (userRequests.count >= MAX_REQUESTS_PER_MINUTE) {
          return NextResponse.json(
            { error: 'Rate limit exceeded. Too many requests. Please wait a minute.' },
            { status: 429 }
          );
        }
        userRequests.count++;
      } else {
        // Reset counter jika window sudah lewat
        requestCounts.set(ip, { count: 1, lastRequest: now });
      }
    } else {
      requestCounts.set(ip, { count: 1, lastRequest: now });
    }

    // 3. Validasi Input
    const { input } = await req.json();

    if (!input || typeof input !== 'string' || input.trim().length < 5) {
      return NextResponse.json({ error: 'Valid input string (min 5 chars) is required' }, { status: 400 });
    }

    // Batasi panjang input untuk menghemat token LLM
    if (input.length > 500) {
      return NextResponse.json({ error: 'Input too long. Max 500 characters.' }, { status: 400 });
    }

    // 4. Jalankan Orchestrator
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
