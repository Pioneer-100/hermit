import { MONITORED_SOURCES, SourceDefinition } from './sources';
import { getOrSetCache } from './cache';

/**
 * Intelligent Source Rotation Scheduler
 * Ensures crawls rotate dynamically across all 7 monitoring categories:
 * - Regulators (ZERA)
 * - National Newspapers (Herald, NewsDay, Chronicle, Fingaz)
 * - Government & Utilities (Ministry, ZESA, ZETDC)
 * - DFIs & Multilaterals (AfDB, IFC, World Bank)
 * - Regional Power & SADC (SAPP, ZRA)
 * - Renewables & Clean Tech (REAZ, SAWEA)
 * - International Energy Press (ESI Africa, PV Magazine)
 */

const ROTATION_CACHE_KEY = 'hermit_crawler_rotation_cursor';

// Priority source groupings to ensure high-impact portals are visited regularly
const HIGH_PRIORITY_SOURCE_IDS = [1, 2, 4, 12, 18, 23, 24]; // Herald, NewsDay, Sunday Mail, Ministry, ZERA, SAPP, AfDB

/**
 * Selects the next balanced batch of sources to crawl (default: 4 sources).
 * Rotates across categories to prevent clustering on a single source (e.g. ZERA).
 */
export async function getNextRotatingSources(batchSize: number = 4): Promise<SourceDefinition[]> {
  // Retrieve current cursor index from distributed cache or memory
  let cursor = 0;
  try {
    const cachedCursor = await getOrSetCache<number>(ROTATION_CACHE_KEY, 86400, async () => 0);
    cursor = typeof cachedCursor === 'number' ? cachedCursor : 0;
  } catch {
    cursor = 0;
  }

  // Pick 1 high-priority institutional source + (batchSize - 1) rotated sources
  const highPriorityPool = MONITORED_SOURCES.filter(s => HIGH_PRIORITY_SOURCE_IDS.includes(s.id));
  const selectedHigh = highPriorityPool[cursor % highPriorityPool.length];

  const remainingSources = MONITORED_SOURCES.filter(s => s.id !== selectedHigh.id);
  const rotatedBatch: SourceDefinition[] = [selectedHigh];

  for (let i = 0; i < batchSize - 1; i++) {
    const nextIndex = (cursor + i) % remainingSources.length;
    rotatedBatch.push(remainingSources[nextIndex]);
  }

  // Advance cursor for next invocation (wrapping around total sources)
  const nextCursor = (cursor + batchSize) % MONITORED_SOURCES.length;
  try {
    // Update cache with next cursor position
    await getOrSetCache<number>(ROTATION_CACHE_KEY, 86400, async () => nextCursor);
  } catch {
    // Ignore cache update errors
  }

  return rotatedBatch;
}
