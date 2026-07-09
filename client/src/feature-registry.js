const features = [];

function registerFeature(name, icon, Page, Card) {
  features.push({ name, icon, Page, Card });
}

function getFeatures() {
  return features;
}

export { registerFeature, getFeatures };
window.__TECHATLAS_FEATURES__ = features;