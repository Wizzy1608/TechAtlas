async function fetchStackExchange(config = {}) {
  const { site, tags = [] } = config;

  if (!site) {
    throw new Error('stackexchange: site required');
  }

  const tagParam = tags.length ? `&tagged=${tags.join(';')}` : '';

  const url =
    `https://api.stackexchange.com/2.3/questions` +
    `?site=${site}${tagParam}&sort=votes&pagesize=50&filter=withbody`;

  const res = await globalThis.fetch(url);

  if (!res.ok) {
    throw new Error(`StackExchange HTTP ${res.status}`);
  }

  const data = await res.json();

  if (data.error_message) {
    throw new Error(`StackExchange API: ${data.error_message}`);
  }

  return (data.items || []).map(item => ({
    title: item.title,
    description:
      item.body?.replace(/<[^>]*>/g, '').slice(0, 300) || '',
    url:
      item.link ||
      `https://${site}.stackexchange.com/questions/${item.question_id}`,
    difficulty:
      item.score > 10
        ? 'advanced'
        : item.score > 3
        ? 'intermediate'
        : 'beginner',
    tags: item.tags || [],
    metadata: {
      score: item.score,
      answer_count: item.answer_count,
      view_count: item.view_count,
      platform: 'stackexchange',
      site,
    },
  }));
}

module.exports = {
  fetch: fetchStackExchange,
};