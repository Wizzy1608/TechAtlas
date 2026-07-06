import { useState } from 'react';
import { isBookmarked, addBookmark, removeBookmark } from '../lib/bookmarks';
import { trackClick } from '../lib/continue-reading';

const difficultyColors = {
  beginner: 'bg-green-100 text-green-800 border-green-200',
  intermediate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  advanced: 'bg-red-100 text-red-800 border-red-200',
};

const difficultyLabels = {
  beginner: '🟢 Beginner',
  intermediate: '🟡 Intermediate',
  advanced: '🔴 Advanced',
};

function ResourceCard({ resource }) {
  const [bookmarked, setBookmarked] = useState(() => isBookmarked(resource.url));
  const age = Math.floor((Date.now() - new Date(resource.collected_at)) / (1000 * 60 * 60 * 24));
  const isNew = age < 7;

  const handleBookmark = (e) => {
    e.preventDefault();
    if (bookmarked) {
      removeBookmark(resource.url);
    } else {
      addBookmark(resource);
    }
    setBookmarked(!bookmarked);
  };

  const handleClick = () => {
    trackClick(resource);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${difficultyColors[resource.difficulty] || 'bg-gray-100 text-gray-600'}`}>
              {difficultyLabels[resource.difficulty] || resource.difficulty}
            </span>
            {isNew && (
              <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-medium">New</span>
            )}
          </div>
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClick}
            className="text-base font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 block truncate"
          >
            {resource.title}
          </a>
          {resource.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{resource.description}</p>
          )}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {resource.source_name && (
              <span className="text-xs text-gray-400 dark:text-gray-500">{resource.source_name}</span>
            )}
            {resource.tags && resource.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
            <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">
              {age === 0 ? 'Today' : `${age}d ago`}
            </span>
          </div>
        </div>
        <button
          onClick={handleBookmark}
          className={`text-xl flex-shrink-0 hover:scale-110 transition-transform ${bookmarked ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
          title={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
        >
          {bookmarked ? '★' : '☆'}
        </button>
      </div>
    </div>
  );
}

export default ResourceCard;