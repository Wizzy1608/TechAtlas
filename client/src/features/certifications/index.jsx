import { useState, useEffect } from 'react';
import { get } from '../../lib/api';
import CertificationCard from '../../components/CertificationCard';
import DifficultyFilter from '../../components/DifficultyFilter';
import SkeletonCard from '../../components/SkeletonCard';
import { registerFeature } from '../../feature-registry';

const DOMAINS = [
  { name: 'cloud', icon: '☁️', label: 'Cloud' },
  { name: 'cybersecurity', icon: '🛡️', label: 'Security' },
  { name: 'networking', icon: '🌐', label: 'Networking' },
  { name: 'programming', icon: '💻', label: 'Programming' },
  { name: 'ai-ml', icon: '🤖', label: 'AI / ML' },
  { name: 'linux', icon: '🐧', label: 'Linux' },
  { name: 'general', icon: '📋', label: 'General' },
];

const PROVIDERS = ['All', 'AWS', 'Google Cloud', 'Microsoft', 'Cisco', 'Fortinet', 'Oracle', 'IBM', 'freeCodeCamp', 'Harvard', 'Kaggle', 'Helsinki'];

function DomainFilter({ selected, onChange }) {
  return (
    <div className="flex flex-wrap gap-2 mb-3">
      <button onClick={() => onChange(null)}
        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
          !selected ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
        }`}>All</button>
      {DOMAINS.map(d => (
        <button key={d.name} onClick={() => onChange(selected === d.name ? null : d.name)}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            selected === d.name ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}>{d.icon} {d.label}</button>
      ))}
    </div>
  );
}

function ProviderFilter({ selected, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {PROVIDERS.map(p => (
        <button key={p} onClick={() => onChange(selected === p ? '' : p)}
          className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
            selected === p ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}>{p}</button>
      ))}
    </div>
  );
}

function CertificationsPage() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [domain, setDomain] = useState(null);
  const [difficulty, setDifficulty] = useState('');
  const [provider, setProvider] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ category: 'certification' });
    if (domain) params.set('domain', domain);
    if (difficulty) params.set('difficulty', difficulty);
    if (provider) params.set('source_name', provider);

    get(`/api/resources?${params.toString()}`)
      .then(data => { setCerts(data.data || []); setError(null); })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [domain, difficulty, provider]);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">🎓 Free Certifications</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Verified free certification programs from major providers. No paid courses.</p>
        <DomainFilter selected={domain} onChange={setDomain} />
        <div className="mb-3" />
        <ProviderFilter selected={provider} onChange={setProvider} />
        <div className="mt-3">
          <DifficultyFilter selected={difficulty} onChange={setDifficulty} />
        </div>
      </div>

      {error && <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-lg mb-4">{error}</div>}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(n => <SkeletonCard key={n} />)}
        </div>
      ) : certs.length === 0 ? (
        <div className="text-center py-12 text-gray-400 dark:text-gray-500">
          <p className="text-lg">No certifications found</p>
          <p className="text-sm mt-1">Try a different filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {certs.map(c => <CertificationCard key={c.id} cert={c} />)}
        </div>
      )}
    </div>
  );
}

registerFeature('certifications', '🎓', CertificationsPage, null);

export { CertificationsPage };