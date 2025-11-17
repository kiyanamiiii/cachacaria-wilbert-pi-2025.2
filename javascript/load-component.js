import { API_URL } from "./constants.js";

async function loadComponent(id, file) {
  const el = document.getElementById(id);
  if (!el) return;

  el.style.visibility = "hidden"; // evita flash
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
  } finally {
    el.style.visibility = "visible"; // mostra só depois de carregar
  }
}

async function checkUserAuth() {
  try {
    const token = document.cookie
      .split("; ")
      .find((r) => r.startsWith("auth_token="))
      ?.split("=")[1];
    if (!token) return null;

    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function handleHeaderVisibility() {
  const user = await checkUserAuth();

  const registerLink = document.getElementById("register-link");
  const addProductLink = document.getElementById("add-product-link");
  const logoutLink = document.getElementById("logout-link");
  const cartLink = document.getElementById("cart-link");
  const profileLink = document.getElementById("profile-link");

  if (registerLink) registerLink.style.display = user ? "none" : "inline-block";
  if (logoutLink) logoutLink.style.display = user ? "inline-block" : "none";
  if (addProductLink)
    addProductLink.style.display = user?.is_adm ? "inline-block" : "none";
  if (cartLink)
    cartLink.style.display = !user?.is_adm ? "inline-block" : "none";
  if (profileLink) profileLink.style.display = user ? "inline-block" : "none";
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

// inicialização automática
window.addEventListener("DOMContentLoaded", () => {
  loadComponent("header-container", "/models/header.html");
  loadComponent("footer-container", "/models/footer.html");
});
