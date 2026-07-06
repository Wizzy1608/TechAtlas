import { useState } from 'react';
import { getReadingList, clearReadingList } from '../../lib/continue-reading';
import { registerFeature } from '../../feature-registry';

function ContinueReadingPage() {
  const [list, setList] = useState(getReadingList());

  const handleClear = () => {
    clearReadingList();
    setList([]);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-1">📖 Continue Reading</h2>
          <p className="text-sm text-gray-400">{list.length} resources</p>
        </div>
        {list.length > 0 && (
          <button onClick={handleClear} className="text-sm text-gray-400 hover:text-red-500">Clear all</button>
        )}
      </div>

      {list.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-3">📖</p>
          <p className="text-lg">No reading history</p>
          <p className="text-sm mt-1">Click on any resource to start tracking</p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((item, idx) => (
            <div key={item.url} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center gap-4">
              <span className="text-gray-300 text-sm w-5">{idx + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{item.title}</p>
                <p className="text-xs text-gray-400">Last viewed {new Date(item.lastViewed).toLocaleDateString()}</p>
              </div>
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800 flex-shrink-0">
                ▶ Continue
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

registerFeature('continue-reading', '📖', ContinueReadingPage, null);

export { ContinueReadingPage };