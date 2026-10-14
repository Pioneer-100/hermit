import FeedClient from '@/components/FeedClient';
import { fetchArticles } from '@/lib/supabase';

export const revalidate = 60;

export default async function FeedPage() {
  const articles = await fetchArticles();

  return (
    <FeedClient initialArticles={articles} />
  );
}
