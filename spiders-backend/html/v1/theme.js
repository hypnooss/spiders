function toggleTheme() {
  const isLight = document.body.classList.toggle('light-mode');
  localStorage.setItem('theme', isLight ? 'light' : 'dark');

  const icon = document.getElementById('theme-toggle');
  if (icon) icon.textContent = isLight ? '🌙' : '🌞';
}

document.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('theme');
  if (saved === 'light') {
    document.body.classList.add('light-mode');
    const icon = document.getElementById('theme-toggle');
    if (icon) icon.textContent = '🌙';
  }
});

