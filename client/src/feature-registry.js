const features = [];

function registerFeature(name, icon, Page, Card) {
  features.push({ name, icon, Page, Card });
}

function getFeatures() {
  return features;
}

export { registerFeature, getFeatures };