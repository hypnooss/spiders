import { setSuccess, clearSuccess, bindFloatingLabels } from './utils.js';

export function initTela() {
  console.log("Tela de recuperação iniciada");

  const recoveryAlert = document.getElementById("recovery-alert");
  const formRecovery = document.getElementById("recovery-container");
  const formRecoveryEl = formRecovery?.querySelector("form");

  const emailInput = document.getElementById("recovery-email");

  function mostrarAlertaRecovery(mensagem, tipo = 'erro') {
    if (!recoveryAlert) return;
    recoveryAlert.textContent = mensagem;
    recoveryAlert.classList.remove("opacity-0", "text-green-400", "text-yellow-400", "text-red-400");
    if (tipo === 'sucesso') recoveryAlert.classList.add("text-green-400");
    else if (tipo === 'aviso') recoveryAlert.classList.add("text-yellow-400");
    else recoveryAlert.classList.add("text-red-400");

    recoveryAlert.classList.remove("opacity-0");
    recoveryAlert.addEventListener("click", () => recoveryAlert.classList.add("opacity-0"));
  }

  function validarCamposRecovery() {
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim().toLowerCase());
    clearSuccess(emailInput);

    if (!emailValido || !emailInput.value.trim()) {
      mostrarAlertaRecovery("Por favor, insira um e-mail válido.");
      return false;
    } else {
      setSuccess(emailInput);
      recoveryAlert.classList.add("opacity-0");
      return true;
    }
  }

  if (emailInput) {
    emailInput.classList.add("peer", "placeholder-transparent", "transition-all");
    emailInput.addEventListener("input", validarCamposRecovery);
  }

  if (formRecoveryEl) {
    formRecoveryEl.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!validarCamposRecovery()) return;

      const email = emailInput.value.trim().toLowerCase();

      try {
        const btn = formRecoveryEl.querySelector("button[type='submit']");
        const originalText = btn.textContent;
        btn.textContent = "Enviando...";
        btn.disabled = true;

        const response = await fetch("/api/recovery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (response.ok) {
          mostrarAlertaRecovery("Instruções enviadas, verifique seu e-mail.", "sucesso");
        } else {
          mostrarAlertaRecovery(data.detail || "Erro ao processar solicitação.");
        }

        btn.textContent = originalText;
        btn.disabled = false;
      } catch (err) {
        console.error("Erro na chamada à API:", err);
        mostrarAlertaRecovery("Erro de conexão com o servidor.");
        btn.textContent = "Enviar";
        btn.disabled = false;
      }
    });
  }

  bindFloatingLabels();
}

