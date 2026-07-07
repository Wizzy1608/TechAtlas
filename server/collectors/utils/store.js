const pool = require('../../db/pool');

async function storeResources(resources, sourceType, sourceName, domain, domainIcon) {
  let count = 0;
  for (const r of resources) {
    if (!r.url) continue;
    try {
      await pool.query(`
        const { classifyResource } = require('../../classifier');

// Inside the loop, before pool.query:
if (!domain) {
  const result = classifyResource(r);
  if (result.domain) {
    r.domain = result.domain;
    r.domain_icon = result.icon;
    r.classification_method = result.method;
    r.classification_score = result.confidence;
  }
}
        INSERT INTO resources (title, description, url, source_type, source_name, tags, category, difficulty, domain, domain_icon, collected_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
        ON CONFLICT (url) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          tags = EXCLUDED.tags,
          domain = EXCLUDED.domain,
          domain_icon = EXCLUDED.domain_icon,
          collected_at = NOW()
      `, [r.title, r.description, r.url, sourceType, sourceName, r.tags || [], r.category || 'uncategorized', r.difficulty || 'beginner', domain || r.domain || null, domainIcon || r.domain_icon || null]);
      count++;
    } catch (err) {
      console.error(`  ✗ store: ${err.message}`);
    }
  }
  return count;
}

async function updateLastFetched(sourceConfigId) {
  await pool.query('UPDATE source_configs SET last_fetched_at = NOW() WHERE id = $1', [sourceConfigId]);
}

module.exports = { storeResources, updateLastFetched };