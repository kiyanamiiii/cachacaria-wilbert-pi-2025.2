import { API_URL } from "./constants.js";

async function getAuthToken() {
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("auth_token="))
    ?.split("=")[1];
  return token;
}

function formatPriceBR(value) {
  return value.toFixed(2).replace(".", ",");
}

document.addEventListener("DOMContentLoaded", async () => {
  const list = document.querySelector(".summary-box ul");
  const totalEl = document.querySelector(".summary-box .total");

  if (!list) return;

  list.innerHTML = "";

  const token = await getAuthToken();

  if (!token) {
    list.innerHTML = `<li class="text-center text-muted">É necessário estar logado.</li>`;
    totalEl.textContent = "Total: R$ 0,00";
    return;
  }

  // ===========================
  // Consultar carrinho na API
  // ===========================
  let cart = [];

  try {
    const res = await fetch(`${API_URL}/cart`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Erro ao buscar carrinho");

    cart = await res.json();
  } catch (err) {
    console.error(err);
    list.innerHTML = `<li class="text-center text-muted">Erro ao carregar o carrinho.</li>`;
    totalEl.textContent = "Total: R$ 0,00";
    return;
  }

  if (!cart || cart.length === 0) {
    list.innerHTML = `<li class="text-center text-muted">Carrinho vazio.</li>`;
    totalEl.textContent = "Total: R$ 0,00";
    return;
  }

  // ======================
  // Renderizar itens
  // ======================
  let itemsTotal = 0;

  cart.forEach((item) => {
    const price = item.product.price * item.quantity;
    itemsTotal += price;

    const li = document.createElement("li");
    li.innerHTML = `
      <span>${item.product.name} ${item.quantity > 1 ? "×" + item.quantity : ""}</span>
      <span>R$ ${formatPriceBR(price)}</span>
    `;

    list.appendChild(li);
  });

  // Frete fixo
  const shipping = 15.0;
  const liFrete = document.createElement("li");
  liFrete.innerHTML = `
      <span>Frete</span>
      <span>R$ ${formatPriceBR(shipping)}</span>
  `;
  list.appendChild(liFrete);

  // Total final
  const total = itemsTotal + shipping;
  totalEl.textContent = `Total: R$ ${formatPriceBR(total)}`;
});
