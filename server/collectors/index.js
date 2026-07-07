const pool = require('../db/pool');
const path = require('path');
const { storeResources, updateLastFetched } = require('./utils/store');
const { reclassifyAll } = require('../classifier');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const FETCHERS_DIR = path.join(__dirname, 'fetchers');
const fetcherCache = {};

function loadFetcher(sourceType) {
  if (fetcherCache[sourceType]) return fetcherCache[sourceType];
  try {
    fetcherCache[sourceType] = require(path.join(FETCHERS_DIR, sourceType));
    return fetcherCache[sourceType];
  } catch {
    return null;
  }
}

const FALLBACK_SOURCES = [
  {
    id: null, name: 'GitHub', source_type: 'github-topic',
    config: { topic: 'learning', stars: '>1000', sort: 'stars', order: 'desc', per_page: 10 },
    topics: [{ name: 'programming', domain: null, domain_icon: null }],
  },
  {
    id: null, name: 'GitHub', source_type: 'github-topic',
    config: { topic: 'tutorial', stars: '>100', sort: 'stars', order: 'desc', per_page: 10, created: '>2026-01-01' },
    topics: [{ name: 'programming', domain: null, domain_icon: null }],
  },
];

async function getSourcesFromDB() {
  try {
    const { rows } = await pool.query(`
      SELECT sc.*, COALESCE(
        json_agg(json_build_object('name', t.name, 'domain', t.domain, 'domain_icon', t.domain_icon))
        FILTER (WHERE t.id IS NOT NULL), '[]'
      ) AS topics
      FROM source_configs sc
      LEFT JOIN source_topics st ON st.source_id = sc.id
      LEFT JOIN topics t ON t.id = st.topic_id
      WHERE sc.is_active = true
      GROUP BY sc.id
    `);
    return rows.length > 0 ? rows : null;
  } catch {
    return null;
  }
}

async function fetchFromSource(sourceConfig) {
  const fetcher = loadFetcher(sourceConfig.source_type);

  if (!fetcher || typeof fetcher.fetch !== 'function') {
    console.log(`  no fetcher for type "${sourceConfig.source_type}", skipping`);
    return [];
  }

  // Get the configuration from the database
  let config = sourceConfig.config || {};

  // If PostgreSQL returned JSON as a string, parse it
  if (typeof config === 'string') {
    try {
      config = JSON.parse(config);
    } catch (err) {
      throw new Error(`Invalid JSON config for ${sourceConfig.name}`);
    }
  }


  const raw = await fetcher.fetch(config);

  console.log(`  fetched ${raw.length} raw items from ${sourceConfig.name}`);

  return raw;
}

async function extractWithAI(rawData) {
  if (!OPENROUTER_API_KEY) {
    return fallbackExtract(rawData);
  }
  const prompt = `Extract learning resources from this JSON data. Return a JSON array of objects with fields: title, description, url, difficulty (beginner/intermediate/advanced), tags (array of strings), category (string). Only return valid JSON, nothing else.\n\nData: ${JSON.stringify(rawData).slice(0, 8000)}`;

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${OPENROUTER_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'openrouter/free', messages: [{ role: 'user', content: prompt }] }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '[]';
    const parsed = JSON.parse(content.replace(/```json|```/g, '').trim());
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch (err) {
    console.log(`  AI extract failed (${err.message}), using fallback`);
  }
  return fallbackExtract(rawData);
}

function fallbackExtract(rawData) {
  if (Array.isArray(rawData)) return rawData;
  if (rawData.items) return (rawData.items || []).map(item => ({
    title: item.full_name || item.name || 'Untitled',
    description: item.description || '',
    url: item.html_url || '',
    difficulty: item.language ? 'intermediate' : 'beginner',
    tags: [item.language, 'github'].filter(Boolean),
    category: 'programming',
  }));
  return [];
}

async function runCollector() {
  console.log('=== TechAtlas Collector ===\n');

  let sources = await getSourcesFromDB();
  if (!sources) {
    console.log('DB sources not available, using fallback...\n');
    sources = FALLBACK_SOURCES;
  } else {
    console.log(`Loaded ${sources.length} sources from DB\n`);
  }

  for (const source of sources) {
    console.log(`[${source.name}] ${source.source_type}${source.id ? ' (' + source.id + ')' : ''}`);
    try {
      const rawItems = await fetchFromSource(source);
      if (rawItems.length === 0) continue;

      const resources = await extractWithAI(rawItems);
      console.log(`  extracted ${resources.length} resources`);

      const domain = source.topics?.[0]?.domain || null;
      const domainIcon = source.topics?.[0]?.domain_icon || null;
      const stored = await storeResources(resources, source.source_type, source.name, domain, domainIcon);

      if (source.id && stored > 0) {
        await updateLastFetched(source.id);
      }
      console.log(`  stored ${stored} resources`);
    } catch (err) {
      console.error(`  [error] ${err.message}`);
    }
    console.log('');
  }

  await reclassifyAll();
  
  console.log('=== Done ===');
}

module.exports = { runCollector };