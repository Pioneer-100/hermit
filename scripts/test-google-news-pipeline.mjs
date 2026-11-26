/**
 * test-google-news-pipeline.mjs
 * 
 * Standalone smoke-test for the HERMIT Google News / SerpApi pipeline.
 * Tests every query in GOOGLE_NEWS_SEARCHES and reports hit counts + sample headlines.
 * 
 * Run: node scripts/test-google-news-pipeline.mjs
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// ── Load .env.local manually (no dotenv dependency needed) ─────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '..', '.env.local');
try {
  const envContent = readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
} catch {
  console.error('⚠️  Could not read .env.local — ensure SERPAPI_API_KEY is set in environment.');
}

const SERPAPI_KEY = process.env.SERPAPI_API_KEY;
if (!SERPAPI_KEY) {
  console.error('❌ SERPAPI_API_KEY not found. Aborting.');
  process.exit(1);
}

// ── Mirror of GOOGLE_NEWS_SEARCHES from crawler-service.ts ────────────────────
const GOOGLE_NEWS_SEARCHES = [
  {
    name: 'Google News — Zimbabwe National Press Energy',
    category: 'newspapers',
    query: '("The Herald" OR "Herald Zimbabwe" OR "ZBC" OR "The Chronicle" OR "NewsDay") Zimbabwe (energy OR solar OR ZESA OR ZERA OR Kariba OR loadshedding OR electricity OR REA OR "power generation")',
  },
  {
    name: 'Google News — Zimbabwe Green Energy, Solar & IPPs',
    category: 'renewables',
    query: 'Zimbabwe ("renewable energy" OR "solar energy" OR "solar farm" OR "solar plant" OR "captive power" OR "rooftop solar" OR "mini-grid" OR "clean energy" OR "independent power producer" OR IPP OR "net metering" OR "ZERA license" OR BESS OR "battery storage" OR "green energy")',
  },
  {
    name: 'Google News — Zimbabwe Hydro, Dam Levels & Grid Stability',
    category: 'renewables',
    query: 'Zimbabwe (Kariba OR "Zambezi River Authority" OR ZRA OR "Hwange" OR "power generation" OR "grid stability" OR SAPP OR "ZETDC" OR "rural electrification")',
  },
  {
    name: 'Google News — ZPC Daily Power Generation Stats',
    category: 'regulators',
    query: '("Zimbabwe Power Company" OR ZPC) ("daily generation" OR "power output" OR "MW" OR "Kariba output" OR "Hwange output" OR "generation capacity" OR "power station" OR "total generation")',
  },
  {
    name: 'Google News — ZRA Kariba Water Levels & Zambezi Hydrology',
    category: 'regulators',
    query: '("Zambezi River Authority" OR ZRA OR "Kariba Dam") ("water level" OR "reservoir level" OR "inflow" OR "outflow" OR "storage" OR "hydrological" OR "Zambezi flow" OR "dam elevation" OR "masl")',
  },
  {
    name: 'Google News — ZINWA River Flows & National Water Reports',
    category: 'nexus_waste',
    query: '(ZINWA OR "Zimbabwe National Water Authority") ("river flow" OR "catchment" OR "dam level" OR "water allocation" OR "hydrological report" OR "water resources" OR "Manyame" OR "Save River" OR "Limpopo" OR "water balance")',
  },
  // ── New LinkedIn funding queries ─────────────────────────────────────────────
  {
    name: 'LinkedIn — DFI & Multilateral Funding Calls (Zimbabwe / SADC)',
    category: 'dfi',
    searchMode: 'web',
    query: 'site:linkedin.com ("call for proposals" OR "funding opportunity" OR "grant window" OR "open for applications" OR "applications now open" OR "request for proposals" OR "expression of interest") (Zimbabwe OR "Southern Africa" OR SADC OR "sub-Saharan Africa") (renewable energy OR solar OR "clean energy" OR "climate finance" OR "green energy" OR "energy transition" OR IPP OR "mini-grid")',
  },
  {
    name: 'LinkedIn — AfDB, IFC, GCF & SEFA Funding Announcements',
    category: 'dfi',
    searchMode: 'web',
    query: 'site:linkedin.com (AfDB OR "African Development Bank" OR IFC OR "International Finance Corporation" OR "Green Climate Fund" OR GCF OR SEFA OR "Sustainable Energy Fund for Africa" OR "Africa GreenCo" OR SACREEE OR TDB OR Afreximbank) (funding OR grant OR "co-financing" OR investment OR facility OR "project preparation") (energy OR solar OR renewable OR climate) (Zimbabwe OR "Southern Africa")',
  },
  {
    name: 'LinkedIn — Zimbabwe Energy Investors & IPP Funding News',
    category: 'tenders_events',
    searchMode: 'web',
    query: 'site:linkedin.com (Zimbabwe OR Harare OR ZERA OR "Zimbabwe Energy" OR "Centragrid" OR SolGas OR "Africa GreenCo") (investment OR funding OR financing OR "power purchase agreement" OR PPA OR solar OR "renewable energy" OR tender OR "call for bids") (2025 OR 2026)',
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function truncate(str, max = 90) {
  if (!str) return '(no text)';
  return str.length > max ? str.slice(0, max - 1) + '…' : str;
}

function extractDateFromLinkedInUrl(url) {
  if (!url) return undefined;
  const match =
    url.match(/(?:activity|urn:li:activity|urn:li:share)[-_:]+(\d{18,20})/i) ||
    url.match(/[-_](\d{18,20})(?:-[a-zA-Z0-9_-]+)?(?:\?|\/|$)/);

  if (match) {
    try {
      const id = BigInt(match[1]);
      const ms = Number(id >> BigInt(22));
      const nowMs = Date.now();
      if (ms > 1577836800000 && ms < nowMs + 86400000 * 2) {
        return new Date(ms).toISOString();
      }
    } catch {}
  }
  return undefined;
}

function resolvePublicationDate(r) {
  if (r.link && r.link.includes('linkedin.com')) {
    const liDate = extractDateFromLinkedInUrl(r.link);
    if (liDate) return { date: liDate, source: 'LinkedIn Snowflake ID' };
  }
  if (r.date) {
    const parsed = parseDateString(r.date);
    if (parsed) return { date: parsed, source: 'Search Result' };
  }
  return { date: undefined, source: 'None' };
}

function parseDateString(date) {
  if (!date) return undefined;
  const trimmed = date.trim();
  const m = trimmed.match(/^(\d+)\s+(minute|hour|day|week|month|year)s?\s+ago$/i);
  if (m) {
    const amt = Number(m[1]);
    const u = m[2].toLowerCase();
    const map = { minute: 60000, hour: 3600000, day: 86400000, week: 604800000, month: 2592000000, year: 31536000000 };
    return new Date(Date.now() - amt * (map[u] || 86400000)).toISOString();
  }
  const s = trimmed.match(/^a\s+(minute|hour|day|week|month|year)\s+ago$/i);
  if (s) {
    const u = s[1].toLowerCase();
    const map = { minute: 60000, hour: 3600000, day: 86400000, week: 604800000, month: 2592000000, year: 31536000000 };
    return new Date(Date.now() - (map[u] || 86400000)).toISOString();
  }
  if (/^yesterday$/i.test(trimmed)) return new Date(Date.now() - 86400000).toISOString();
  const d = new Date(trimmed);
  return isNaN(d.getTime()) ? undefined : d.toISOString();
}

function relativeDate(dateStr) {
  if (!dateStr) return 'unknown date';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const diffMs = Date.now() - d.getTime();
  const diffH = Math.floor(diffMs / 3_600_000);
  if (diffH < 1) return 'just now';
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 30) return `${diffD}d ago`;
  const diffM = Math.floor(diffD / 30);
  return `${diffM}mo ago`;
}

const PASS = '\x1b[32m✔\x1b[0m';
const FAIL = '\x1b[31m✘\x1b[0m';
const WARN = '\x1b[33m⚠\x1b[0m';
const DIM  = '\x1b[2m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

// ── Main test runner ──────────────────────────────────────────────────────────
async function testQuery(search, index, total) {
  const label = `[${index + 1}/${total}]`;
  const isWebSearch = search.searchMode === 'web';
  const modeTag = isWebSearch ? '\x1b[35m[web]\x1b[0m' : '\x1b[34m[news]\x1b[0m';
  process.stdout.write(`${BOLD}${label}${RESET} ${modeTag} ${search.name} … `);

  // Build params — web mode omits tbm=nws (site: operator incompatible with News tab)
  const paramObj = {
    engine: 'google',
    q: search.query,
    hl: 'en',
    gl: 'zw',
    num: '10',
    api_key: SERPAPI_KEY,
  };
  if (isWebSearch) {
    paramObj.tbs = 'qdr:m';   // last 30 days — enough LinkedIn post coverage
  } else {
    paramObj.tbm = 'nws';
    paramObj.tbs = 'qdr:w';   // last 7 days (wider window for testing)
  }

  const url = `https://serpapi.com/search.json?${new URLSearchParams(paramObj)}`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(20_000) });
    if (!res.ok) {
      console.log(`${FAIL} HTTP ${res.status}`);
      return { name: search.name, hits: 0, error: `HTTP ${res.status}` };
    }

    const data = await res.json();

    if (data.error) {
      console.log(`${WARN} SerpApi error: ${data.error}`);
      return { name: search.name, hits: 0, error: data.error };
    }

    // Pick the right result array based on mode
    const results = isWebSearch
      ? (data.organic_results || [])
      : (data.news_results || []);
    const hits = results.length;

    if (hits === 0) {
      console.log(`${WARN} 0 results`);
    } else {
      console.log(`${PASS} ${BOLD}${hits} result${hits !== 1 ? 's' : ''}${RESET}`);
      // Print up to 3 sample headlines
      for (const r of results.slice(0, 3)) {
        const resolved = resolvePublicationDate(r);
        const age = relativeDate(resolved.date);
        const src = r.source || r.displayed_link || '';
        const tag = resolved.source === 'LinkedIn Snowflake ID' ? '\x1b[32m[ID: ' + age + ']\x1b[0m' : `\x1b[36m[${age}]\x1b[0m`;
        console.log(
          `    ${DIM}${truncate(r.title, 80)}${RESET}`,
          tag,
          `${DIM}(${resolved.source})${RESET}`
        );
      }
      if (hits > 3) {
        console.log(`    ${DIM}… and ${hits - 3} more${RESET}`);
      }
    }
    console.log();

    return { name: search.name, category: search.category, hits, results };
  } catch (err) {
    console.log(`${FAIL} ${err.message}`);
    console.log();
    return { name: search.name, hits: 0, error: err.message };
  }
}

async function main() {
  console.log();
  console.log(`${BOLD}═══════════════════════════════════════════════════════════════${RESET}`);
  console.log(`${BOLD}  HERMIT — Google News Pipeline Test  ${RESET}`);
  console.log(`${BOLD}  SerpApi key: ${SERPAPI_KEY.slice(0, 8)}…  |  ${new Date().toISOString()}${RESET}`);
  console.log(`${BOLD}═══════════════════════════════════════════════════════════════${RESET}`);
  console.log();

  const summaries = [];
  for (let i = 0; i < GOOGLE_NEWS_SEARCHES.length; i++) {
    const result = await testQuery(GOOGLE_NEWS_SEARCHES[i], i, GOOGLE_NEWS_SEARCHES.length);
    summaries.push(result);
    // Small polite delay between requests (avoid SerpApi burst limit)
    if (i < GOOGLE_NEWS_SEARCHES.length - 1) {
      await new Promise(r => setTimeout(r, 1200));
    }
  }

  // ── Summary table ─────────────────────────────────────────────────────────
  console.log(`${BOLD}── Summary ─────────────────────────────────────────────────────${RESET}`);
  const totalHits = summaries.reduce((acc, s) => acc + s.hits, 0);
  const passing   = summaries.filter(s => s.hits > 0).length;
  const failing   = summaries.filter(s => s.hits === 0).length;

  for (const s of summaries) {
    const icon = s.hits > 0 ? PASS : (s.error ? FAIL : WARN);
    const hitsStr = s.hits > 0 ? `\x1b[32m${s.hits} hits\x1b[0m` : (s.error ? `\x1b[31m${s.error}\x1b[0m` : '\x1b[33m0 hits\x1b[0m`');
    console.log(`  ${icon}  ${truncate(s.name, 55).padEnd(57)} ${hitsStr}`);
  }

  console.log();
  console.log(`  Total queries : ${GOOGLE_NEWS_SEARCHES.length}`);
  console.log(`  Yielding data : \x1b[32m${passing}\x1b[0m`);
  console.log(`  Empty / error : ${failing > 0 ? `\x1b[31m${failing}\x1b[0m` : failing}`);
  console.log(`  Total hits    : ${BOLD}${totalHits}${RESET}`);
  console.log();

  if (failing === 0) {
    console.log(`${PASS} ${BOLD}All queries returning results. Pipeline is healthy.${RESET}`);
  } else if (passing > 0) {
    console.log(`${WARN} ${BOLD}Some queries returned 0 results — check query wording or widen time window.${RESET}`);
  } else {
    console.log(`${FAIL} ${BOLD}No queries returned results — verify SERPAPI_API_KEY and network access.${RESET}`);
  }
  console.log();
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
