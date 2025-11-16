import { API_URL } from "./constants.js";

async function getAuthToken() {
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("auth_token="))
    ?.split("=")[1];
  return token;
}

async function renderCart() {
  const container = document.getElementById("cart-products");
  const token = await getAuthToken();

  // Usuário não logado
  if (!token) {
    container.innerHTML = `
      <p class="text-center text-muted mt-3">Você precisa estar logado para ver seu carrinho.</p>
      <div class="text-center">
        <button class="btn btn-primary" onclick="window.location.href='/pages/login.html'">
          Fazer login
        </button>
      </div>`;
    updateCartSummary([]);
    return;
  }

  const cart = await fetchCart(token);

  // Carrinho vazio
  if (!cart || cart.length === 0) {
    container.innerHTML = `
      <p class="text-center text-muted mt-3">Seu carrinho está vazio.</p>
      <div class="text-center">
        <button class="btn btn-primary" onclick="window.location.href='/index.html'">
          Explorar produtos
        </button>
      </div>`;
    updateCartSummary([]);
    return;
  }

  // Carrinho com produtos
  container.innerHTML = "";

  cart.forEach((item) => {
    const quantity = item.quantity;
    const product = item.product;

    const div = document.createElement("div");
    div.className =
      "card mb-3 shadow-sm p-3 d-flex flex-row justify-content-between align-items-center";

    div.innerHTML = `
      <div class="d-flex align-items-center gap-3">
        <img src="${product.photos[0]}" alt="${product.name}" style="width: 100px; border-radius: 8px;">

        <div>
          <h5 class="mb-1">${product.name}</h5>
          <p class="mb-1 text-muted">${product.description || ""}</p>
          <p class="fw-bold mb-0 text-success">R$ ${product.price.toFixed(2)}</p>

          <div class="mt-2 d-flex align-items-center gap-2">
            <label class="fw-semibold mb-0">Quantidade</label>

            <div class="quantity-group" data-id="${product.id}">
              <button class="decrease-btn" type="button" data-id="${product.id}">−</button>
              <input type="text" class="quantity-input" value="${quantity}" data-id="${product.id}">
              <button class="increase-btn" type="button" data-id="${product.id}">+</button>
            </div>
          </div>
        </div>
      </div>

      <button class="btn btn-outline-danger btn-sm delete-btn" data-id="${product.id}">
        <i class="bi bi-trash"></i>
      </button>
    `;

    container.appendChild(div);
  });

  updateCartSummary(cart);

  addQuantityEvents(cart, token);
  addDeleteEvents(token);
  updateContinueButton(cart);
}

async function fetchCart(token) {
  try {
    const res = await fetch(`${API_URL}/cart`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Erro ao buscar carrinho");

    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

async function updateQuantity(productId, quantity, token) {
  try {
    await fetch(`${API_URL}/cart/${productId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ quantity }),
    });

    renderCart();
  } catch (err) {
    console.error(err);
  }
}

async function removeFromCart(productId, token) {
  try {
    await fetch(`${API_URL}/cart/${productId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    renderCart();
  } catch (err) {
    console.error(err);
  }
}

function updateCartSummary(cart) {
  const total = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  document.querySelector(".preco p").textContent =
    `Estimativa total: R$ ${total.toFixed(2)}`;
}

function addQuantityEvents(cart, token) {
  document.querySelectorAll(".decrease-btn").forEach((btn) =>
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const item = cart.find((i) => i.product.id == id);
      const newQty = Math.max(1, item.quantity - 1);
      updateQuantity(id, newQty, token);
    })
  );

  document.querySelectorAll(".increase-btn").forEach((btn) =>
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const item = cart.find((i) => i.product.id == id);
      updateQuantity(id, item.quantity + 1, token);
    })
  );

  document.querySelectorAll(".quantity-input").forEach((input) =>
    input.addEventListener("change", (e) => {
      const id = e.target.dataset.id;
      const value = parseInt(e.target.value);
      if (!isNaN(value) && value > 0) updateQuantity(id, value, token);
    })
  );
}

function addDeleteEvents(token) {
  document.querySelectorAll(".delete-btn").forEach((btn) =>
    btn.addEventListener("click", () => {
      removeFromCart(btn.dataset.id, token);
    })
  );
}

function updateContinueButton(cart) {
  const btn = document.querySelector(".preco button");
  btn.textContent = `Continuar (${cart.length})`;
  btn.disabled = cart.length === 0;

  if (cart.length > 0) {
    btn.addEventListener("click", () => {
      window.location.href = "/pages/paymentPage.html";
    });
  }
}

document.addEventListener("DOMContentLoaded", renderCart);
