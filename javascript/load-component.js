import { API_URL } from "./constants.js";

async function loadComponent(id, file) {
  const el = document.getElementById(id);
  if (!el) return;

  try {
    const resp = await fetch(file);
    if (!resp.ok) throw new Error(`Erro ao carregar ${file}`);
    const html = await resp.text();
    el.innerHTML = html;

    // Executa lógica de autenticação apenas quando o header for carregado
    if (id === "header-container") {
      await handleHeaderVisibility();
      setupLogoutButton(); // inicializa o botão de logout aqui
    }
  } catch (err) {
    console.error(err);
  }
}

async function checkUserAuth() {
  try {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("auth_token="))
      ?.split("=")[1];

    if (!token) return false;

    const response = await fetch(`${API_URL}/auth/me`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) return false;

    const user = await response.json();
    return user;
  } catch (err) {
    console.error("Erro ao verificar autenticação:", err);
    return false;
  }
}

async function handleHeaderVisibility() {
  const user = await checkUserAuth();

  const registerLink = document.querySelector('a[href="/pages/register.html"]');
  const addProductLink = document.getElementById("add-product-link");
  const logoutLink = document.getElementById("logout-link");

  // Oculta o link de registro se estiver logado
  if (registerLink) {
    registerLink.style.display = user ? "none" : "inline-block";
  }

  // Exibe o botão "Sair" se o usuário estiver logado
  if (logoutLink) {
    logoutLink.style.display = user ? "inline-block" : "none";
  }

  // Exibe "Adicionar Produto" apenas se for admin
  if (addProductLink) {
    addProductLink.style.display = user?.is_adm ? "inline-block" : "none";
  }
}

// 🔹 Configura o botão de logout apenas se ele existir
function setupLogoutButton() {
  const logoutLink = document.getElementById("logout-link");
  if (!logoutLink) return;

  logoutLink.addEventListener("click", () => {
    // Remove o token
    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    // Redireciona para a página principal
    window.location.href = "/index.html";
  });
}

// 🔹 Carrega os componentes em qualquer página
window.addEventListener("DOMContentLoaded", () => {
  loadComponent("header-container", "/models/header.html");
  loadComponent("footer-container", "/models/footer.html");
});
