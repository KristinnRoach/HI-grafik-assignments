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
function initTheme() {
  const saved = localStorage.getItem(storageKey);
  const theme = saved || (systemPrefersDark() ? 'dark' : 'light');
  applyTheme(theme);
  return theme;
}
function toggleTheme() {
  const next = currentTheme() === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  localStorage.setItem(storageKey, next);
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
