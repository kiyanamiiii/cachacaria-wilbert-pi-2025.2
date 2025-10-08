function renderCart() {
  const container = document.getElementById("cart-products");
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  container.innerHTML = "";

  if (cart.length === 0) {
    container.innerHTML = `
        <p>Carrinho vazio? Continue explorando</p>
        <button onclick="window.location.href='/index.html'">Acessar</button>
      `;
    return;
  }

  cart.forEach((product) => {
    const item = document.createElement("div");
    item.style.border = "1px solid #ddd";
    item.style.borderRadius = "10px";
    item.style.padding = "15px";
    item.style.margin = "10px 0";
    item.style.display = "flex";
    item.style.alignItems = "center";
    item.style.gap = "15px";

    console.log(product);

    item.innerHTML = `
        <img src="${product.image}" alt="${
      product.name
    }" style="width: 100px; border-radius: 8px;">
        <div style="text-align: left;">
          <h3>${product.name}</h3>
          <p>${product.description}</p>
          <p><strong>R$ ${product.price.toFixed(2)}</strong></p>
        </div>
      `;

    container.appendChild(item);
  });

  // Atualiza total e contador
  const total = cart.reduce((sum, p) => sum + p.price, 0);
  document.querySelector(
    ".preco p"
  ).textContent = `Estimativa total: R$ ${total.toFixed(2)}`;
  document.querySelector(
    ".preco button"
  ).textContent = `Continuar (${cart.length})`;
}

document.addEventListener("DOMContentLoaded", renderCart);
