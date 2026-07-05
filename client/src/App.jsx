import { useState, useEffect } from 'react';
import { getFeatures } from './feature-registry';
import { get } from './lib/api';
import './features/welcome';

function App() {
  const [activeFeature, setActiveFeature] = useState('welcome');
  const [plugins, setPlugins] = useState([]);
  const features = getFeatures();
  const current = features.find(f => f.name === activeFeature);

  useEffect(() => {
    get('/api/plugins').then(data => setPlugins(data.plugins)).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">TechAtlas</h1>
          <div className="flex gap-4 items-center">
            {features.map(f => (
              <button
                key={f.name}
                onClick={() => setActiveFeature(f.name)}
                className={`text-sm px-3 py-1 rounded ${
                  activeFeature === f.name
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {f.icon} {f.name}
              </button>
            ))}
            <span className="text-xs text-gray-400">{plugins.length} plugins</span>
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-4 py-8">
        {current ? <current.Page /> : <p>Feature not found</p>}
      </main>
    </div>
  );
}

export default App;