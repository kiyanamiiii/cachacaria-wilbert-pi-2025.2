import { API_URL } from "./constants.js";

async function loadComponent(id, file) {
  const el = document.getElementById(id);
  if (!el) return;

  try {
    const resp = await fetch(file);
    if (!resp.ok) throw new Error(`Erro ao carregar ${file}`);
    const html = await resp.text();
    el.innerHTML = html;

    if (id === "header-container") {
      await handleHeaderVisibility();
      setupLogoutButton();
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
      method: "GET",
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
    logoutLink.addEventListener("click", (e) => {
      e.preventDefault();
      logout();
    });
  }

  // Exibe "Adicionar Produto" apenas se for admin
  if (addProductLink) {
    addProductLink.style.display = user?.is_adm ? "inline-block" : "none";
  }

function logout() {
  // Remove o token
  document.cookie =
    "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
  console.log("Usuário deslogado. Redirecionando...");

  // Exibe o link do perfil se estiver logado
  if (profileLink) {
    profileLink.style.display = user ? "inline-block" : "none";
  }
}

function setupLogoutButton() {
  const logoutLink = document.getElementById("logout-link");
  if (!logoutLink) return;

  logoutLink.addEventListener("click", () => {
    document.cookie =
      "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    window.location.href = "/index.html";
  });
}

window.addEventListener("DOMContentLoaded", () => {
  loadComponent("header-container", "/models/header.html");
  loadComponent("footer-container", "/models/footer.html");
});
