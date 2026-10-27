const storageKey = 'site-theme';
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}
function systemPrefersDark() {
  return (
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
}
function currentTheme() {
  return document.documentElement.getAttribute('data-theme');
}
function setButtonLabel(btn, theme) {
  if (!btn) return;
  btn.textContent = theme === 'dark' ? 'Light' : 'Dark';
}
// localStorage can throw (private mode, blocked storage); the theme just won't persist
function loadTheme() {
  try {
    return localStorage.getItem(storageKey);
  } catch {
    return null;
  }
}
function initTheme() {
  const saved = loadTheme();
  const theme = saved || (systemPrefersDark() ? 'dark' : 'light');
  applyTheme(theme);
  return theme;
}
function toggleTheme() {
  const next = currentTheme() === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  try {
    localStorage.setItem(storageKey, next);
  } catch {}
  setButtonLabel(document.getElementById('theme-toggle'), next);
}
(function () {
  const initial = initTheme();
  const btn = document.getElementById('theme-toggle');
  if (btn) {
    setButtonLabel(btn, initial);
    btn.addEventListener('click', toggleTheme);
  }
})();
