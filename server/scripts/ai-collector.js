require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const SOURCES = [
  {
    id: 'github-trending',
    name: 'GitHub',
    type: 'github',
    url: 'https://api.github.com/search/repositories?q=stars:>1000+topic:learning+topic:tutorial&sort=stars&order=desc&per_page=10',
    headers: { 'Accept': 'application/vnd.github.v3+json' },
  },
  {
    id: 'github-trending-weekly',
    name: 'GitHub',
    type: 'github',
    url: 'https://api.github.com/search/repositories?q=created:>2026-01-01+stars:>100&sort=stars&order=desc&per_page=10',
    headers: { 'Accept': 'application/vnd.github.v3+json' },
  },
];

async function fetchFromSource(source) {
  console.log(`[collector] fetching ${source.id}...`);
  const res = await fetch(source.url, { headers: source.headers });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${source.id}`);
  return res.json();
}

async function extractWithAI(rawData, sourceType) {
  if (!OPENROUTER_API_KEY) {
    console.log('[collector] No OpenRouter key, using fallback...');
    return fallbackExtract(rawData, sourceType);
  }

  const prompt = `Extract learning resources from this JSON data. Return a JSON array of objects with fields: title, description, url, difficulty (beginner/intermediate/advanced), tags (array of strings), category (string). Only return valid JSON, nothing else.

Data: ${JSON.stringify(rawData).slice(0, 8000)}`;

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'openrouter/free',
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) throw new Error(`OpenRouter HTTP ${res.status}`);

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || '[]';
  
  try {
    return JSON.parse(content.replace(/```json|```/g, '').trim());
  } catch {
    console.log('[collector] AI response not JSON, using fallback');
    return fallbackExtract(rawData, sourceType);
  }
}

function fallbackExtract(rawData, sourceType) {
  if (sourceType === 'github') {
    return (rawData.items || []).map(item => ({
      title: item.full_name || item.name || 'Untitled',
      description: item.description || '',
      url: item.html_url || '',
      difficulty: item.language ? 'intermediate' : 'beginner',
      tags: [item.language, 'github'].filter(Boolean),
      category: 'programming',
    }));
  }
  return [];
}

async function storeResources(resources, sourceType, sourceName) {
  for (const r of resources) {
    if (!r.url) continue;
    try {
      await pool.query(`
        INSERT INTO resources (title, description, url, source_type, source_name, tags, category, difficulty, collected_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        ON CONFLICT (url) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          tags = EXCLUDED.tags,
          collected_at = NOW()
      `, [r.title, r.description, r.url, sourceType, sourceName, r.tags || [], r.category || 'uncategorized', r.difficulty || 'beginner']);
      console.log(`  ✓ ${r.title.slice(0, 50)}`);
    } catch (err) {
      console.error(`  ✗ ${r.title.slice(0, 50)}: ${err.message}`);
    }
  }
}

async function main() {
  console.log('=== AI Collector ===\n');

  for (const source of SOURCES) {
    try {
      const rawData = await fetchFromSource(source);
      console.log(`  fetched ${rawData.items?.length || 0} items`);

      const resources = await extractWithAI(rawData, source.type);
      console.log(`  extracted ${resources.length} resources`);

      await storeResources(resources, source.type, source.name);
    } catch (err) {
      console.error(`[error] ${source.id}: ${err.message}`);
    }
    console.log('');
  }

  await pool.end();
  console.log('=== Done ===');
}

main();