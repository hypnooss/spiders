import { setSuccess, clearSuccess, bindFloatingLabels } from './utils.js';

export function initTela() {
  const registerAlert = document.getElementById("register-alert");
  const formRegister = document.getElementById("register-container");
  const formRegisterEl = formRegister?.querySelector("form");

  const emailInput = formRegisterEl?.querySelector("#email");
  const senhaInput = formRegisterEl?.querySelector("#senha");
  const confirmarInput = formRegisterEl?.querySelector("#confirmar");

  function mostrarAlertaCadastro(mensagem, tipo = 'erro') {
    if (!registerAlert) return;
    registerAlert.textContent = mensagem;
    registerAlert.classList.remove("opacity-0", "text-green-400", "text-yellow-400", "text-red-400");
    if (tipo === 'sucesso') registerAlert.classList.add("text-green-400");
    else if (tipo === 'aviso') registerAlert.classList.add("text-yellow-400");
    else registerAlert.classList.add("text-red-400");

    registerAlert.classList.remove("opacity-0");
    registerAlert.addEventListener("click", () => registerAlert.classList.add("opacity-0"));
  }

  const validarCamposCadastro = () => {
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim().toLowerCase());
    const senha = senhaInput.value;
    const confirmar = confirmarInput.value;

    const regrasSenha = [
      { teste: /.{6,}/, mensagem: "A senha deve ter no mínimo 6 caracteres." },
      { teste: /[A-Z]/, mensagem: "A senha deve conter ao menos uma letra maiúscula." },
      { teste: /[a-z]/, mensagem: "A senha deve conter ao menos uma letra minúscula." },
      { teste: /[0-9]/, mensagem: "A senha deve conter ao menos um número." },
      { teste: /[^A-Za-z0-9]/, mensagem: "A senha deve conter ao menos um caractere especial." },
    ];

    let erro = false;
    clearSuccess(emailInput);
    clearSuccess(senhaInput);
    clearSuccess(confirmarInput);

    if (!emailValido || !emailInput.value.trim()) {
      mostrarAlertaCadastro("Por favor, insira um e-mail válido.");
      erro = true;
    } else {
      setSuccess(emailInput);
    }

    for (let regra of regrasSenha) {
      if (!regra.teste.test(senha)) {
        mostrarAlertaCadastro(regra.mensagem);
        erro = true;
        break;
      }
    }

    if (!erro && senha === confirmar && senha !== "") {
      setSuccess(senhaInput);
      setSuccess(confirmarInput);
    } else {
      if (senha !== confirmar || confirmar === "") {
        mostrarAlertaCadastro("As senhas não coincidem.");
        erro = true;
      }
    }

    if (!erro) registerAlert.classList.add("opacity-0");
    return !erro;
  };

  // Validação em tempo real
  if (emailInput && senhaInput && confirmarInput) {
    [emailInput, senhaInput, confirmarInput].forEach(input => {
      input.classList.add("peer", "placeholder-transparent", "transition-all");
      input.addEventListener("input", validarCamposCadastro);
    });
  }

  // Submissão do formulário
  if (formRegisterEl) {
    formRegisterEl.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!validarCamposCadastro()) return;

      const email = emailInput.value.trim().toLowerCase();
      const password = senhaInput.value.trim();

      try {
        const btn = formRegisterEl.querySelector("button[type='submit']");
        const originalText = btn.textContent;
        btn.textContent = "Registrando...";
        btn.disabled = true;

        const response = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
          mostrarAlertaCadastro("Cadastro realizado com sucesso!", "sucesso");
          setTimeout(() => {
            window.location.href = "confirm.html?status=registered";
          }, 1500);
        } else {
          const mensagemErro = data.detail === "Email já registrado"
            ? "Este e-mail já está cadastrado."
            : data.detail || "Erro ao realizar o cadastro.";
          mostrarAlertaCadastro(mensagemErro);
        }

        btn.textContent = originalText;
        btn.disabled = false;
      } catch (err) {
        console.error("Erro na chamada à API:", err);
        mostrarAlertaCadastro("Erro de conexão com o servidor.");
        btn.textContent = "Cadastrar";
        btn.disabled = false;
      }
    });
  }

  bindFloatingLabels();
}

