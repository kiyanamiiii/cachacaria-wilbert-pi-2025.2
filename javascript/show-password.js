document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".toggle-password");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetSelector = btn.getAttribute("data-target");
      if (!targetSelector) return;
      const input = document.querySelector(targetSelector);
      if (!input) return;

      const icon = btn.querySelector("i");
      const isPassword = input.type === "password";
      input.type = isPassword ? "text" : "password";

      if (icon) {
        icon.classList.toggle("bi-eye", !isPassword);
        icon.classList.toggle("bi-eye-slash", isPassword);
      }

      btn.setAttribute(
        "aria-label",
        isPassword ? "Ocultar senha" : "Mostrar senha"
      );
    });
  });
});
