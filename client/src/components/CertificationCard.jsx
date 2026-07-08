import { useState } from 'react';
import { addBookmark, removeBookmark, isBookmarked } from '../lib/bookmarks';

const PROVIDER_ICONS = {
  AWS: 'aws',
  'Google Cloud': 'gcp',
  Google: 'gcp',
  Microsoft: 'ms',
  Cisco: 'cisco',
  Fortinet: 'fortinet',
  Oracle: 'oracle',
  IBM: 'ibm',
  freeCodeCamp: 'fcc',
  Harvard: 'harvard',
  Kaggle: 'kaggle',
  Helsinki: 'helsinki',
};

const PROVIDER_COLORS = {
  AWS: 'bg-orange-500',
  'Google Cloud': 'bg-blue-500',
  Google: 'bg-blue-500',
  Microsoft: 'bg-green-500',
  Cisco: 'bg-red-500',
  Fortinet: 'bg-yellow-600',
  Oracle: 'bg-red-600',
  IBM: 'bg-blue-700',
  freeCodeCamp: 'bg-gray-800',
  Harvard: 'bg-crimson',
  Kaggle: 'bg-cyan-500',
  Helsinki: 'bg-indigo-500',
};

export default function CertificationCard({ cert }) {
  const [bookmarked, setBookmarked] = useState(isBookmarked(cert.url));

  function toggleBookmark() {
    if (bookmarked) {
      removeBookmark(cert.url);
      setBookmarked(false);
    } else {
      addBookmark(cert);
      setBookmarked(true);
    }
  }

  const provider = cert.metadata?.provider || cert.source_name || 'Unknown';
  const hours = cert.metadata?.estimated_hours;
  const icon = PROVIDER_ICONS[provider] || 'cert';
  const color = PROVIDER_COLORS[provider] || 'bg-gray-500';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div
          className={`${color} w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0`}
        >
          {icon.slice(0, 2).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm leading-tight">
              {cert.title}
            </h3>

            <button
              onClick={toggleBookmark}
              className="text-yellow-400 hover:text-yellow-500 shrink-0"
            >
              {bookmarked ? '★' : '☆'}
            </button>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
            {cert.description}
          </p>

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className={`${color} text-white px-2 py-0.5 rounded text-xs`}>
              {provider}
            </span>

            {cert.difficulty && (
              <span
                className={`px-2 py-0.5 rounded text-xs font-medium ${
                  cert.difficulty === 'beginner'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                    : cert.difficulty === 'intermediate'
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                }`}
              >
                {cert.difficulty}
              </span>
            )}

            {hours && (
              <span className="text-xs text-gray-400">
                ~{hours}h
              </span>
            )}

            {cert.domain && (
              <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded">
                {cert.domain}
              </span>
            )}
          </div>

          <a
            href={cert.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-3 text-xs bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start
          </a>
        </div>
      </div>
    </div>
  );
}