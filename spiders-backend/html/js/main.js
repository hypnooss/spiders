import { setSuccess, clearSuccess, exibirVerificacaoReCAPTCHA } from './utils.js';

// Seleciona o container principal onde as telas serão inseridas
const container = document.querySelector("main");

// Função para carregar dinamicamente as telas com transição
function loadTela(hash) {
  const rota = (hash || "#hero").replace("#", "").split("?")[0];
  fetch(`/${rota}.html`)
    .then(res => {
      if (!res.ok) throw new Error("Tela não encontrada");
      return res.text();
    })
    .then(html => {
      container.innerHTML = html;
      const el = container.firstElementChild;
      el.classList.add("opacity-0", "scale-95");
      el.classList.remove("hidden");
      setTimeout(() => {
        el.classList.remove("opacity-0", "scale-95");
        el.classList.add("opacity-100", "scale-100", "transition-all", "duration-300");
      }, 20);

      // Links internos de navegação entre telas
      const linkToLoginFromRegister = document.getElementById("link-to-login-from-register");
      const linkToRegisterFromLogin = document.getElementById("link-to-register-from-login");
      const linkToRecoveryFromLogin = document.getElementById("link-to-recovery-from-login");
      const linkToLoginFromRecovery = document.getElementById("link-to-login-from-recovery");

      if (linkToLoginFromRegister) linkToLoginFromRegister.addEventListener("click", e => { e.preventDefault(); location.hash = "#login"; });
      if (linkToRegisterFromLogin) linkToRegisterFromLogin.addEventListener("click", e => { e.preventDefault(); location.hash = "#register"; });
      if (linkToRecoveryFromLogin) linkToRecoveryFromLogin.addEventListener("click", e => { e.preventDefault(); location.hash = "#recovery"; });
      if (linkToLoginFromRecovery) linkToLoginFromRecovery.addEventListener("click", e => { e.preventDefault(); location.hash = "#login"; });

      // Inicializa lógica específica de cada tela se existir
    
      import(`./${rota}.js`)
        .then(modulo => {
        if (typeof modulo.initTela === "function") {
          modulo.initTela();
        } else {
          console.warn(`Script js/${rota}.js carregado, mas initTela() não foi encontrado.`);
        }
      })
  .catch((err) => {
    console.error(`❌ Erro ao importar js/${rota}.js`, err);
  });

    })
    .catch(err => {
      container.innerHTML = `<div class=\"text-red-400\">Erro ao carregar a tela <strong>${rota}</strong></div>`;
    });
}

// Escuta mudanças de hash para navegar entre telas
window.addEventListener("hashchange", () => loadTela(location.hash));

// Inicializa tela ao carregar página + IP tooltip
document.addEventListener("DOMContentLoaded", () => {
  const btnLogin = document.getElementById("btn-login");
  const btnRegister = document.getElementById("btn-register");

  if (btnLogin) btnLogin.addEventListener("click", () => location.hash = "#login");
  if (btnRegister) btnRegister.addEventListener("click", () => location.hash = "#register");

  loadTela(location.hash);

  fetch("https://api.ipify.org?format=json")
    .then(res => res.json())
    .then(data => {
      const ipTooltip = document.getElementById("ip-tooltip");
      if (ipTooltip) ipTooltip.textContent = data.ip;
    })
    .catch(() => {
      const ipTooltip = document.getElementById("ip-tooltip");
      if (ipTooltip) ipTooltip.textContent = "IP indisponível";
    });
    
    // Simula uma pontuação de reCAPTCHA para teste visual
    fetch('/api/verificar-recaptcha', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: "dummy" })  // não precisa ser real em modo simulado
  })
  .then(res => res.json())
  .then(data => {
    if (data.success && data.score) {
      exibirVerificacaoReCAPTCHA(data.score, data.simulated);
    }
  })
  .catch(err => {
    console.error("Erro ao verificar reCAPTCHA simulado:", err);
    exibirVerificacaoReCAPTCHA(0.91, true); // fallback em caso de erro
  });
});

