import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET() {
  const startTime = Date.now();
  let dbStatus = 'healthy';
  let dbLatencyMs = 0;

  try {
    const sb = getSupabaseClient();
    if (sb) {
      const dbStart = Date.now();
      const { error } = await sb.from('sources').select('id').limit(1);
      dbLatencyMs = Date.now() - dbStart;
      if (error) {
        dbStatus = 'degraded';
      }
    } else {
      dbStatus = 'unconfigured_fallback';
    }
  } catch {
    dbStatus = 'unreachable';
  }

  const status = dbStatus === 'unreachable' ? 503 : 200;

  return NextResponse.json(
    {
      status: status === 200 ? 'healthy' : 'unhealthy',
      version: '1.0.0',
      uptime_seconds: process.uptime(),
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: dbStatus,
          latency_ms: dbLatencyMs
        },
        ai_service: {
          status: process.env.GEMINI_API_KEY ? 'configured' : 'missing_key',
          model: 'gemini-3.5-flash-lite'
        }
      },
      total_response_time_ms: Date.now() - startTime
    },
    { status }
  );
}
