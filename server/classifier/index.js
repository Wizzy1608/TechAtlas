const pool = require('../db/pool');

const DOMAINS = [
  {
    name: 'ethical-hacking',
    icon: '🎯',
    keywords: ['penetration test', 'pentest', 'exploit', 'vulnerability', 'cve', 'bug bounty',
      'malware', 'payload', 'reverse engineering', 'osint', 'ctf', 'capture the flag',
      'metasploit', 'nmap', 'wireshark', 'buffer overflow', 'privilege escalation',
      'cyber kill chain', 'red team', 'ethical hack'],
    negative: ['firewall config', 'compliance', 'grc', 'audit', 'policy', 'risk assessment'],
  },
  {
    name: 'linux-unix',
    icon: '🐧',
    keywords: ['linux', 'unix', 'bash', 'shell script', 'kernel', 'systemd', 'grub',
      'chmod', 'chown', 'cron', 'fstab', 'apt', 'yum', 'pacman', 'grep', 'awk', 'sed',
      'posix', 'x11', 'wayland', 'i3wm', 'zsh', 'terminal', 'tty', 'init'],
    negative: ['windows', 'bluescreen', 'driver install', 'registry'],
  },
  {
    name: 'troubleshooting',
    icon: '🔧',
    keywords: ['repair', 'fix', 'broken', 'error', 'crash', 'freeze', 'recover',
      'diagnostic', 'boot loop', 'black screen', 'not working', 'failed', 'corrupt',
      'blue screen', 'hardware failure', 'driver issue', 'memory leak', 'slow'],
    negative: ['kernel', 'exploit', 'bgp', 'ospf', 'pentest'],
  },
  {
    name: 'networking',
    icon: '🌐',
    keywords: ['router', 'switch', 'bgp', 'ospf', 'vlan', 'subnet', 'dhcp', 'dns',
      'tcp/ip', 'routing', 'firewall rule', 'nat', 'vpn', 'vxlan', 'stp', 'lacp',
      'spanning tree', 'ipsec', 'mpls', 'ospf', 'eigrp'],
    negative: ['wifi not working', 'internet not connecting', 'repair', 'fix broken'],
  },
  {
    name: 'devtools',
    icon: '🛠️',
    keywords: ['git', 'docker', 'vim', 'neovim', 'ci/cd', 'devcontainer', 'dev container',
      'latex', 'makefile', 'cmake', 'webpack', 'vite', 'eslint', 'prettier',
      'github actions', 'jenkins', 'terraform', 'ansible', 'kubernetes', 'k8s'],
    negative: [],
  },
  {
    name: 'sysadmin',
    icon: '🖥️',
    keywords: ['active directory', 'powershell', 'windows server', 'proxmox', 'virtualization',
      'vmware', 'hyper-v', 'monitoring', 'nagios', 'zabbix', 'prometheus', 'grafana',
      'backup', 'restore', 'raid', 'ldap', 'group policy', 'sccm'],
    negative: ['router', 'switch', 'bgp', 'kernel', 'exploit'],
  },
  {
    name: 'cybersecurity',
    icon: '🛡️',
    keywords: ['grc', 'compliance', 'soc2', 'iso 27001', 'gdpr', 'data privacy',
      'zero day', 'threat hunting', 'siem', 'soar', 'mitre att&ck', 'risk assessment',
      'security policy', 'incident response', 'forensics', 'audit', 'access control'],
    negative: ['pentest', 'exploit', 'ctf', 'malware'],
  },
  {
    name: 'cloud-computing',
    icon: '☁️',
    keywords: ['aws', 'azure', 'gcp', 'cloud', 'serverless', 'lambda', 'ec2', 's3',
      'finops', 'cloud cost', 'cloudformation', 'pulumi', 'crossplane', 'service mesh',
      'istio', 'envoy', 'terraform', 'multi-cloud', 'cloud native'],
    negative: [],
  },
  {
    name: 'ai-ml',
    icon: '🤖',
    keywords: ['machine learning', 'deep learning', 'neural network', 'llm', 'rag',
      'vector database', 'fine tuning', 'prompt engineering', 'ai agent', 'mcp',
      'onnx', 'tensorrt', 'quantization', 'transformer', 'gpt', 'bert', 'pytorch',
      'tensorflow', 'nlp', 'computer vision', 'cnn', 'rnn'],
    negative: [],
  },
];

function score(text, keywords, negative) {
  if (!text) return 0;
  const lower = text.toLowerCase();
  let score = 0;
  for (const kw of keywords) {
    if (lower.includes(kw)) score += kw.split(' ').length > 1 ? 3 : 1;
  }
  for (const nw of negative) {
    if (lower.includes(nw)) score -= 5;
  }
  return score;
}

function classifyResource(resource) {
  const text = [
    resource.title || '',
    resource.description || '',
    (resource.tags || []).join(' '),
  ].join(' ').toLowerCase();

  let best = { domain: null, icon: null, score: -Infinity, method: 'unclassified' };

  for (const d of DOMAINS) {
    const s = score(text, d.keywords, d.negative);
    if (s > best.score) {
      best = { domain: d.name, icon: d.icon, score: s, method: 'keyword' };
    }
  }

  return best.score > 0
    ? { domain: best.domain, icon: best.icon, confidence: Math.min(best.score / 10, 1), method: 'keyword' }
    : { domain: null, icon: null, confidence: 0, method: 'unclassified' };
}

async function classifyStoredResource(resource) {
  const result = classifyResource(resource);
  if (result.method === 'keyword' && result.domain) {
    await pool.query(
      `UPDATE resources SET domain = $1, domain_icon = $2, classification_method = $3, classification_score = $4
       WHERE id = $5`,
      [result.domain, result.icon, result.method, result.confidence, resource.id]
    );
  }
  return result;
}

async function reclassifyAll() {
  const { rows } = await pool.query(
    `SELECT id, title, description, tags FROM resources
     WHERE domain IS NULL OR classification_method IS NULL`
  );
  console.log(`Reclassifying ${rows.length} resources...`);
  let classified = 0;
  for (const r of rows) {
    const result = await classifyStoredResource(r);
    if (result.domain) classified++;
  }
  console.log(`Classified ${classified}/${rows.length}`);
}

module.exports = { classifyResource, classifyStoredResource, reclassifyAll, DOMAINS };