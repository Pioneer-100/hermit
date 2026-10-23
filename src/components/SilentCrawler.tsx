'use client';

import { useEffect, useRef } from 'react';
import { getAuthHeaders } from '@/lib/api-client';

export default function SilentCrawler() {
  const isCrawling = useRef(false);

  useEffect(() => {
    // Run a silent crawl every 4 hours (14400000 ms)
    // For testing/PoC purposes, we'll also run it once a few minutes after load
    const CRAWL_INTERVAL = 4 * 60 * 60 * 1000; // 4 hours

    const runSilentCrawl = async () => {
      if (isCrawling.current) return;
      isCrawling.current = true;
      try {
        console.log('[SilentCrawler] Initiating background crawl cycle...');
        // Crawl without specifying sourceId to trigger the default/all logic in the API
        await fetch('/api/crawl?category=all', {
          method: 'POST',
          headers: await getAuthHeaders()
        });
        console.log('[SilentCrawler] Background crawl cycle complete.');
      } catch (err) {
        console.error('[SilentCrawler] Error during background crawl:', err);
      } finally {
        isCrawling.current = false;
      }
    };

    const initialTimer = setTimeout(runSilentCrawl, 5 * 60 * 1000); // 5 minutes delay on first load
    const interval = setInterval(runSilentCrawl, CRAWL_INTERVAL);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);

  return null; // Invisible component
}
