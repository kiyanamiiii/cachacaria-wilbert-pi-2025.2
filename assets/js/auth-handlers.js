// Toggle de senha (mostrar/ocultar)
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

// Função utilitária para lidar com formulários simples
function handleForm(formId, feedbackId, successText) {
  const form = document.getElementById(formId);
  const fb = document.getElementById(feedbackId);
  if (!form) return;

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      if (fb) fb.textContent = "Corrija os campos destacados.";
      return;
    }
    if (fb) fb.textContent = successText;
  });
}

const popupModalDelay = 1500 // ms

// LOGIN
document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("login-form");
  if (!loginForm) return;

  loginForm.addEventListener("submit", async function (ev) {
    ev.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    const feedback = document.getElementById("login-feedback");

    if (!email || !password) {
      feedback.textContent = "Preencha todos os campos.";
      feedback.style.color = "red";
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        feedback.textContent = `Erro: ${data.message || "erro desconhecido"}`;
        feedback.style.color = "red";
        return;
      }

      // Armazenar token no cookie com HttpOnly
      if (data.token) {
        document.cookie = `auth_token=${data.token}; path=/; secure; samesite=strict; HttpOnly`;
      }

      feedback.textContent = "Login bem-sucedido!";
      feedback.style.color = "green";

      redirectToHomePage("Login bem-sucedido!", "Redirecionando para a página home");

    } catch (err) {
      console.error("Erro ao conectar:", err);
      feedback.textContent = "Erro ao se conectar com o servidor.";
      feedback.style.color = "red";
    }
  });

  // Verificar se o usuário já está logado ao carregar a página
  checkLoginStatus();
});

// REGISTRO
document.addEventListener("DOMContentLoaded", function () {
  const registerForm = document.getElementById("register-form");
  if (!registerForm) return;

  registerForm.addEventListener("submit", async function (ev) {
    ev.preventDefault();

    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;
    const phone = document.getElementById("regPhone").value;
    const feedback = document.getElementById("register-feedback");

    if (!email || !password || !phone) {
      feedback.textContent = "Preencha todos os campos.";
      feedback.style.color = "red";
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        feedback.textContent = `Erro: ${data.message || "erro desconhecido"}`;
        feedback.style.color = "red";
        return;
      }

      if (data.token) {
        document.cookie = `auth_token=${data.token}; path=/; secure; samesite=strict; HttpOnly`;
      }

      feedback.textContent = "Registro bem-sucedido!";
      feedback.style.color = "green";
      redirectToHomePage("Registro bem-sucedido!", "Redirecionando para a página home");

    } catch (err) {
      console.error("Erro ao conectar:", err);
      feedback.textContent = "Erro ao se conectar com o servidor.";
      feedback.style.color = "red";
    }
  });
});

// Função para verificar se o usuário está logado (token no cookie)
function checkLoginStatus() {
  const token = getCookie("auth_token");

  if (token) {
    // Esconder as opções de login e registro se já estiver logado
    document.getElementById("login-button").style.display = "none";
    document.getElementById("register-button").style.display = "none";
  } else {
    document.getElementById("login-button").style.display = "block";
    document.getElementById("register-button").style.display = "block";
  }
}

// Função para pegar o valor de um cookie pelo nome
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

function redirectToHomePage(title, message) {
  var modal = window.modalHelper.create(
    "auth-modal",
    title,
    message
  );
  modal.show();

  setTimeout(function () {
    try { modal.hide(); } catch (e) { }
    window.location.href = "index.html";
  }, popupModalDelay);
}
