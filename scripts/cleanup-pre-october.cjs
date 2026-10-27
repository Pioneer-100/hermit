const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment from .env.local
function loadEnv() {
  const env = {};
  const fullPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(fullPath)) {
    const lines = fs.readFileSync(fullPath, 'utf8').split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        env[key] = val;
      }
    }
  }
  return env;
}

const env = loadEnv();
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const CUTOFF_DATE = new Date('2026-10-01T00:00:00.000Z');

async function auditDateCutoff(shouldDelete = false) {
  console.log(`Evaluating database records against cutoff: >= October 1, 2026`);
  console.log(`Connecting to: ${env.NEXT_PUBLIC_SUPABASE_URL}\n`);

  // Fetch articles
  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, headline, publication_date, captured_at')
    .order('id', { ascending: true });

  if (error) {
    console.error('Error querying articles:', error);
    process.exit(1);
  }

  console.log(`Total articles found: ${articles.length}`);

  const outdated = [];
  const valid = [];

  for (const art of articles) {
    // Determine effective article date (published date preferred, fallback to captured_at)
    const rawDate = art.publication_date || art.captured_at;
    const dateObj = rawDate ? new Date(rawDate) : null;

    if (!dateObj || isNaN(dateObj.getTime()) || dateObj < CUTOFF_DATE) {
      outdated.push({
        id: art.id,
        headline: art.headline,
        effectiveDate: rawDate || 'UNKNOWN',
        parsedDate: dateObj ? dateObj.toISOString() : null
      });
    } else {
      valid.push(art);
    }
  }

  console.log(`\n=== DATE AUDIT SUMMARY ===`);
  console.log(`Total Articles : ${articles.length}`);
  console.log(`Valid (>= 1 Oct): ${valid.length}`);
  console.log(`Outdated (< 1 Oct): ${outdated.length}\n`);

  if (outdated.length > 0) {
    console.log(`--- OUTDATED ARTICLES IDENTIFIED (${outdated.length}) ---`);
    outdated.forEach((item, idx) => {
      if (idx < 20 || idx >= outdated.length - 5) {
        console.log(`[ID ${item.id}] [Date: ${item.effectiveDate}] "${item.headline.slice(0, 70)}..."`);
      } else if (idx === 20) {
        console.log(`... and ${outdated.length - 25} more ...`);
      }
    });

    if (shouldDelete) {
      console.log(`\nDeleting ${outdated.length} outdated articles from Supabase...`);
      const idsToDelete = outdated.map(o => o.id);

      // Delete in chunks of 50 to avoid any URL/payload limit issues
      const chunkSize = 50;
      let deletedCount = 0;
      for (let i = 0; i < idsToDelete.length; i += chunkSize) {
        const chunk = idsToDelete.slice(i, i + chunkSize);
        const { error: delError } = await supabase
          .from('articles')
          .delete()
          .in('id', chunk);

        if (delError) {
          console.error(`Failed to delete batch ${i}-${i + chunk.length}:`, delError);
          process.exit(1);
        }
        deletedCount += chunk.length;
      }

      console.log(`Successfully deleted ${deletedCount} articles dated prior to 1 October 2026!`);
      process.exit(0);
    } else {
      console.log(`\nDry run complete. Run with --delete flag to execute deletion.`);
      process.exit(0);
    }
  } else {
    console.log(`All articles in database are dated on or after 1 October 2026! Zero deletions required.`);
    process.exit(0);
  }
}

const isDelete = process.argv.includes('--delete');
auditDateCutoff(isDelete);
