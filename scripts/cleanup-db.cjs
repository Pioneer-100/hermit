const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

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

// Replicate semantic gate rules
const HARD_EXCLUSION_PATTERNS = [
  {
    regex: /\b(struck\s+wife|poured\s+boiling\s+water|stabbed|murdered|manslaughter|saucepan|domestic\s+violence|homicide|rape|assaulted\s+his\s+wife|pleaded\s+guilty\s+to\s+attempted\s+murder)\b/i,
    category: 'violent_crime',
    reason: 'Violent crime / domestic incident unrelated to corporate energy or sustainability'
  },
  {
    regex: /\b(pours?\s+cold\s+water\s+on|recall\s+of\s+coltart|citizens\s+coalition\s+for\s+change|ccc\s+faction|disowned\s+correspondence|parliament\s+recalls?)\b/i,
    category: 'political_metaphor',
    reason: 'Political metaphor or party factional dispute without energy/sustainability relevance'
  },
  {
    regex: /\b(premier\s+league|champions\s+league|afcon|fifa|dynamos\s+fc|highlanders\s+fc|match\s+preview|hollywood|music\s+awards)\b/i,
    category: 'sports',
    reason: 'Sports or entertainment news'
  }
];

function evaluateSemanticFitness(headline, summary, relevanceToHermit, relevanceScore) {
  const combined = `${headline || ''} ${summary || ''}`.toLowerCase();

  for (const rule of HARD_EXCLUSION_PATTERNS) {
    if (rule.regex.test(combined)) {
      return {
        isFitToDisplay: false,
        rejectionCategory: rule.category,
        reason: rule.reason
      };
    }
  }

  if (relevanceToHermit) {
    const relLower = relevanceToHermit.toLowerCase();
    if (
      relLower.includes('no direct relevance') ||
      relLower.includes('no relevance') ||
      relLower.includes('not relevant to hermit') ||
      relLower.includes('irrelevant to hermit') ||
      relLower.includes('criminal matter') ||
      relLower.includes('does not impact energy')
    ) {
      return {
        isFitToDisplay: false,
        rejectionCategory: 'general_noise',
        reason: 'AI semantic analysis deduced zero relevance to Hermit Sustainability Advisory'
      };
    }
  }

  if (typeof relevanceScore === 'number' && relevanceScore < 0.35) {
    return {
      isFitToDisplay: false,
      rejectionCategory: 'general_noise',
      reason: `Relevance score (${relevanceScore}) is below minimum display threshold (0.35)`
    };
  }

  return { isFitToDisplay: true };
}

async function runAuditAndCleanup(shouldDelete = false) {
  console.log('Connecting to Supabase at:', env.NEXT_PUBLIC_SUPABASE_URL);
  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, headline, summary, relevance_to_hermit, relevance_score, article_type, source_id, publication_date')
    .order('id', { ascending: true });

  if (error) {
    console.error('Error fetching articles:', error);
    process.exit(1);
  }

  console.log(`Retrieved ${articles.length} total articles from database.\n`);

  const rejected = [];
  const accepted = [];

  for (const art of articles) {
    const fitResult = evaluateSemanticFitness(
      art.headline,
      art.summary,
      art.relevance_to_hermit,
      art.relevance_score
    );

    if (!fitResult.isFitToDisplay) {
      rejected.push({ article: art, gate: fitResult });
    } else {
      accepted.push(art);
    }
  }

  console.log(`=== AUDIT SUMMARY ===`);
  console.log(`Total Articles : ${articles.length}`);
  console.log(`Fit To Display : ${accepted.length}`);
  console.log(`Failed Gate    : ${rejected.length}\n`);

  if (rejected.length > 0) {
    console.log(`--- REJECTED ARTICLES ---`);
    for (const r of rejected) {
      console.log(`[ID ${r.article.id}] [Score: ${r.article.relevance_score}] "${r.article.headline}"`);
      console.log(`   Reason: ${r.gate.reason} (${r.gate.rejectionCategory})`);
    }
    console.log('');

    if (shouldDelete) {
      console.log(`Deleting ${rejected.length} rejected articles from database...`);
      const idsToDelete = rejected.map(r => r.article.id);
      const { error: delError } = await supabase
        .from('articles')
        .delete()
        .in('id', idsToDelete);

      if (delError) {
        console.error('Failed to delete articles:', delError);
        process.exit(1);
      } else {
        console.log(`Successfully deleted ${idsToDelete.length} articles!`);
        process.exit(0);
      }
    } else {
      console.log(`Dry run complete. Run with --delete flag to execute deletion.`);
      process.exit(0);
    }
  } else {
    console.log('All articles passed semantic gate inspection! No cleanup required.');
    process.exit(0);
  }
}

const isDelete = process.argv.includes('--delete');
runAuditAndCleanup(isDelete);
