const { XMLParser } = require('fast-xml-parser');

async function fetchRSS(config = {}) {
  const { url: feedUrl } = config;

  if (!feedUrl) {
    throw new Error('rss: url required');
  }

  const res = await globalThis.fetch(feedUrl);

  if (!res.ok) {
    throw new Error(`RSS HTTP ${res.status}`);
  }

  const xml = await res.text();

  const parser = new XMLParser({
    ignoreAttributes: false,
  });

  const data = parser.parse(xml);

  const channel = data.rss?.channel || data.feed || {};
  const items = channel.item || channel.entry || [];

  return (Array.isArray(items) ? items : [items]).map(item => ({
    title: item.title || '',
    description: (item.description || item.summary || '')
      .replace(/<[^>]*>/g, '')
      .slice(0, 300),
    url: item.link?.href || item.link || item.guid?.['#text'] || '',
    difficulty: 'intermediate',
    tags: (item.categories || []).map(c =>
      typeof c === 'string' ? c : c['#text'] || ''
    ),
    metadata: {
      platform: 'rss',
      pubDate: item.pubDate || item.updated || item.published || null,
      source_feed: feedUrl,
    },
  }));
}

module.exports = {
  fetch: fetchRSS,
};