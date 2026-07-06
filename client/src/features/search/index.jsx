import { useState } from 'react';
import { get } from '../../lib/api';
import ResourceCard from '../../components/ResourceCard';
import DifficultyFilter from '../../components/DifficultyFilter';
import { registerFeature } from '../../feature-registry';

function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(false);
  const [difficulty, setDifficulty] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams({ q: query.trim() });
      if (difficulty) params.set('difficulty', difficulty);
      const data = await get(`/api/search?${params.toString()}`);
      setResults(data.data || []);
      setRelated(data.related || []);
    } catch (err) {
      setResults([]);
      setRelated([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDifficultyChange = (d) => {
    setDifficulty(d);
    if (searched) {
      setTimeout(() => {
        setDifficulty(d);
      }, 0);
    }
  };

  return (
    <div>
      <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="mb-6">
        <div className="flex gap-2 max-w-2xl">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search tutorials, repos, courses..."
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm"
          />
          <button
            type="submit"
            className="px-6 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800"
          >
            Search
          </button>
        </div>
        <div className="mt-3">
          <DifficultyFilter selected={difficulty} onChange={handleDifficultyChange} />
        </div>
      </form>

      {loading && <p className="text-gray-400 text-sm">Searching...</p>}

      {!loading && searched && results.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg">No results for "{query}"</p>
          <p className="text-sm mt-1">Try different keywords or remove filters</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <>
          <h2 className="text-sm font-medium text-gray-500 mb-3">Results for "{query}"</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {results.map(r => <ResourceCard key={r.id} resource={r} />)}
          </div>
        </>
      )}

      {!loading && related.length > 0 && (
        <>
          <h2 className="text-sm font-medium text-gray-500 mt-6 mb-3 border-t pt-6">Related to your search</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {related.map(r => <ResourceCard key={r.id} resource={r} />)}
          </div>
        </>
      )}
    </div>
  );
}

registerFeature('search', '🔍', SearchPage, null);

export { SearchPage };