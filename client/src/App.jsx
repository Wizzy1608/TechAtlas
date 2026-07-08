import { useState, useEffect } from 'react';
import { getFeatures } from './feature-registry';
import { getDarkMode, setDarkMode } from './lib/dark-mode';
import './features/welcome';
import './features/browse';
import './features/search';
import './features/bookmarks';
import './features/continue-reading';
import './features/certifications';
import DealBanner from './components/DealBanner';

function App() {
  const [activeFeature, setActiveFeature] = useState('welcome');
  const [dark, setDark] = useState(getDarkMode());
  const features = getFeatures();
  const current = features.find(f => f.name === activeFeature);

  useEffect(() => {
    setDarkMode(dark);
  }, [dark]);

  return (
    <div className={dark ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-gray-100 transition-colors">
        <nav className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">TechAtlas</h1>
            <div className="flex gap-4 items-center">
              {features.map(f => (
                <button
                  key={f.name}
                  onClick={() => setActiveFeature(f.name)}
                  className={`text-sm px-3 py-1 rounded ${
                    activeFeature === f.name
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  {f.icon} {f.name === 'welcome' ? 'Home' : f.name.charAt(0).toUpperCase() + f.name.slice(1)}
                </button>
              ))}
              <button
                onClick={() => setDark(!dark)}
                className="text-lg hover:scale-110 transition-transform"
                title="Toggle dark mode"
              >
                {dark ? '☀️' : '🌙'}
              </button>
            </div>
          </div>
        </nav>
                {activeFeature === 'welcome' && <DealBanner />}
        <main className="max-w-6xl mx-auto px-4 py-8">
          {current ? <current.Page /> : <p>Feature not found</p>}
        </main>
      </div>
    </div>
  );
}

export default App;