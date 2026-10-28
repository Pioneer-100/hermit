import DashboardClient from '@/components/DashboardClient';
import { fetchArticles, getDashboardStats } from '@/lib/supabase';
import { synthesizeDailyBriefFromArticles } from '@/lib/brief-generator';
import { filterArticlesForDailyWindow } from '@/lib/daily-article-window';

// Server-side revalidation cadence (in seconds)
export const revalidate = 60;

export default async function DashboardPage() {
  const [articles, stats] = await Promise.all([
    fetchArticles({ limit: 50 }),
    getDashboardStats()
  ]);

  const recentArticles = filterArticlesForDailyWindow(articles);
  const dynamicBrief = synthesizeDailyBriefFromArticles(recentArticles);

  return (
    <DashboardClient
      initialArticles={recentArticles}
      initialStats={stats}
      initialDailyBrief={dynamicBrief}
    />
  );
}
