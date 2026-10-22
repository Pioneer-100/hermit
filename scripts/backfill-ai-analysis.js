const { createClient } = require('@supabase/supabase-js');

const url = 'https://cvomnupbkrbsedhzzbti.supabase.co';
const key = 'sb_publishable_6VK5kUVTamn8-T87dTQ-5g_bc0R776v';
const sb = createClient(url, key);

const apiKey = process.env.GEMINI_API_KEY;
const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`;

async function run() {
  const { data: articles, error } = await sb
    .from('articles')
    .select('id, headline, summary, source_name')
    .ilike('relevance_to_hermit', '%Potential impacts on project economics%')
    .order('id', { ascending: false })
    .limit(60);

  if (error || !articles) {
    console.error('Fetch error:', error);
    return;
  }

  console.log(`Found ${articles.length} articles with boilerplate template to update.`);

  for (const art of articles) {
    const promptText = `You are the Senior Energy Intelligence Analyst at Hermit Investments, a Zimbabwean renewable energy investment firm specializing in solar IPPs, commercial solar development, and grid integration.

Analyze this monitored article:
SOURCE: ${art.source_name}
HEADLINE: ${art.headline}
SUMMARY: ${art.summary || art.headline}

Return ONLY valid JSON with this exact structure:
{
  "relevance_to_hermit": "Personalized 2-3 sentence analysis of why this specific news directly impacts Hermit Investments solar project pipelines, PPA off-take, or grid connectivity in Zimbabwe.",
  "ai_impact_note": "Specific commercial and financial implications for Hermit Management and 2-3 concrete strategic actions.",
  "suggested_actions": ["Action 1", "Action 2", "Action 3"]
}`;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: { temperature: 0.2, responseMimeType: 'application/json' }
        })
      });

      if (res.ok) {
        const json = await res.json();
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const parsed = JSON.parse(text);
          const updateRes = await sb
            .from('articles')
            .update({
              relevance_to_hermit: parsed.relevance_to_hermit,
              ai_impact_note: parsed.ai_impact_note,
              suggested_actions: parsed.suggested_actions || []
            })
            .eq('id', art.id);

          if (!updateRes.error) {
            console.log(`Updated #${art.id}: "${art.headline.slice(0, 45)}..."`);
          } else {
            console.error(`Error updating #${art.id}:`, updateRes.error.message);
          }
        }
      } else {
        console.warn(`Gemini returned status ${res.status}`);
      }
    } catch (e) {
      console.warn(`Error on #${art.id}:`, e.message);
    }
  }

  console.log('Finished updating articles with personalized Gemini intelligence.');
}

run();
