import { API_URL } from './constants.js';

function renderCart() {
  const container = document.getElementById("cart-products");
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  container.innerHTML = "";

  if (cart.length === 0) {
    container.innerHTML = `
      <p class="text-center text-muted mt-3">
        Carrinho vazio? Continue explorando
      </p>
      <div class="text-center">
        <button class="btn btn-primary" onclick="window.location.href='/index.html'">
          Acessar
        </button>
      </div>
    `;
    document.querySelector(".preco p").textContent = "Estimativa total: R$ 0,00";
    document.querySelector(".preco button").textContent = "Continuar (0)";
    return;
  }

  // Renderiza os produtos
  cart.forEach((product, index) => {
    const quantity = product.qty || 1;

    const item = document.createElement("div");
    item.className = "card mb-3 shadow-sm p-3 d-flex flex-row justify-content-between align-items-center";

    item.innerHTML = `
      <div class="d-flex align-items-center gap-3">
        <img src="${product.image}" alt="${product.name}" style="width: 100px; border-radius: 8px;">
        <div>
          <h5 class="mb-1">${product.name}</h5>
          <p class="mb-1 text-muted">${product.description || ""}</p>
          <p class="fw-bold mb-0 text-success">R$ ${product.price.toFixed(2)}</p>
          <small class="text-muted">Preço unitário</small>
          <div class="mt-2 d-flex align-items-center gap-2">
            <label class="fw-semibold mb-0">Quantidade</label>
            <div class="quantity-group" data-index="${index}">
  <button class="decrease-btn" type="button" data-index="${index}">−</button>
  <input type="text" class="quantity-input" value="${quantity}" data-index="${index}">
  <button class="increase-btn" type="button" data-index="${index}">+</button>
</div>
          </div>
        </div>
      </div>

      <button class="btn btn-outline-danger btn-sm delete-btn" data-index="${index}">
        <i class="bi bi-trash"></i>
      </button>
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
  const continueBtn = document.querySelector(".preco button");
  continueBtn.textContent = `Continuar (${cart.length})`;
  continueBtn.addEventListener("click", () => {
    window.location.href = "/pages/paymentPage.html";
  });
}

// Altera quantidade via +/−
function changeQuantity(index, delta) {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const product = cart[index];
  const newQuantity = (product.qty || 1) + delta;
  if (newQuantity < 1) return;
  product.qty = newQuantity;
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

// Atualiza quantidade manualmente
function updateQuantity(index, newQuantity) {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
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
  document.querySelector(".preco p").textContent = `Estimativa total: R$ ${total.toFixed(2)}`;
}

document.addEventListener("DOMContentLoaded", renderCart);
