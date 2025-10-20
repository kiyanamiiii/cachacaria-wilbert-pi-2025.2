import { API_URL } from './constants.js';

function renderCart() {
  const container = document.getElementById("cart-products");
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  container.innerHTML = "";

  // Caso o carrinho esteja vazio
  if (cart.length === 0) {
    container.innerHTML = `
      <p>Carrinho vazio? Continue explorando</p>
      <button class="btn btn-primary" onclick="window.location.href='/index.html'">
        Acessar
      </button>
    `;
    document.querySelector(".preco p").textContent = "Estimativa total: R$ 0,00";
    document.querySelector(".preco button").textContent = "Continuar (0)";
    return;
  }

  // Renderiza cada produto
  cart.forEach((product, index) => {
    const item = document.createElement("div");
    item.className = "card mb-3 shadow-sm p-3 d-flex flex-row justify-content-between align-items-center";

    item.innerHTML = `
      <div class="d-flex align-items-center gap-3">
        <img src="${product.image}" alt="${product.name}" style="width: 100px; border-radius: 8px;">
        <div>
          <h5 class="mb-1">${product.name}</h5>
          <p class="mb-1 text-muted">${product.description || ""}</p>
          <p class="fw-bold mb-0">R$ ${product.price.toFixed(2)}</p>
        </div>
      </div>

      <button class="btn btn-outline-danger btn-sm delete-btn" data-index="${index}">
        <i class="bi bi-trash"></i> Excluir
      </button>
    `;

    container.appendChild(item);
  });

  // Atualiza total e contador
  const total = cart.reduce((sum, p) => sum + p.price, 0);
  document.querySelector(".preco p").textContent = `Estimativa total: R$ ${total.toFixed(2)}`;
  document.querySelector(".preco button").textContent = `Continuar (${cart.length})`;

  // Adiciona eventos aos botões de exclusão
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const index = e.currentTarget.getAttribute("data-index");
      removeFromCart(index);
    });
  });
}

// Função para remover um produto do carrinho
function removeFromCart(index) {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.splice(index, 1); // Remove o item pelo índice
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart(); // Re-renderiza o carrinho atualizado
}

document.addEventListener("DOMContentLoaded", renderCart);
