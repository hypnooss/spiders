// js/main.js

function showPage(page) {
  const pages = ['inicio', 'login', 'cadastro', 'recuperacao', 'validacao'];
  pages.forEach(p => {
    const el = document.getElementById('page-' + p);
    if (el) el.classList.add('hidden');
  });
  const current = document.getElementById('page-' + page);
  if (current) current.classList.remove('hidden');
}

function showInlineError(id, message, type = 'error') {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = message;
    el.classList.add('alert-visible');
    el.classList.remove('alert-error', 'alert-warning', 'alert-success');
    el.classList.add('alert-' + type);
  }
}

function clearInlineError(id) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = '';
    el.classList.remove('alert-visible', 'alert-error', 'alert-warning', 'alert-success');
  }
}

const inputMap = [
  { input: 'email', error: 'login-error' },
  { input: 'password', error: 'login-error' },
  { input: 'reg-email', error: 'register-error' },
  { input: 'reg-password', error: 'register-error' },
  { input: 'reg-confirm', error: 'register-error' },
  { input: 'recovery-email', error: 'recovery-error' },
];

document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();

  document.querySelectorAll('.fade-up').forEach((el, i) => {
    el.style.animationDelay = `${i * 0.1 + 0.2}s`;
  });

  const touchedFields = new Set();

  inputMap.forEach(({ input, error }) => {
    const el = document.getElementById(input);
    if (!el) return;

    const check = () => {
      const value = el.value.trim();
      const valid = el.checkValidity();

      if (!value && touchedFields.has(input)) {
        showInlineError(error, '❌ Este campo é obrigatório.', 'error');
        el.classList.add('field-error');
        el.classList.remove('field-success', 'field-warning');
      } else if (!valid && touchedFields.has(input)) {
        showInlineError(error, '⚠️ ' + el.validationMessage, 'warning');
        el.classList.add('field-warning');
        el.classList.remove('field-success', 'field-error');
      } else if (value) {
        if (input === 'reg-confirm') {
          const pass = document.getElementById('reg-password').value;
          if (value !== pass) {
            showInlineError(error, '⚠️ As senhas não coincidem.', 'warning');
            el.classList.add('field-warning');
            el.classList.remove('field-success', 'field-error');
            return;
          }
        }
        el.classList.remove('field-error', 'field-warning');
        el.classList.add('field-success');

        const relatedInputs = inputMap.filter(i => i.error === error);
        const hasOtherInvalid = relatedInputs.some(({ input: otherId }) => {
          const other = document.getElementById(otherId);
          return other && !other.checkValidity();
        });
        if (!hasOtherInvalid) clearInlineError(error);
      }
    };

    el.addEventListener('focus', () => touchedFields.add(input));
    el.addEventListener('input', check);
  });

  const regForm = document.getElementById('register-form');
  if (regForm) {
    regForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearInlineError('register-error');

      const email = document.getElementById('reg-email').value.trim();
      const pass = document.getElementById('reg-password').value.trim();
      const confirm = document.getElementById('reg-confirm').value.trim();

      if (!email || !pass || !confirm) {
        showInlineError('register-error', '❌ Todos os campos são obrigatórios.', 'error');
        return;
      }

      if (pass !== confirm) {
        showInlineError('register-error', '⚠️ As senhas não coincidem.', 'warning');
        return;
      }

      try {
        const res = await fetch('api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password: pass })
        });

        if (!res.ok) {
          const data = await res.json();
          showInlineError('register-error', `❌ ${data.detail || 'Erro ao registrar.'}`, 'error');
          return;
        }

        // Redireciona para tela de validação
        showPage('validacao');
      } catch (err) {
        showInlineError('register-error', '❌ Erro de rede ou servidor.', 'error');
      }
    });
  }
  const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearInlineError('login-error');

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!email || !password) {
      showInlineError('login-error', '❌ Preencha todos os campos.', 'error');
      return;
    }

    try {
      const res = await fetch('api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        showInlineError('login-error', `❌ ${data.detail || 'Erro ao fazer login.'}`, 'error');
        return;
      }

      if (data.pending_mfa) {
        // Aqui você pode exibir uma tela para digitar o código MFA
        showInlineError('login-error', '🔐 MFA necessário (implementação futura)', 'warning');
        return;
      }

      // Sucesso no login
      console.log('✅ Login bem-sucedido:', data.access_token);
      // Redireciona ou armazena o token se quiser
      showInlineError('login-error', '✅ Login realizado com sucesso!', 'success');
    } catch (err) {
      showInlineError('login-error', '❌ Erro de rede ou servidor.', 'error');
    }
  });
}

});

