const fs = require('fs');
const path = require('path');

function registerPlugins(app, pool) {
  const pluginsDir = path.join(__dirname, 'plugins');
  
  if (!fs.existsSync(pluginsDir)) {
    console.log('No plugins directory found');
    return [];
  }

  const items = fs.readdirSync(pluginsDir, { withFileTypes: true });
  const registered = [];

  for (const item of items) {
    if (!item.isDirectory()) continue;

    try {
      const plugin = require(path.join(pluginsDir, item.name));
      
      if (typeof plugin.register === 'function') {
        plugin.register(app, pool);
        registered.push({ name: item.name, status: 'loaded' });
        console.log(`[plugin] loaded: ${item.name}`);
      }
    } catch (err) {
      console.error(`[plugin] error loading ${item.name}:`, err.message);
      registered.push({ name: item.name, status: 'error', error: err.message });
    }
  }

  return registered;
}

module.exports = registerPlugins;