import { NextRequest, NextResponse } from 'next/server';
import { fetchArticleById, updateArticleReview } from '@/lib/supabase';
import { authenticateApiRequest } from '@/lib/api-auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const article = await fetchArticleById(Number(id));
  if (!article) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 });
  }
  return NextResponse.json({ article });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateApiRequest(req);
  if (!auth.isAuthenticated) {
    return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const reviewed = Boolean(body.is_reviewed);
  const success = await updateArticleReview(Number(id), reviewed);
  return NextResponse.json({ success, is_reviewed: reviewed });
}
