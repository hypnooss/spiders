document.addEventListener("DOMContentLoaded", () => {
  // Seleção de botões do topo
  const buttons = document.querySelectorAll("button");
  const cadastroBtn = [...buttons].find(btn => btn.textContent.trim() === "Cadastrar-se");
  const loginBtn = [...buttons].find(btn => btn.textContent.trim() === "Login");

  // Seleção de elementos principais
  const heroText = document.getElementById("hero-text");
  const formRegister = document.getElementById("register-container");
  const formLogin = document.getElementById("login-container");
  const formRecovery = document.getElementById("recovery-container");
  const cadastroAlert = document.getElementById("cadastro-alert");
  const loginAlert = document.getElementById("login-alert");
  const recoveryAlert = document.getElementById("recovery-alert");

  // Links de navegação entre formulários
  const linkToLoginFromRegister = document.getElementById("link-to-login-from-register");
  const linkToRegisterFromLogin = document.getElementById("link-to-register-from-login");
  const linkToRecoveryFromLogin = document.getElementById("link-to-recovery-from-login");
  const linkToLoginFromRecovery = document.getElementById("link-to-login-from-recovery");

  // Obter IP uma única vez para o footer
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

  // Função para mostrar/esconder divs
  function showDiv(target) {
    [heroText, formRegister, formLogin, formRecovery].forEach(div => {
      if (div && div !== target) {
        div.classList.add("hidden");
        div.classList.remove("opacity-100", "scale-100");
      }
    });
    target.classList.remove("hidden");
    target.classList.add("opacity-0", "scale-95");
    setTimeout(() => {
      target.classList.remove("opacity-0", "scale-95");
      target.classList.add("opacity-100", "scale-100");
    }, 20);
  }

  // Eventos dos botões do topo
  if (cadastroBtn && formRegister) {
    cadastroBtn.addEventListener("click", () => showDiv(formRegister));
  }
  if (loginBtn && formLogin) {
    loginBtn.addEventListener("click", () => showDiv(formLogin));
  }

  // Eventos dos links de navegação
  if (linkToLoginFromRegister && formLogin) {
    linkToLoginFromRegister.addEventListener("click", (e) => {
      e.preventDefault();
      showDiv(formLogin);
    });
  }
  if (linkToRegisterFromLogin && formRegister) {
    linkToRegisterFromLogin.addEventListener("click", (e) => {
      e.preventDefault();
      showDiv(formRegister);
    });
  }
  if (linkToRecoveryFromLogin && formRecovery) {
    linkToRecoveryFromLogin.addEventListener("click", (e) => {
      e.preventDefault();
      showDiv(formRecovery);
    });
  }
  if (linkToLoginFromRecovery && formLogin) {
    linkToLoginFromRecovery.addEventListener("click", (e) => {
      e.preventDefault();
      showDiv(formLogin);
    });
  }

  // Funções para exibir alertas inline
  window.mostrarAlertaCadastro = function (mensagem, tipo = 'erro') {
    if (!cadastroAlert) return;
    cadastroAlert.textContent = mensagem;
    cadastroAlert.classList.remove("opacity-0", "text-green-400", "text-yellow-400", "text-red-400");
    if (tipo === 'sucesso') cadastroAlert.classList.add("text-green-400");
    else if (tipo === 'aviso') cadastroAlert.classList.add("text-yellow-400");
    else cadastroAlert.classList.add("text-red-400");
  };

  window.mostrarAlertaLogin = function (mensagem, tipo = 'erro') {
    if (!loginAlert) return;
    loginAlert.textContent = mensagem;
    loginAlert.classList.remove("opacity-0", "text-green-400", "text-yellow-400", "text-red-400");
    if (tipo === 'sucesso') loginAlert.classList.add("text-green-400");
    else if (tipo === 'aviso') loginAlert.classList.add("text-yellow-400");
    else loginAlert.classList.add("text-red-400");
  };

  window.mostrarAlertaRecovery = function (mensagem, tipo = 'erro') {
    if (!recoveryAlert) return;
    recoveryAlert.textContent = mensagem;
    recoveryAlert.classList.remove("opacity-0", "text-green-400", "text-yellow-400", "text-red-400");
    if (tipo === 'sucesso') loginAlert.classList.add("text-green-400");
    else if (tipo === 'aviso') recoveryAlert.classList.add("text-yellow-400");
    else recoveryAlert.classList.add("text-red-400");
  };

  // Limpar alertas ao clicar
  if (cadastroAlert) {
    cadastroAlert.addEventListener("click", () => cadastroAlert.classList.add("opacity-0"));
  }
  if (loginAlert) {
    loginAlert.addEventListener("click", () => loginAlert.classList.add("opacity-0"));
  }
  if (recoveryAlert) {
    recoveryAlert.addEventListener("click", () => recoveryAlert.classList.add("opacity-0"));
  }

  // Funções para feedback visual nos inputs
  const setSuccess = (input) => {
    input.classList.add("ring-2", "ring-green-400");
    const label = input.parentElement.querySelector("label");
    if (label) label.classList.add("text-green-400");
    if (!input.parentElement.querySelector(".valid-icon")) {
      const icon = document.createElement("span");
      icon.textContent = "✅";
      icon.className = "valid-icon absolute right-3 top-1/2 transform -translate-y-1/2 text-green-400 text-sm pointer-events-none";
      input.parentElement.appendChild(icon);
    }
  };

  const clearSuccess = (input) => {
    input.classList.remove("ring-2", "ring-green-400");
    const icon = input.parentElement.querySelector(".valid-icon");
    if (icon) icon.remove();
    const label = input.parentElement.querySelector("label");
    if (label) label.classList.remove("text-green-400");
  };

  // Validação do formulário de cadastro
  const formRegisterEl = formRegister?.querySelector("form");
  if (formRegisterEl) {
    const emailInput = formRegisterEl.querySelector("#email");
    const senhaInput = formRegisterEl.querySelector("#senha");
    const confirmarInput = formRegisterEl.querySelector("#confirmar");

    // Função de validação em tempo real
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

      if (!erro) cadastroAlert.classList.add("opacity-0");
      return !erro;
    };

    // Adicionar eventos de input para validação em tempo real
    [emailInput, senhaInput, confirmarInput].forEach(input => {
      input.classList.add("peer", "placeholder-transparent", "transition-all");
      input.addEventListener("input", validarCamposCadastro);
    });

    // Submissão do formulário de cadastro
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
        btn.textContent = originalText;
        btn.disabled = false;
      }
    });
  }

  // Validação do formulário de login
  const formLoginEl = formLogin?.querySelector("form");
  if (formLoginEl) {
    const emailInput = formLoginEl.querySelector("#login-email");
    const senhaInput = formLoginEl.querySelector("#login-senha");

    // Função de validação em tempo real
    const validarCamposLogin = () => {
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
    };

    // Adicionar eventos de input para validação em tempo real
    [emailInput, senhaInput].forEach(input => {
      input.classList.add("peer", "placeholder-transparent", "transition-all");
      input.addEventListener("input", validarCamposLogin);
    });

    // Submissão do formulário de login
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
            // Futuramente: Redirecionar para página de MFA ou mostrar input de código
            console.log("MFA pendente, user_id:", data.user_id);
          } else {
            mostrarAlertaLogin("Login bem-sucedido!", "sucesso");
            setTimeout(() => {
              window.location.href = "/dashboard.html";
            }, 1500);
          }
        } else {
          const mensagemErro = data.detail === "Conta não ativada"
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
        btn.textContent = originalText;
        btn.disabled = false;
      }
    });
  }

  // Validação do formulário de recuperação
  const formRecoveryEl = formRecovery?.querySelector("form");
  if (formRecoveryEl) {
    const emailInput = formRecoveryEl.querySelector("#recovery-email");

    // Função de validação em tempo real
    const validarCamposRecovery = () => {
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
    };

    // Adicionar evento de input para validação em tempo real
    emailInput.classList.add("peer", "placeholder-transparent", "transition-all");
    emailInput.addEventListener("input", validarCamposRecovery);

    // Submissão do formulário de recuperação
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
        btn.textContent = originalText;
        btn.disabled = false;
      }
    });
  }

  // Labels flutuantes para todos os inputs
  document.querySelectorAll("input").forEach(input => {
    const label = input.parentElement.querySelector(".floating-label");
    if (!label) return;

    function updateLabel() {
      if (input === document.activeElement || input.value.trim()) {
        label.classList.add("active");
        label.style.fontSize = "0.75rem";
        if (input.checkValidity()) label.style.color = "#34d399";
      } else {
        label.classList.remove("active");
        label.style.fontSize = "1rem";
        label.style.color = "#9ca3af";
      }
    }

    input.addEventListener("focus", updateLabel);
    input.addEventListener("blur", updateLabel);
    input.addEventListener("input", updateLabel);
    updateLabel();
  });
});
