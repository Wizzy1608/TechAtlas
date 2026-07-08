const { XMLParser } = require('fast-xml-parser');
const pool = require('../db/pool');

const parser = new XMLParser({ ignoreAttributes: false, textNodeName: 'text' });

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const DEAL_KEYWORDS = [
  'free', 'certification', 'voucher', 'discount', 'offer', 'badge',
  'deal', '% off', 'microcredential', 'skill badge', 'accreditation',
  'challenge', 'race to certification', 'save', 'sale', 'promo',
];

const DEAL_FEEDS = [
  { name: 'AWS', url: 'https://aws.amazon.com/about-aws/whats-new/recent/feed/', type: 'rss' },
  { name: 'Microsoft', url: 'https://learn.microsoft.com/en-us/training/rss/', type: 'rss' },
  { name: 'Google Cloud', url: 'https://cloud.google.com/feeds/whats-new.xml', type: 'rss' },
  { name: 'Oracle', url: 'https://blogs.oracle.com/oracleuniversity/rss', type: 'rss' },
  { name: 'Cisco', url: 'https://skillsforall.com/rss/', type: 'rss' },
  { name: 'Fortinet', url: 'https://training.fortinet.com/rss/', type: 'rss' },
];

const CERT_FEEDS = [
  { provider: 'IBM', url: 'https://cognitiveclass.ai/courses/feed/', domain: 'general' },
  { provider: 'freeCodeCamp', url: 'https://www.freecodecamp.org/news/rss/', domain: 'programming' },
  { provider: 'Helsinki', url: 'https://www.elementsofai.com/feed.xml', domain: 'ai-ml' },
];

const KNOWN_CERTS = [
  { title: 'AWS Serverless Microcredential', provider: 'AWS', url: 'https://skillbuilder.aws', description: 'Hands-on serverless with Lambda, API Gateway, Step Functions, DynamoDB', domain: 'cloud', difficulty: 'intermediate', hours: 8 },
  { title: 'AWS Agentic AI Microcredential', provider: 'AWS', url: 'https://skillbuilder.aws', description: 'Build and troubleshoot AI agents with Amazon Bedrock', domain: 'ai-ml', difficulty: 'advanced', hours: 8 },
  { title: 'AWS Application Networking Microcredential', provider: 'AWS', url: 'https://skillbuilder.aws', description: 'Application delivery, performance optimization, modern architecture', domain: 'cloud', difficulty: 'intermediate', hours: 8 },
  { title: 'AWS Incident Response Microcredential', provider: 'AWS', url: 'https://skillbuilder.aws', description: 'Identify, contain, and remediate AWS security incidents', domain: 'cybersecurity', difficulty: 'advanced', hours: 8 },
  { title: 'Google Cloud Engineering Certificate', provider: 'Google Cloud', url: 'https://cloudskillsboost.google', description: '80h cloud engineering track with 6 courses + 4 skill badges', domain: 'cloud', difficulty: 'intermediate', hours: 80 },
  { title: 'Google Cloud Cybersecurity Certificate', provider: 'Google Cloud', url: 'https://cloudskillsboost.google', description: '90h cybersecurity track with 4 courses + capstone', domain: 'cybersecurity', difficulty: 'intermediate', hours: 90 },
  { title: 'Google Cloud Computing Foundations', provider: 'Google Cloud', url: 'https://cloudskillsboost.google', description: '40h intro covering cloud basics, big data, ML, GCP', domain: 'cloud', difficulty: 'beginner', hours: 40 },
  { title: 'Cisco Introduction to Cybersecurity', provider: 'Cisco', url: 'https://skillsforall.com/course/introduction-to-cybersecurity', description: '15h beginner-friendly cybersecurity overview', domain: 'cybersecurity', difficulty: 'beginner', hours: 15 },
  { title: 'Cisco Cybersecurity Essentials', provider: 'Cisco', url: 'https://skillsforall.com/course/cybersecurity-essentials', description: '30h deeper dive into attack defense and security principles', domain: 'cybersecurity', difficulty: 'intermediate', hours: 30 },
  { title: 'Cisco Networking Basics', provider: 'Cisco', url: 'https://skillsforall.com', description: 'OSI models, IP addressing, routing fundamentals', domain: 'networking', difficulty: 'beginner', hours: 20 },
  { title: 'Cisco Python Essentials 1', provider: 'Cisco', url: 'https://skillsforall.com/catalog', description: '30h introduction to Python programming', domain: 'programming', difficulty: 'beginner', hours: 30 },
  { title: 'Cisco NDG Linux Essentials', provider: 'Cisco', url: 'https://skillsforall.com/course/linux-essentials', description: '70h LPIC-1 aligned Linux fundamentals', domain: 'linux', difficulty: 'intermediate', hours: 70 },
  { title: 'Fortinet NSE 1', provider: 'Fortinet', url: 'https://training.fortinet.com', description: 'Information Security Awareness - 2h free course', domain: 'cybersecurity', difficulty: 'beginner', hours: 2 },
  { title: 'Fortinet NSE 2', provider: 'Fortinet', url: 'https://training.fortinet.com', description: 'Evolution of Cybersecurity - 4h free course', domain: 'cybersecurity', difficulty: 'beginner', hours: 4 },
  { title: 'Microsoft Applied Skills: Agentic AI', provider: 'Microsoft', url: 'https://learn.microsoft.com/en-us/credentials/', description: 'Build and deploy AI agents with Copilot Studio', domain: 'ai-ml', difficulty: 'intermediate', hours: 6 },
  { title: 'Oracle OCI Foundations', provider: 'Oracle', url: 'https://education.oracle.com', description: 'Free OCI cloud foundations certification', domain: 'cloud', difficulty: 'beginner', hours: 10 },
  { title: 'Oracle AI Foundations', provider: 'Oracle', url: 'https://education.oracle.com', description: 'Free AI foundations certification', domain: 'ai-ml', difficulty: 'beginner', hours: 10 },
  { title: 'Oracle Agentic AI Foundations', provider: 'Oracle', url: 'https://education.oracle.com', description: 'Free agentic AI certification - LangChain, OCI deployment', domain: 'ai-ml', difficulty: 'intermediate', hours: 15 },
  { title: 'Harvard CS50x', provider: 'Harvard', url: 'https://cs50.harvard.edu/x/', description: 'Intro to Computer Science - 120h full course with certificate', domain: 'programming', difficulty: 'intermediate', hours: 120 },
  { title: 'freeCodeCamp Responsive Web Design', provider: 'freeCodeCamp', url: 'https://www.freecodecamp.org/learn', description: '300h full responsive web design certification', domain: 'programming', difficulty: 'beginner', hours: 300 },
  { title: 'freeCodeCamp JavaScript Algorithms', provider: 'freeCodeCamp', url: 'https://www.freecodecamp.org/learn', description: '300h JavaScript algorithms and data structures', domain: 'programming', difficulty: 'intermediate', hours: 300 },
  { title: 'IBM AI for Everyone', provider: 'IBM', url: 'https://cognitiveclass.ai/courses/ai-for-everyone', description: '10h AI basics for non-technical learners', domain: 'ai-ml', difficulty: 'beginner', hours: 10 },
  { title: 'Kaggle Intro to Machine Learning', provider: 'Kaggle', url: 'https://www.kaggle.com/learn/intro-to-machine-learning', description: '5h hands-on ML with Python', domain: 'ai-ml', difficulty: 'beginner', hours: 5 },
  { title: 'Elements of AI', provider: 'Helsinki', url: 'https://www.elementsofai.com/', description: '30h free university-level AI course', domain: 'ai-ml', difficulty: 'beginner', hours: 30 },
];

function hasDealKeywords(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  return DEAL_KEYWORDS.some(kw => lower.includes(kw));
}

async function validateWithAI(item) {
  if (!OPENROUTER_API_KEY) return true;

  const prompt = `Is this a free or discounted certification offer? If yes, extract: provider, cert_name, discount_percent (number), valid_until (ISO date), url. If not a deal, return null. Only return JSON, nothing else.

Data: ${JSON.stringify(item)}`;

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${OPENROUTER_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'openrouter/free', messages: [{ role: 'user', content: prompt }] }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || 'null';
    const parsed = JSON.parse(content.replace(/```json|```/g, '').trim());
    return parsed && parsed.cert_name ? parsed : false;
  } catch {
    return false;
  }
}

async function fetchFeed(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const xml = await res.text();
  const parsed = parser.parse(xml);
  const channel = parsed.rss?.channel || parsed.feed || {};
  return channel.item || channel.entry || [];
}

async function collectDeals() {
  console.log('[cert-collector] Checking for deals...');
  let count = 0;

  for (const feed of DEAL_FEEDS) {
    try {
      const items = await fetchFeed(feed.url);
      for (const item of (Array.isArray(items) ? items : [items])) {
        const title = item.title?.text || item.title || '';
        const description = item.description?.text || item.description || '';
        const text = title + ' ' + description;

        if (!hasDealKeywords(text)) continue;

        const url = item.link?.href || item.link?.text || item.link || item.guid?.text || item.guid || '';
        if (!url) continue;

        const deal = await validateWithAI({ title, description, url, provider: feed.name });
        if (!deal) continue;

        await pool.query(`
          INSERT INTO deals (title, description, url, provider, discount_percent, valid_until, is_active, collected_at)
          VALUES ($1, $2, $3, $4, $5, $6, true, NOW())
          ON CONFLICT (url) DO UPDATE SET
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            discount_percent = EXCLUDED.discount_percent,
            valid_until = EXCLUDED.valid_until,
            collected_at = NOW()
        `, [
          deal.cert_name || title,
          description.slice(0, 500),
          deal.url || url,
          deal.provider || feed.name,
          deal.discount_percent || null,
          deal.valid_until ? new Date(deal.valid_until) : null,
        ]);
        count++;
        console.log(`  ✓ deal: ${(deal.cert_name || title).slice(0, 60)}`);
      }
    } catch (err) {
      console.error(`  ✗ ${feed.name}: ${err.message}`);
    }
  }

  await pool.query(`UPDATE deals SET is_active = false WHERE valid_until < NOW()`);
  console.log(`[cert-collector] ${count} deals collected`);
  return count;
}

async function collectCertifications() {
  console.log('[cert-collector] Collecting certifications...');
  let count = 0;

  const existing = await pool.query(
    `SELECT url FROM resources WHERE category = 'certification'`
  );
  const existingUrls = new Set(existing.rows.map(r => r.url));

  for (const cert of KNOWN_CERTS) {
    if (existingUrls.has(cert.url)) continue;
    try {
      await pool.query(`
        INSERT INTO resources (title, description, url, source_type, source_name, tags, category, difficulty, domain, metadata, collected_at)
        VALUES ($1, $2, $3, 'certification_provider', $4, $5, 'certification', $6, $7, $8, NOW())
        ON CONFLICT (url) DO NOTHING
      `, [
        cert.title,
        cert.description,
        cert.url,
        cert.provider,
        [cert.provider.toLowerCase(), cert.domain],
        cert.difficulty,
        cert.domain,
        JSON.stringify({ provider: cert.provider, estimated_hours: cert.hours }),
      ]);
      count++;
    } catch (err) {
      console.error(`  ✗ ${cert.title.slice(0, 50)}: ${err.message}`);
    }
  }

  for (const feed of CERT_FEEDS) {
    try {
      const items = await fetchFeed(feed.url);
      for (const item of (Array.isArray(items) ? items : [items])) {
        const title = item.title?.text || item.title || '';
        const url = item.link?.href || item.link?.text || item.link || '';
        if (!title || !url || existingUrls.has(url)) continue;

        await pool.query(`
          INSERT INTO resources (title, description, url, source_type, source_name, tags, category, difficulty, domain, metadata, collected_at)
          VALUES ($1, $2, $3, 'certification_provider', $4, $5, 'certification', 'intermediate', $6, $7, NOW())
          ON CONFLICT (url) DO NOTHING
        `, [
          title,
          (item.description?.text || item.description || item.summary?.text || item.summary || '').slice(0, 500),
          url,
          feed.provider,
          [feed.provider.toLowerCase(), feed.domain],
          feed.domain,
          JSON.stringify({ provider: feed.provider }),
        ]);
        count++;
      }
    } catch (err) {
      console.error(`  ✗ ${feed.provider}: ${err.message}`);
    }
  }

  console.log(`[cert-collector] ${count} certifications stored`);
  return count;
}

async function run() {
  await collectDeals();
  await collectCertifications();
}

module.exports = { run, collectDeals, collectCertifications };