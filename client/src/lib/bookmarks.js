const STORAGE_KEY = 'techatlas:bookmarks';

export function getBookmarks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch { return []; }
}

export function addBookmark(resource) {
  const list = getBookmarks();
  if (!list.find(b => b.url === resource.url)) {
    list.push({ url: resource.url, title: resource.title, difficulty: resource.difficulty, source_type: resource.source_type, savedAt: new Date().toISOString() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }
  return list;
}

export function removeBookmark(url) {
  const list = getBookmarks().filter(b => b.url !== url);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return list;
}

export function isBookmarked(url) {
  return getBookmarks().some(b => b.url === url);
}