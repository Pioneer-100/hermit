import { NextResponse } from 'next/server';
import { getTrendAnalytics } from '@/lib/supabase';

export async function GET() {
  try {
    const analytics = await getTrendAnalytics();
    return NextResponse.json({ analytics });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
