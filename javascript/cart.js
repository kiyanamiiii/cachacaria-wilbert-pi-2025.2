import { API_URL } from "./constants.js";

function renderCart() {
  const container = document.getElementById("cart-products");
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  container.innerHTML = "";

  const summaryItemsEl = document.getElementById("summary-items");
  const summarySubtotalEl = document.getElementById("summary-subtotal");
  const summaryTotalEl = document.getElementById("summary-total");
  const checkoutBtn = document.getElementById("checkout-btn");

  if (cart.length === 0) {
    container.innerHTML = `
      <p class="text-center text-muted mt-3">
        Carrinho vazio? Continue explorando
      </p>
      <div class="text-center">
        <button class="btn btn-primary" onclick="window.location.href='/index.html'">
          Ver produtos
        </button>
      </div>
    `;

    if (summaryItemsEl) summaryItemsEl.textContent = "0";
    if (summarySubtotalEl) summarySubtotalEl.textContent = "R$ 0.00";
    if (summaryTotalEl) summaryTotalEl.textContent = "R$ 0.00";
    if (checkoutBtn) {
      checkoutBtn.textContent = "Continuar (0)";
      checkoutBtn.disabled = true;
    }

    return;
  }

  // Renderiza os produtos
  cart.forEach((product, index) => {
    const quantity = product.qty || 1;

    const item = document.createElement("div");
    item.className =
      "card mb-3 shadow-sm p-3 d-flex flex-row justify-content-between align-items-center";

    item.innerHTML = `
      <div class="d-flex align-items-center gap-3">
        <img src="${product.image}" alt="${
      product.name
    }" style="width: 100px; border-radius: 8px; object-fit: cover;">
        <div class="flex-grow-1">
          <h5 class="mb-1">${product.name}</h5>
          <p class="mb-1 text-muted">${product.description || ""}</p>
          <p class="fw-bold mb-0 text-success">R$ ${product.price.toFixed(
            2
          )}</p>
          <small class="text-muted">Preço unitário</small>
          <div class="mt-2 d-flex align-items-center gap-2">
            <label class="fw-semibold mb-0">Quantidade</label>
            <div class="quantity-group" data-index="${index}">
              <button class="decrease-btn btn btn-outline-secondary btn-sm" type="button" data-index="${index}">−</button>
              <input type="number" class="quantity-input form-control" value="${quantity}" min="1" data-index="${index}" style="width:80px; text-align:center; display:inline-block;">
              <button class="increase-btn btn btn-outline-secondary btn-sm" type="button" data-index="${index}">+</button>
            </div>
          </div>
        </div>
      </div>

      <div class="ms-3 text-end">
        <div class="fw-semibold mb-2">R$ ${(product.price * quantity).toFixed(
          2
        )}</div>
        <button class="btn btn-outline-danger btn-sm delete-btn" data-index="${index}">
          <i class="bi bi-trash"></i> Remover
        </button>
      </div>
    `;

    container.appendChild(item);
  });

  // Atualiza total e contador
  updateCartSummary(cart);

  // Eventos dos botões de quantidade
  document.querySelectorAll(".decrease-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const index = e.target.getAttribute("data-index");
      changeQuantity(index, -1);
    });
  });

  document.querySelectorAll(".increase-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const index = e.target.getAttribute("data-index");
      changeQuantity(index, 1);
    });
  });

  // Alterar manualmente o campo
  document.querySelectorAll(".quantity-input").forEach((input) => {
    input.addEventListener("change", (e) => {
      const index = e.target.getAttribute("data-index");
      const value = parseInt(e.target.value);
      if (!isNaN(value) && value > 0) updateQuantity(index, value);
      else if (e.target) e.target.value = 1;
    });
  });

  // Excluir item
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const index = e.currentTarget.getAttribute("data-index");
      removeFromCart(index);
    });
  });

  // Botão continuar → página de pagamento
  if (checkoutBtn) {
    checkoutBtn.textContent = `Continuar (${cart.length})`;
    checkoutBtn.disabled = false;
    checkoutBtn.addEventListener("click", () => {
      window.location.href = "/pages/paymentPage.html";
    });
  }
}

// Altera quantidade via +/−
function changeQuantity(index, delta) {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const product = cart[index];
  if (!product) return;
  const newQuantity = (product.qty || 1) + delta;
  if (newQuantity < 1) return;
  product.qty = newQuantity;
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

// Atualiza quantidade manualmente
function updateQuantity(index, newQuantity) {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  if (!cart[index]) return;
  cart[index].qty = newQuantity;
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

// Remove produto
function removeFromCart(index) {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

// Atualiza total
function updateCartSummary(cart) {
  const total = cart.reduce((sum, p) => sum + p.price * (p.qty || 1), 0);
  const itemsCount = cart.reduce((s, p) => s + (p.qty || 1), 0);

  const summaryItemsEl = document.getElementById("summary-items");
  const summarySubtotalEl = document.getElementById("summary-subtotal");
  const summaryTotalEl = document.getElementById("summary-total");

  if (summaryItemsEl) summaryItemsEl.textContent = itemsCount;
  if (summarySubtotalEl)
    summarySubtotalEl.textContent = `R$ ${total.toFixed(2)}`;
  if (summaryTotalEl) summaryTotalEl.textContent = `R$ ${total.toFixed(2)}`;
}

document.addEventListener("DOMContentLoaded", renderCart);
