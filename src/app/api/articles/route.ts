import { NextRequest, NextResponse } from 'next/server';
import { fetchArticles, insertArticle } from '@/lib/supabase';
import { InsertArticleSchema } from '@/lib/schemas';
import { authenticateApiRequest } from '@/lib/api-auth';
import { checkRateLimit } from '@/lib/rate-limiter';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') || undefined;
  const relevance = searchParams.get('relevance') || undefined;
  const type = searchParams.get('type') || undefined;
  const search = searchParams.get('search') || undefined;
  const sourceId = searchParams.get('sourceId') ? Number(searchParams.get('sourceId')) : undefined;

  const articles = await fetchArticles({
    category,
    relevance,
    type,
    search,
    sourceId
  });

  return NextResponse.json({ articles, count: articles.length });
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateApiRequest(req);
    if (!auth.isAuthenticated) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
    }

    const clientId = auth.user?.id || req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rate = checkRateLimit(`article_insert_${clientId}`, 30, 0.5);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded for article insertion.' },
        { status: 429, headers: { 'Retry-After': String(rate.resetSeconds) } }
      );
    }

    const body = await req.json();
    const parsed = InsertArticleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const article = await insertArticle(parsed.data as any);
    return NextResponse.json({ article, success: true }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
