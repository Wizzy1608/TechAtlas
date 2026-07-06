import { useState, useEffect } from 'react';
import { getBookmarks, removeBookmark } from '../../lib/bookmarks';
import ResourceCard from '../../components/ResourceCard';
import DifficultyFilter from '../../components/DifficultyFilter';
import { registerFeature } from '../../feature-registry';

function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState([]);
  const [difficulty, setDifficulty] = useState('');

  const refresh = () => {
    let list = getBookmarks();
    if (difficulty) list = list.filter(b => b.difficulty === difficulty);
    setBookmarks(list);
  };

  useEffect(() => { refresh(); }, [difficulty]);

  const handleRemove = (url) => {
    removeBookmark(url);
    refresh();
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-1">★ My Bookmarks</h2>
        <p className="text-sm text-gray-400">{bookmarks.length} saved</p>
        <div className="mt-3">
          <DifficultyFilter selected={difficulty} onChange={setDifficulty} />
        </div>
      </div>

      {bookmarks.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-3">☆</p>
          <p className="text-lg">No bookmarks yet</p>
          <p className="text-sm mt-1">Click the star on any resource to save it here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookmarks.map(b => (
            <div key={b.url} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                    b.difficulty === 'beginner' ? 'bg-green-100 text-green-800 border-green-200' :
                    b.difficulty === 'advanced' ? 'bg-red-100 text-red-800 border-red-200' :
                    'bg-yellow-100 text-yellow-800 border-yellow-200'
                  }`}>
                    {b.difficulty}
                  </span>
                  <p className="text-base font-semibold text-gray-900 mt-1 truncate">{b.title}</p>
                  <p className="text-xs text-gray-400 mt-1">Saved {new Date(b.savedAt).toLocaleDateString()}</p>
                </div>
                <button onClick={() => handleRemove(b.url)} className="text-gray-400 hover:text-red-500 text-sm flex-shrink-0">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

registerFeature('bookmarks', '★', BookmarksPage, null);

export { BookmarksPage };