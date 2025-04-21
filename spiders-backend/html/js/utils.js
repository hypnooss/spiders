// Função para colocar o estado de sucesso de um input
export function setSuccess(input) {
  input.classList.add("ring-2", "ring-green-600");
  const label = input.parentElement.querySelector("label");
  if (label) label.classList.add("text-green-600");
  if (!input.parentElement.querySelector(".valid-icon")) {
    const icon = document.createElement("span");
    icon.textContent = "✅";
    icon.className = "valid-icon absolute right-3 top-1/2 transform -translate-y-1/2 text-green-600 text-sm pointer-events-none";
    input.parentElement.appendChild(icon);
  }
}

// Função para limpar o estado de sucesso de um input
export function clearSuccess(input) {
  input.classList.remove("ring-2", "ring-green-400", "ring", "ring-gray-500", "ring-green-600");
  const icon = input.parentElement.querySelector(".valid-icon");
  if (icon) icon.remove();
  const label = input.parentElement.querySelector("label");
  if (label) label.classList.remove("text-green-400", "text-green-600");
}

// Função para aplicar labels flutuantes com base no valor/foco do input
export function bindFloatingLabels() {
  document.querySelectorAll("input").forEach(input => {
    const label = input.parentElement.querySelector(".floating-label");
    if (!label) return;

    function updateLabel() {
      if (input === document.activeElement || input.value.trim()) {
        label.classList.add("active");
        label.style.fontSize = "0.75rem";
        if (input.checkValidity()) label.style.color = "#34d399"; // Tailwind: text-green-400
      } else {
        label.classList.remove("active");
        label.style.fontSize = "1rem";
        label.style.color = "#9ca3af"; // Tailwind: text-gray-400
      }
    }

    input.addEventListener("focus", updateLabel);
    input.addEventListener("blur", updateLabel);
    input.addEventListener("input", updateLabel);
    updateLabel();
  });
}

//Função para exibir a verificação do reCAPTCHA
export function exibirVerificacaoReCAPTCHA(score, simulated = false) {
  const icon = document.getElementById('recaptcha-icon');
  const tooltip = document.getElementById('recaptcha-tooltip');

  console.log("🛡️ Função chamada com:", { score, simulated, icon, tooltip });

  if (!icon || !tooltip) {
  console.warn("⚠️ Elemento não encontrado para exibir o ícone do reCAPTCHA");
  return;
  }

  tooltip.textContent = `Confiança: ${score.toFixed(2)}${simulated ? " ⚠️" : ""}`;
  icon.style.display = 'flex';
  window.lucide.createIcons();
}

