const STORAGE_KEY = 'techatlas:dark-mode';

export function getDarkMode() {
  return localStorage.getItem(STORAGE_KEY) === 'true';
}

export function setDarkMode(enabled) {
  localStorage.setItem(STORAGE_KEY, enabled ? 'true' : 'false');
  if (enabled) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  return enabled;
}