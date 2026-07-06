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

function ResourceCard({ resource, onBookmark, isBookmarked }) {
  const age = Math.floor((Date.now() - new Date(resource.collected_at)) / (1000 * 60 * 60 * 24));
  const isNew = age < 7;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${difficultyColors[resource.difficulty] || 'bg-gray-100 text-gray-600'}`}>
              {difficultyLabels[resource.difficulty] || resource.difficulty}
            </span>
            {isNew && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">New</span>
            )}
          </div>
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-base font-semibold text-gray-900 hover:text-blue-600 block truncate"
          >
            {resource.title}
          </a>
          {resource.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{resource.description}</p>
          )}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {resource.source_name && (
              <span className="text-xs text-gray-400">{resource.source_name}</span>
            )}
            {resource.tags && resource.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
            <span className="text-xs text-gray-400 ml-auto">
              {age === 0 ? 'Today' : `${age}d ago`}
            </span>
          </div>
        </div>
        <button
          onClick={() => onBookmark?.(resource)}
          className={`text-xl flex-shrink-0 hover:scale-110 transition-transform ${isBookmarked ? 'text-yellow-400' : 'text-gray-300'}`}
          title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
        >
          {isBookmarked ? '★' : '☆'}
        </button>
      </div>
    </div>
  );
}

export default ResourceCard;