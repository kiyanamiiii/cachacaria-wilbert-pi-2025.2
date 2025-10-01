// js/show-password.js
(function (document) {
  "use strict";

  // toggle password
  document.addEventListener("click", function (ev) {
    var btn = ev.target.closest && ev.target.closest(".toggle-password");
    if (!btn) return;

    var selector = btn.dataset.target || btn.getAttribute("data-target");
    if (!selector) return;

    var input = document.querySelector(selector);
    if (!input) return;

    var icon = btn.querySelector("i");
    if (input.type === "password") {
      input.type = "text";
      if (icon) {
        icon.classList.remove("bi-eye");
        icon.classList.add("bi-eye-slash");
      }
      btn.setAttribute("aria-pressed", "true");
      btn.setAttribute("aria-label", "ocultar senha");
    } else {
      input.type = "password";
      if (icon) {
        icon.classList.remove("bi-eye-slash");
        icon.classList.add("bi-eye");
      }
      btn.setAttribute("aria-pressed", "false");
      btn.setAttribute("aria-label", "mostrar senha");
    }
  });
})(document);
