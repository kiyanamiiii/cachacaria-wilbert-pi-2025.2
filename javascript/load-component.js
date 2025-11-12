import { API_URL } from './constants.js';

async function loadComponent(id, file) {
  const el = document.getElementById(id);
  if (!el) return;

  try {
    const resp = await fetch(file);
    if (!resp.ok) throw new Error(`Erro ao carregar ${file}`);
    const html = await resp.text();
    el.innerHTML = html;

    // Run auth check after the header loads
    if (id === "header-container") {
      await handleHeaderVisibility();
    }
  } catch (err) {
    console.error(err);
  }
}

async function checkUserAuth() {
  try {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth_token='))
      ?.split('=')[1];

    if (!token) return false;

    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) return false;

    const user = await response.json();
    return user;
  } catch (err) {
    console.error('Erro ao verificar autenticação:', err);
    return false;
  }
}

async function handleHeaderVisibility() {
  const user = await checkUserAuth();
  const header = document.getElementById('header-container');
  const registerLink = header?.querySelector('a[href="/pages/register.html"]');
  const addProductLink = header?.querySelector('#add-product-link');
  const profileLink = header?.querySelector('#profile-link');

  if (registerLink) {
    registerLink.style.display = user ? 'none' : 'inline-block';
  }

  if (addProductLink) {
    addProductLink.style.display = user?.is_adm ? 'inline-block' : 'none';
  }

  if (profileLink) {
    addProductLink.style.display = user?.is_adm ? 'inline-block' : 'none';
  }
}

window.addEventListener("DOMContentLoaded", () => {
  loadComponent("header-container", "/models/header.html");
  loadComponent("footer-container", "/models/footer.html");
});
