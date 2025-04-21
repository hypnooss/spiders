export function initTela() {
  const params = new URLSearchParams(window.location.hash.split("?")[1]);
  const status = params.get("status");

  const container = document.getElementById("confirm-container");
  const title = container.querySelector("h1");
  const message = container.querySelector("p");
  const countdown = document.getElementById("timer");
  const button = container.querySelector("a");

  if (status === "used") {
    title.textContent = "⚠️ Token de ativação já utilizado";
    message.textContent = "Esse token de ativação não é mais válido, por ter sido utilizado anteriormente.";
    countdown.textContent = "10";
    button.textContent = "Voltar ao login";
    button.href = "index.html#login";
  } else if (status === "invalid") {
    title.textContent = "❌ Token de ativação inválido ou expirado";
    message.textContent = "Esse token de ativação não é mais válido.";
    countdown.textContent = "10";
    button.textContent = "Voltar ao início";
    button.href = "index.html#hero";
  } else {
    title.textContent = "✅ Ativação realizada com sucesso";
    message.textContent = "Sua conta foi ativada. Você pode agora fazer login.";
    countdown.textContent = "15";
    button.textContent = "Ir para login";
    button.href = "index.html#login";
  }

  container.classList.remove("hidden");

  let seconds = parseInt(countdown.textContent);
  const interval = setInterval(() => {
    seconds--;
    countdown.textContent = seconds;
    if (seconds <= 0) {
      clearInterval(interval);
      window.location.href = button.href;
    }
  }, 1000);
}

