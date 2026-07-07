async function fetchGitHubTopic(config = {}) {
  const { topic } = config;

  if (!topic) {
    throw new Error('github-topic: topic required');
  }

  const url =
    `https://api.github.com/search/repositories` +
    `?q=topic:${encodeURIComponent(topic)}+stars:>50` +
    `&sort=stars&order=desc&per_page=25`;

  const res = await globalThis.fetch(url, {
    headers: {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'TechAtlas',
    },
  });

  if (!res.ok) {
    throw new Error(`GitHub HTTP ${res.status}`);
  }

  const data = await res.json();

  return (data.items || []).map(item => ({
    title: item.full_name,
    description: item.description || '',
    url: item.html_url,
    difficulty: item.language ? 'intermediate' : 'beginner',
    tags: [item.language, topic, ...(item.topics || [])].filter(Boolean),
    metadata: {
      stars: item.stargazers_count,
      forks: item.forks_count,
      language: item.language,
      license: item.license?.spdx_id,
      platform: 'github',
      topic,
    },
  }));
}

module.exports = {
  fetch: fetchGitHubTopic,
};