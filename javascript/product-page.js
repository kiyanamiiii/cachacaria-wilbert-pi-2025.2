import { API_URL } from "./constants.js";

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id") || 1;

  try {
    const res = await fetch(`${API_URL}/product/${productId}`);
    if (!res.ok) throw new Error("Erro ao carregar produto");

    const product = await res.json();

    // Dados do produto
    document.getElementById("page-title").innerText = product.name;
    document.getElementById("product-name").innerText = product.name;
    document.getElementById("product-description").innerText =
      product.description || "";
    document.getElementById("product-price").innerText =
      "R$ " + product.price.toFixed(2);
    document.getElementById("product-stock").innerText =
      product.stock > 0 ? "Em estoque" : "Indisponível";

    const mainImage = document.getElementById("main-image");
    if (product.photos && product.photos.length > 0) {
      mainImage.src = product.photos[0];
    } else {
      mainImage.src = "/assets/img/default.png";
    }

    // Miniaturas
    const thumbsContainer = document.getElementById("thumbnails");
    thumbsContainer.innerHTML = "";
    if (product.photos && product.photos.length > 0) {
      for (let photo of product.photos) {
        const img = document.createElement("img");
        img.src = photo;
        img.classList.add("img-fluid", "rounded", "thumb-img");
        img.alt = product.name;
        img.addEventListener("click", () => (mainImage.src = img.src));
        thumbsContainer.appendChild(img);
      }
    }

    // Carrinho e quantidade
    const addToCartBtn = document.getElementById("add-to-cart-btn");
    const cartAlert = document.getElementById("cart-alert");
    const qtyInput = document.getElementById("qty-input");
    const qtyDec = document.getElementById("qty-decrease");
    const qtyInc = document.getElementById("qty-increase");
    const totalPriceEl = document.getElementById("total-price");

    // Helper to format price
    const formatBR = (v) => "R$ " + v.toFixed(2).replace(".", ",");

    function updateTotalFromQty() {
      const q = Math.max(1, parseInt(qtyInput.value || 1, 10));
      const clamped = product.stock > 0 ? Math.min(q, product.stock) : q;
      qtyInput.value = clamped;
      totalPriceEl.innerText = formatBR((product.price || 0) * clamped);
    }

    qtyDec.addEventListener("click", () => {
      qtyInput.value = Math.max(1, parseInt(qtyInput.value || "1", 10) - 1);
      updateTotalFromQty();
    });
    qtyInc.addEventListener("click", () => {
      qtyInput.value = Math.min(
        product.stock || 9999,
        parseInt(qtyInput.value || "1", 10) + 1
      );
      updateTotalFromQty();
    });
    qtyInput.addEventListener("input", updateTotalFromQty);
    // initialize
    updateTotalFromQty();

    addToCartBtn.addEventListener("click", () => {
      let cart = JSON.parse(localStorage.getItem("cart")) || [];
      const imageUrl = product.photos && product.photos[0];
      const qty = Math.max(1, parseInt(qtyInput.value || "1", 10));

      // merge with existing item if present
      const existing = cart.find((c) => c.id === product.id);
      if (existing) {
        existing.qty = Math.min(
          (existing.qty || 0) + qty,
          product.stock || (existing.qty || 0) + qty
        );
      } else {
        cart.push({
          id: product.id,
          name: product.name,
          price: product.price,
          description: product.description,
          qty: qty,
          image: imageUrl, // Store the direct URL
        });
      }

      localStorage.setItem("cart", JSON.stringify(cart));

      // show alert
      cartAlert.classList.remove("d-none", "fade");
      cartAlert.classList.add("show");
      setTimeout(() => {
        cartAlert.classList.remove("show");
        cartAlert.classList.add("fade");
        setTimeout(() => cartAlert.classList.add("d-none"), 300);
      }, 3000);
    });
  } catch (err) {
    console.error(err);
  }
});
