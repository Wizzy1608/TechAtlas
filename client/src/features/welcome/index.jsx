import { useState, useEffect } from 'react';
import { get } from '../../lib/api';
import ResourceCard from '../../components/ResourceCard';
import DifficultyFilter from '../../components/DifficultyFilter';
import SkeletonCard from '../../components/SkeletonCard';
import { registerFeature } from '../../feature-registry';
import { getContinueReading } from '../../lib/continue-reading';

function WelcomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [difficulty, setDifficulty] = useState('');
  const continueReading = getContinueReading();

  useEffect(() => {
    get('/api/recent')
      .then(data => { setRecent(data.data || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

   const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.dispatchEvent(new CustomEvent('navigate', {
        detail: { feature: 'search' }
      }));
    }
  };

  return (
    <div>
      <div className="text-center py-12 max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          TechAtlas
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Discover free learning resources from across the web
        </p>

        <form onSubmit={handleSearch} className="relative mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search learning resources..."
            className="w-full px-5 py-3.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Search
          </button>
        </form>

        <DifficultyFilter
          selected={difficulty}
          onChange={diff => setDifficulty(diff)}
        />
      </div>

      {continueReading.length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
            📖 Continue Reading
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {continueReading.slice(0, 10).map((item, i) => (
              <a
                key={i}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 w-56 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
              >
                <div className={`text-xs font-medium mb-2 ${
                  item.difficulty === 'beginner' ? 'text-green-600' :
                  item.difficulty === 'advanced' ? 'text-red-600' :
                  'text-yellow-600'
                }`}>
                  {item.difficulty || 'general'}
                </div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100 line-clamp-2">
                  {item.title}
                </p>
                {item.progress > 0 && (
                  <div className="mt-2 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                )}
                <span className="text-xs text-blue-600 mt-2 inline-block">Continue ▶</span>
              </a>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          🆕 Recent Resources
        </h2>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(n => <SkeletonCard key={n} />)}
          </div>
        ) : recent.length === 0 ? (
          <p className="text-gray-400 dark:text-gray-500 text-center py-8">
            No resources collected yet — check back soon.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recent.map(r => <ResourceCard key={r.id} resource={r} />)}
          </div>
        )}
      </div>
    </div>
  );
}

registerFeature('welcome', '🏠', WelcomePage, null);

export { WelcomePage };