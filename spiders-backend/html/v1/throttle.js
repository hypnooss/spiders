// js/throttle.js
async function checkThrottleStatus() {
  try {
    const res = await fetch('/api/throttle-status');
    const data = await res.json();

    if (data?.delay >= 8) {
      const pages = ['inicio', 'login', 'cadastro', 'recuperacao'];
      pages.forEach(p => {
        const el = document.getElementById('page-' + p);
        if (el) el.classList.add('hidden');
      });

      const blocked = document.getElementById('page-bloqueado');
      if (blocked) blocked.classList.remove('hidden');
    }
  } catch (err) {
    console.warn('Erro ao verificar throttle:', err);
  }
}

window.addEventListener('DOMContentLoaded', checkThrottleStatus);

