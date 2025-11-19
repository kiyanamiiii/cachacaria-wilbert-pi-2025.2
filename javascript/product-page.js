import { API_URL } from "./constants.js";

async function getAuthToken() {
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("auth_token="))
    ?.split("=")[1];
  return token;
}

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id") || 1;

  try {
    const res = await fetch(`${API_URL}/product/${productId}`);
    if (!res.ok) throw new Error("Erro ao carregar produto");

    const product = await res.json();

    document.getElementById("page-title").innerText = product.name;
    document.getElementById("product-name").innerText = product.name;
    document.getElementById("product-description").innerText =
      product.description || "";
    document.getElementById("product-price").innerText =
      "R$ " + product.price.toFixed(2);
    document.getElementById("product-stock").innerText = product.stock;

    const mainImage = document.getElementById("main-image");
    if (product.photos?.length > 0) {
      mainImage.src = product.photos[0];
    } else {
      mainImage.src = "/assets/img/default.png";
    }

    const thumbsContainer = document.getElementById("thumbnails");
    thumbsContainer.innerHTML = "";
    if (product.photos?.length > 0) {
      for (let photo of product.photos) {
        const img = document.createElement("img");
        img.src = photo;
        img.classList.add("img-fluid", "rounded", "thumb-img");
        img.alt = product.name;
        img.addEventListener("click", () => (mainImage.src = img.src));
        thumbsContainer.appendChild(img);
      }
    }

    const addToCartBtn = document.getElementById("add-to-cart-btn");
    const cartAlert = document.getElementById("cart-alert");
    const qtyInput = document.getElementById("qty-input");
    const qtyDec = document.getElementById("qty-decrease");
    const qtyInc = document.getElementById("qty-increase");
    const totalPriceEl = document.getElementById("total-price");

    const formatBR = (v) => "R$ " + v.toFixed(2).replace(".", ",");

    function updateTotalFromQty() {
      const q = Math.max(1, parseInt(qtyInput.value || 1, 10));
      const clamped = Math.min(q, product.stock || q);
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
    updateTotalFromQty();

    addToCartBtn.addEventListener("click", async () => {
      const token = await getAuthToken();
      if (!token) {
        alert("Você precisa estar logado para adicionar ao carrinho.");
        window.location.href = "/pages/login.html";
        return;
      }

      const quantity = Math.max(1, parseInt(qtyInput.value || "1", 10));

      try {
        const res = await fetch(`${API_URL}/cart`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            product_id: product.id,
            quantity: quantity,
          }),
        });

        if (!res.ok) {
          console.error(await res.text());
          throw new Error("Erro ao adicionar ao carrinho");
        }

        const data = await res.json();

        if (data['status'] !== 0) {
          alert(data['message']);
          return;
        }

        cartAlert.classList.remove("d-none", "fade");
        cartAlert.classList.add("show");
        setTimeout(() => {
          cartAlert.classList.remove("show");
          cartAlert.classList.add("fade");
          setTimeout(() => cartAlert.classList.add("d-none"), 300);
        }, 3000);
      } catch (err) {
        console.error(err);
        alert("Falha ao adicionar ao carrinho.");
      }
    });
  } catch (err) {
    console.error(err);
  }
});
