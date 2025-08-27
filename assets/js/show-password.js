// show-password.js
document.addEventListener("click", function (e) {
  const btn = e.target.closest(".toggle-password");
  if (!btn) return;

  const targetSelector = btn.dataset.target;
  const input = document.querySelector(
    targetSelector || btn.getAttribute("data-target")
  );
  if (!input) return;

  const icon = btn.querySelector("i");
  if (input.type === "password") {
    input.type = "text";
    if (icon) {
      icon.classList.remove("bi-eye");
      icon.classList.add("bi-eye-slash");
    }
    btn.setAttribute("aria-pressed", "true");
    btn.setAttribute("aria-label", "Ocultar senha");
  } else {
    input.type = "password";
    if (icon) {
      icon.classList.remove("bi-eye-slash");
      icon.classList.add("bi-eye");
    }
    btn.setAttribute("aria-pressed", "false");
    btn.setAttribute("aria-label", "Mostrar senha");
  }
});

// simple form preventDefault + minimal feedback
function handleForm(formId, feedbackId, successText) {
  const form = document.getElementById(formId);
  const fb = document.getElementById(feedbackId);
  if (!form) return;
  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    // basic validation UI: use HTML5 validity
    if (!form.checkValidity()) {
      form.reportValidity();
      if (fb) fb.textContent = "Corrija os campos destacados.";
      return;
    }
    if (fb) fb.textContent = successText;
    // você pode adicionar aqui ações simuladas (ex: limpar campos)
    // setTimeout(() => form.reset(), 600);
  });
}

document.addEventListener("DOMContentLoaded", function () {
  handleForm(
    "login-form",
    "login-feedback",
    "Simulação: login bem-sucedido (não real)."
  );
  handleForm("register-form", "register-feedback", "Conta criada (simulação).");
});
