import { API_URL } from "./constants.js";

document.addEventListener("DOMContentLoaded", function () {
  // LOGIN
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async function (ev) {
      ev.preventDefault();

      const email = document.getElementById("loginEmail")?.value || "";
      const password = document.getElementById("loginPassword")?.value || "";
      const feedback = document.getElementById("login-feedback");

      if (!email || !password) {
        if (feedback) {
          feedback.textContent = "Preencha todos os campos.";
          feedback.style.color = "red";
        }
        return;
      }

      try {
        const response = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          if (feedback) {
            feedback.textContent = `Erro: ${
              data.message || "erro desconhecido"
            }`;
            feedback.classList.add("text-danger");
          }
          return;
        }

        if (data["status"] !== 0) {
          if (feedback) {
            feedback.textContent = data.message;
            feedback.classList.add("text-danger");
          }
          return;
        }

        if (data.token) {
          document.cookie = `auth_token=${data.token}; path=/; secure; samesite=strict`;
        }

        if (feedback) {
          feedback.classList.remove("text-danger");
          feedback.classList.remove("text-success");
          feedback.textContent = "Login bem-sucedido!";
          feedback.classList.add("text-success");
        }

        setTimeout(() => (window.location.href = "/index.html"), 800);
      } catch (err) {
        console.error("Erro ao conectar:", err);
        if (feedback) {
          feedback.textContent = "Erro ao se conectar com o servidor.";
          feedback.classList.add("text-danger");
        }
      }
    });
  }

  // REGISTER
  const registerForm = document.getElementById("register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", async function (ev) {
      ev.preventDefault();

      const email = document.getElementById("regEmail")?.value || "";
      const password = document.getElementById("regPassword")?.value || "";
      const phone = document.getElementById("phone")?.value || "";
      const feedback = document.getElementById("register-feedback");

      if (!email || !password || !phone) {
        if (feedback) {
          feedback.textContent = "Preencha todos os campos.";
          feedback.style.color = "red";
        }
        return;
      }

      try {
        const response = await fetch(`${API_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, phone }),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          if (feedback) {
            feedback.textContent = `Erro: ${
              data.message || "erro desconhecido"
            }`;
            feedback.classList.add("text-danger");
          }
          return;
        }

        if (data["status"] !== 0) {
          if (feedback) {
            feedback.textContent = data.message;
            feedback.style.color = "red";
            feedback.classList.add("text-danger");
          }
          return;
        }

        if (data.token) {
          document.cookie = `auth_token=${data.token}; path=/; secure; samesite=strict`;
        }

        if (feedback) {
          feedback.classList.remove("text-danger");
          feedback.classList.remove("text-success");
          feedback.textContent = "Registro bem-sucedido!";
          feedback.classList.add("text-success");
        }

        setTimeout(() => (window.location.href = "/index.html"), 800);
      } catch (err) {
        console.error("Erro ao conectar:", err);
        if (feedback) {
          feedback.textContent = "Erro ao se conectar com o servidor.";
          feedback.style.color = "red";
        }
      }
    });
  }
});
