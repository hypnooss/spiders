import { setSuccess, clearSuccess, bindFloatingLabels } from './utils.js';

export function initTela() {
  const loginAlert = document.getElementById("login-alert");
  const formLogin = document.getElementById("login-container");
  const formLoginEl = formLogin?.querySelector("form");

  const emailInput = document.getElementById("login-email");
  const senhaInput = document.getElementById("login-senha");

  function mostrarAlertaLogin(mensagem, tipo = 'erro') {
    if (!loginAlert) return;
    loginAlert.textContent = mensagem;
    loginAlert.classList.remove("opacity-0", "text-green-600", "text-yellow-400", "text-red-400");
    if (tipo === "sucesso") loginAlert.classList.add("text-green-600");
    else if (tipo === "aviso") loginAlert.classList.add("text-yellow-400");
    else loginAlert.classList.add("text-red-400");
    loginAlert.classList.remove("opacity-0");
    loginAlert.addEventListener("click", () => loginAlert.classList.add("opacity-0"));
  }

  function validarCamposLogin() {
    let erro = false;
    clearSuccess(emailInput);
    clearSuccess(senhaInput);

    if (!emailInput.checkValidity() || !emailInput.value.trim()) {
      mostrarAlertaLogin("E-mail inválido ou vazio.");
      erro = true;
    } else {
      setSuccess(emailInput);
    }

    if (!senhaInput.value.trim()) {
      mostrarAlertaLogin("Senha não pode estar vazia.");
      erro = true;
    } else {
      setSuccess(senhaInput);
    }

    if (!erro) loginAlert.classList.add("opacity-0");
    return !erro;
  }

  if (emailInput && senhaInput) {
    [emailInput, senhaInput].forEach(input => {
      input.classList.add("peer", "placeholder-transparent", "transition-all");
      input.addEventListener("input", validarCamposLogin);
    });
  }

  if (formLoginEl) {
    formLoginEl.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!validarCamposLogin()) return;

      const email = emailInput.value.trim().toLowerCase();
      const password = senhaInput.value.trim();

      try {
        const btn = formLoginEl.querySelector("button[type='submit']");
        const originalText = btn.textContent;
        btn.textContent = "Entrando...";
        btn.disabled = true;

        const response = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
          if (data.pending_mfa) {
            mostrarAlertaLogin("Autenticação MFA necessária. Insira o código.", "aviso");
            console.log("MFA pendente, user_id:", data.user_id);
          } else {
            mostrarAlertaLogin("Login bem-sucedido!", "sucesso");
            setTimeout(() => {
              window.location.href = "/dashboard.html";
            }, 1500);
          }
        } else {
          const mensagemErro =
            data.detail === "Conta não ativada"
              ? "Por favor, ative sua conta pelo link enviado ao seu e-mail."
              : data.detail === "Credenciais inválidas"
              ? "E-mail ou senha incorretos."
              : data.detail || "Erro ao fazer login.";
          mostrarAlertaLogin(mensagemErro);
        }

        btn.textContent = originalText;
        btn.disabled = false;
      } catch (err) {
        console.error("Erro na chamada à API:", err);
        mostrarAlertaLogin("Erro de conexão com o servidor.");
        btn.textContent = "Entrar";
        btn.disabled = false;
      }
    });
  }

  bindFloatingLabels();
}

