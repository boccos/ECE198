// viewModeToggle.js

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('toggleViewMode');
  const body = document.body;

  if (!btn || !body) return; // if this page doesn't have the button, do nothing

  // Get saved mode or default to light
  const savedMode = localStorage.getItem('viewMode') || 'light';

  applyMode(savedMode);

  // Click handler
  btn.addEventListener('click', () => {
    const current = localStorage.getItem('viewMode') || 'light';
    const next = current === 'light' ? 'dark' : 'light';
    applyMode(next);
    localStorage.setItem('viewMode', next);
  });

  function applyMode(mode) {
    if (mode === 'dark') {
      body.classList.add('dark-mode');
      btn.textContent = '☀️';   // per your spec: sun = dark mode active
    } else {
      body.classList.remove('dark-mode');
      btn.textContent = '🌙';   // moon = light mode active
    }
  }
});
