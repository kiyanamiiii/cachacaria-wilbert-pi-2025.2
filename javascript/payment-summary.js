import { API_URL } from "./constants.js";

function formatPriceBR(value) {
  return value.toFixed(2).replace(".", ",");
}

document.addEventListener("DOMContentLoaded", async () => {
  const summaryBox = document.querySelector(".summary-box");
  if (!summaryBox) return;

  const list = summaryBox.querySelector("ul");
  const totalEl = summaryBox.querySelector(".total");

  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  // Clear existing list
  list.innerHTML = "";

  if (cart.length === 0) {
    list.innerHTML = `<li class="text-center text-muted">Carrinho vazio</li>`;
    if (totalEl) totalEl.textContent = "Total: R$ 0,00";
    return;
  }

  // Try to refresh product data from API; fall back to local cart data
  const refreshed = await Promise.all(
    cart.map(async (item) => {
      if (!item.id) return item;
      try {
        if (!res.ok) return item;
        const prod = await res.json();
        return {
          id: prod.id || item.id,
          name: prod.name || item.name,
          price: typeof prod.price === "number" ? prod.price : item.price,
          description: prod.description || item.description,
          qty: item.qty || 1,
          image: (prod.photos && prod.photos[0]) || item.image,
        };
      } catch (err) {
        return item;
      }
    })
  );

  // Render items
  let itemsTotal = 0;
  refreshed.forEach((p) => {
    const li = document.createElement("li");
    li.style.display = "flex";
    li.style.justifyContent = "space-between";
    li.style.marginBottom = "10px";
    const price = (p.price || 0) * (p.qty || 1);
    itemsTotal += price;

    li.innerHTML = `<span>${p.name} ${
      p.qty && p.qty > 1 ? "×" + p.qty : ""
    }</span> <span>R$ ${formatPriceBR(price)}</span>`;
    list.appendChild(li);
  });

  // Fixed shipping (if you have shipping calculation later, replace this)
  const shipping = 15.0;
  const shippingLi = document.createElement("li");
  shippingLi.style.display = "flex";
  shippingLi.style.justifyContent = "space-between";
  shippingLi.style.marginBottom = "10px";
  shippingLi.innerHTML = `<span>Frete</span> <span>R$ ${formatPriceBR(
    shipping
  )}</span>`;
  list.appendChild(shippingLi);

  const grandTotal = itemsTotal + shipping;
  if (totalEl) totalEl.textContent = `Total: R$ ${formatPriceBR(grandTotal)}`;
});
