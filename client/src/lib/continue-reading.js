const STORAGE_KEY = 'techatlas:continue-reading';

export function getReadingList() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch { return []; }
}

export function trackClick(resource) {
  let list = getReadingList();
  list = list.filter(r => r.url !== resource.url);
  list.unshift({ url: resource.url, title: resource.title, difficulty: resource.difficulty, lastViewed: new Date().toISOString() });
  if (list.length > 20) list = list.slice(0, 20);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return list;
}

export function clearReadingList() {
  localStorage.removeItem(STORAGE_KEY);
  return [];
}