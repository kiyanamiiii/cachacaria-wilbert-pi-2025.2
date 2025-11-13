import { API_URL } from "./constants.js";

async function getAuthToken() {
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("auth_token="))
    ?.split("=")[1];
  return token;
}

// ========== Função principal ==========
async function renderCart() {
  const container = document.getElementById("cart-products");
  const token = await getAuthToken();
  if (!token) {
    container.innerHTML = `
      <p class="text-center text-muted mt-3">Você precisa estar logado para ver seu carrinho.</p>
      <div class="text-center">
        <button class="btn btn-primary" onclick="window.location.href='/pages/login.html'">
          Fazer login
        </button>
      </div>`;
    return;
  }

  const cart = await fetchCart(token);
  container.innerHTML = "";

  if (!cart || cart.length === 0) {
    container.innerHTML = `
      <p class="text-center text-muted mt-3">Carrinho vazio? Continue explorando!</p>
      <div class="text-center">
        <button class="btn btn-primary" onclick="window.location.href='/index.html'">
          Acessar
        </button>
      </div>`;
    updateCartSummary([]);
    return;
  }

  // Renderiza produtos
  cart.forEach((item) => {
    const quantity = item.quantity || 1;
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
          <small class="text-muted">Preço unitário</small>
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

  // Eventos de quantidade
  container.querySelectorAll(".decrease-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      const item = cart.find((i) => i.product.id == id);
      const newQty = Math.max(1, item.quantity - 1);
      await updateQuantity(id, newQty, token);
    });
  });

  container.querySelectorAll(".increase-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      const item = cart.find((i) => i.product.id == id);
      const newQty = item.quantity + 1;
      await updateQuantity(id, newQty, token);
    });
  });

  container.querySelectorAll(".quantity-input").forEach((input) => {
    input.addEventListener("change", async (e) => {
      const id = e.target.dataset.id;
      const value = parseInt(e.target.value);
      if (!isNaN(value) && value > 0) {
        await updateQuantity(id, value, token);
      }
    });
  });

  container.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.currentTarget.dataset.id;
      await removeFromCart(id, token);
    });
  });

  const continueBtn = document.querySelector(".preco button");
  if (continueBtn) {
    continueBtn.textContent = `Continuar (${cart.length})`;
    continueBtn.addEventListener("click", () => {
      window.location.href = "/pages/paymentPage.html";
    });
  }
}

// ========== Funções auxiliares ==========
async function fetchCart(token) {
  console.log("Buscando carrinho com token:", token);

  try {
    const res = await fetch(`${API_URL}/cart`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Falha ao buscar carrinho");
    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

async function updateQuantity(productId, quantity, token) {
  try {
    const res = await fetch(`${API_URL}/cart/${productId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ quantity }),
    });
    if (!res.ok) throw new Error("Erro ao atualizar quantidade");
    await renderCart();
  } catch (err) {
    console.error(err);
  }
}

async function removeFromCart(productId, token) {
  try {
    const res = await fetch(`${API_URL}/cart/${productId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Erro ao remover produto");
    await renderCart();
  } catch (err) {
    console.error(err);
  }
}

function updateCartSummary(cart) {
  const total = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  document.querySelector(
    ".preco p"
  ).textContent = `Estimativa total: R$ ${total.toFixed(2)}`;
}

document.addEventListener("DOMContentLoaded", renderCart);
