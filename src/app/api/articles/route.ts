import { NextRequest, NextResponse } from 'next/server';
import { fetchArticles, insertArticle } from '@/lib/supabase';

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
    const body = await req.json();
    const article = await insertArticle(body);
    return NextResponse.json({ article, success: true }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
