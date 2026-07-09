import { useState, useEffect } from 'react';
import { get } from '../../lib/api';
import ResourceCard from '../../components/ResourceCard';
import DifficultyFilter from '../../components/DifficultyFilter';
import DomainFilter from '../../components/DomainFilter';
import SkeletonCard from '../../components/SkeletonCard';
import { registerFeature } from '../../feature-registry';

function BrowsePage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [difficulty, setDifficulty] = useState('');
  const [domain, setDomain] = useState(null);
  const [source, setSource] = useState('');
  const [error, setError] = useState(null);

    useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (difficulty) params.set('difficulty', difficulty);
    if (domain) params.set('domain', domain);
    if (source) params.set('source', source);
    params.set('category', '!certification');

    get(`/api/resources?${params.toString()}`)
      .then(data => {
        setResources(data.data || []);
        setError(null);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [difficulty, domain, source]);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">Browse Resources</h2>
        <DomainFilter selected={domain} onChange={setDomain} />
        <DifficultyFilter selected={difficulty} onChange={setDifficulty} />
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-lg mb-4">{error}</div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(n => <SkeletonCard key={n} />)}
        </div>
      ) : resources.length === 0 ? (
        <div className="text-center py-12 text-gray-400 dark:text-gray-500">
          <p className="text-lg">No resources found</p>
          <p className="text-sm mt-1">Try a different filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map(r => (
            <ResourceCard key={r.id} resource={r} />
          ))}
        </div>
      )}
    </div>
  );
}

registerFeature('browse', '📚', BrowsePage, null);

export { BrowsePage };