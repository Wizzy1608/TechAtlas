async function fetchNVD(config = {}) {
  const { feed = 'recent' } = config;

  const url = `https://services.nvd.nist.gov/rest/json/cves/2.0?pubStartDate=${daysAgo(3)}&pubEndDate=${now()}&resultsPerPage=50`;

  const res = await globalThis.fetch(url);

  if (!res.ok) {
    throw new Error(`NVD HTTP ${res.status}`);
  }

  const data = await res.json();

  return (data.vulnerabilities || []).map(vuln => {
    const cve = vuln.cve || {};
    const metrics = cve.metrics?.cvssMetricV31?.[0]?.cvssData || {};

    return {
      title: `${cve.id} — ${(cve.descriptions?.[0]?.value || '').slice(0, 100)}`,
      description: (cve.descriptions?.[0]?.value || '').slice(0, 300),
      url: `https://nvd.nist.gov/vuln/detail/${cve.id}`,
      difficulty: 'advanced',
      tags: [
        'cve',
        'vulnerability',
        'security',
        ...(cve.vendorAdvisory?.length ? ['advisory'] : [])
      ],
      metadata: {
        cve_id: cve.id,
        severity: metrics.baseSeverity || null,
        score: metrics.baseScore || null,
        platform: 'nvd',
        feed
      }
    };
  });
}

function daysAgo(days) {
  const date = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

function now() {
  return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
}

module.exports = {
  fetch: fetchNVD
};