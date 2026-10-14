import DashboardClient from '@/components/DashboardClient';
import { fetchArticles, getDashboardStats } from '@/lib/supabase';
import { synthesizeDailyBriefFromArticles } from '@/lib/brief-generator';

// Server-side revalidation cadence (in seconds)
export const revalidate = 60;

export default async function DashboardPage() {
  const [articles, stats] = await Promise.all([
    fetchArticles({ limit: 50 }),
    getDashboardStats()
  ]);

  const dynamicBrief = synthesizeDailyBriefFromArticles(articles);

  return (
    <DashboardClient
      initialArticles={articles}
      initialStats={stats}
      initialDailyBrief={dynamicBrief}
    />
  );
}
